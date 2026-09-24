import { API_BASE_URL } from './client';
import { ChainEvent, ConnectionState } from '../types';

/**
 * Safely derives the WebSocket URL from an HTTP/HTTPS base URL.
 */
export function getWebSocketUrl(baseUrl = API_BASE_URL): string {
  try {
    // If baseUrl is already a full URL
    if (baseUrl.startsWith('http://')) {
      return baseUrl.replace(/^http:\/\//, 'ws://').replace(/\/+$/, '') + '/api/v1/ws';
    }
    if (baseUrl.startsWith('https://')) {
      return baseUrl.replace(/^https:\/\//, 'wss://').replace(/\/+$/, '') + '/api/v1/ws';
    }
    if (baseUrl.startsWith('ws://') || baseUrl.startsWith('wss://')) {
      return baseUrl.endsWith('/api/v1/ws') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/api/v1/ws`;
    }

    // Relative path or empty in browser
    if (typeof window !== 'undefined') {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${proto}//${host}/api/v1/ws`;
    }
  } catch {
    // Fallback if parsing fails
  }

  return 'ws://localhost:8080/api/v1/ws';
}

export interface WebSocketClientOptions {
  url?: string;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  maxReconnectAttempts?: number;
}

export type EventCallback = (event: ChainEvent) => void;
export type StateCallback = (state: ConnectionState) => void;
export type ErrorCallback = (err: Event | Error) => void;

export class ObsChainWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed = false;

  private readonly initialDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly backoffMultiplier: number;
  private readonly maxReconnectAttempts: number;

  private eventListeners = new Set<EventCallback>();
  private stateListeners = new Set<StateCallback>();
  private errorListeners = new Set<ErrorCallback>();

  constructor(options?: WebSocketClientOptions) {
    this.url = options?.url || getWebSocketUrl();
    this.initialDelayMs = options?.initialDelayMs ?? 1000;
    this.maxDelayMs = options?.maxDelayMs ?? 15_000;
    this.backoffMultiplier = options?.backoffMultiplier ?? 1.6;
    this.maxReconnectAttempts = options?.maxReconnectAttempts ?? 100;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public onEvent(callback: EventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  public onStateChange(callback: StateCallback): () => void {
    this.stateListeners.add(callback);
    callback(this.state);
    return () => this.stateListeners.delete(callback);
  }

  public onError(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private setState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((cb) => {
        try {
          cb(newState);
        } catch (e) {
          console.error('Error in state listener:', e);
        }
      });
    }
  }

  public connect(): void {
    // If already open or connecting, do not create a duplicate socket
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.clearReconnectTimer();

    const isReconnecting = this.reconnectAttempts > 0;
    this.setState(isReconnecting ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.clearReconnectTimer();
        this.setState('connected');
      };

      this.ws.onmessage = (messageEvent: MessageEvent) => {
        try {
          if (!messageEvent.data || typeof messageEvent.data !== 'string') {
            return;
          }
          const rawEvent = JSON.parse(messageEvent.data) as ChainEvent;
          // Validate core fields exist to prevent bad payloads
          if (rawEvent && rawEvent.id && rawEvent.event_type) {
            this.eventListeners.forEach((cb) => {
              try {
                cb(rawEvent);
              } catch (e) {
                console.error('Error in event listener:', e);
              }
            });
          }
        } catch (parseError) {
          console.warn('Failed to parse WebSocket JSON event:', parseError);
        }
      };

      this.ws.onerror = (event: Event) => {
        this.errorListeners.forEach((cb) => {
          try {
            cb(event);
          } catch (e) {
            console.error('Error in error listener:', e);
          }
        });
        if (this.state !== 'reconnecting') {
          this.setState('error');
        }
      };

      this.ws.onclose = () => {
        this.ws = null;

        if (this.isIntentionallyClosed) {
          this.setState('disconnected');
          return;
        }

        this.scheduleReconnect();
      };
    } catch {
      this.ws = null;
      this.setState('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('disconnected');
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;

    // Calculate bounded exponential backoff with jitter
    const exponentialDelay =
      this.initialDelayMs * Math.pow(this.backoffMultiplier, this.reconnectAttempts - 1);
    const cappedDelay = Math.min(exponentialDelay, this.maxDelayMs);
    // 15% random jitter
    const jitter = cappedDelay * 0.15 * (Math.random() * 2 - 1);
    const delay = Math.max(500, Math.floor(cappedDelay + jitter));

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    this.clearReconnectTimer();

    if (this.ws) {
      // Remove handlers before close to avoid duplicate state transitions
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      try {
        this.ws.close(1000, 'Client intentional disconnect');
      } catch {
        // ignore close error
      }
      this.ws = null;
    }

    this.setState('disconnected');
  }
}
