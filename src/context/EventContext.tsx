import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { ChainEvent, ConnectionState, SystemStatus } from '../types';
import { fetchEvents, fetchStatus, ObsChainWebSocketClient } from '../api';

export const MAX_RETAINED_EVENTS = 500;

interface EventContextValue {
  events: ChainEvent[];
  status: SystemStatus | null;
  connectionState: ConnectionState;
  loading: boolean;
  error: string | null;
  newEventCount: number;
  isScrolled: boolean;
  clearNewEventCount: () => void;
  refresh: () => Promise<void>;
  eventsObservedCount: number;
  tipHeight: number | null;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('connecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEventCount, setNewEventCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const wsClientRef = useRef<ObsChainWebSocketClient | null>(null);
  const isScrolledRef = useRef(false);

  // Track window scroll to know whether user is reading historical events
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 200;
      isScrolledRef.current = scrolled;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setNewEventCount(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Deduplicate and insert live incoming event
  const handleLiveEvent = useCallback((incoming: ChainEvent) => {
    setEvents((prev) => {
      // Deduplicate by event ID
      if (prev.some((e) => e.id === incoming.id)) {
        return prev;
      }

      // If user is scrolled down, increment unviewed events badge
      if (isScrolledRef.current) {
        setNewEventCount((count) => count + 1);
      }

      const updated = [incoming, ...prev];
      // Keep sorted newest-first
      updated.sort((a, b) => {
        const timeA = new Date(a.detected_at).getTime();
        const timeB = new Date(b.detected_at).getTime();
        return timeB - timeA;
      });

      // Cap at MAX_RETAINED_EVENTS to avoid browser memory growth
      return updated.slice(0, MAX_RETAINED_EVENTS);
    });

    // Update status counters optimistically
    setStatus((prevStatus) => {
      if (!prevStatus) return prevStatus;
      return {
        ...prevStatus,
        events_detected: prevStatus.events_detected + 1,
        tip_height: incoming.block_height
          ? Math.max(prevStatus.tip_height, incoming.block_height)
          : prevStatus.tip_height,
      };
    });
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [eventsRes, statusRes] = await Promise.all([
        fetchEvents(100, 0).catch((err) => {
          console.warn('Initial events fetch failed:', err);
          return { events: [], count: 0, limit: 100, offset: 0, is_mock_feed: false };
        }),
        fetchStatus().catch((err) => {
          console.warn('Initial status fetch failed:', err);
          return null;
        }),
      ]);

      if (statusRes) {
        setStatus(statusRes);
      }

      if (eventsRes?.events) {
        setEvents((prevLive) => {
          // Merge fetched REST events with any live events received, deduplicating by ID
          const existingIds = new Set(prevLive.map((e) => e.id));
          const newFromRest = eventsRes.events.filter((e) => !existingIds.has(e.id));
          const merged = [...prevLive, ...newFromRest];
          merged.sort(
            (a, b) =>
              new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
          );
          return merged.slice(0, MAX_RETAINED_EVENTS);
        });
      }

      if (!statusRes && (!eventsRes || eventsRes.events.length === 0)) {
        // Honest error when backend is genuinely offline
        setError('Unable to reach ObsChain backend service.');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load + setup WebSocket
  useEffect(() => {
    let isMounted = true;

    refresh();

    // Setup WebSocket client singleton for context lifecycle
    const wsClient = new ObsChainWebSocketClient();
    wsClientRef.current = wsClient;

    const unsubState = wsClient.onStateChange((state) => {
      if (isMounted) {
        setConnectionState(state);
      }
    });

    const unsubEvent = wsClient.onEvent((event) => {
      if (isMounted) {
        handleLiveEvent(event);
      }
    });

    wsClient.connect();

    // Telemetry polling interval (every 10s) to keep block height & detectors in sync
    const statusInterval = setInterval(() => {
      if (isMounted) {
        fetchStatus()
          .then((s) => {
            if (isMounted) setStatus(s);
          })
          .catch(() => {
            // Keep existing status if transient failure
          });
      }
    }, 10_000);

    return () => {
      isMounted = false;
      clearInterval(statusInterval);
      unsubState();
      unsubEvent();
      wsClient.disconnect();
      wsClientRef.current = null;
    };
  }, [handleLiveEvent, refresh]);

  const clearNewEventCount = useCallback(() => {
    setNewEventCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const value: EventContextValue = {
    events,
    status,
    connectionState,
    loading,
    error,
    newEventCount,
    isScrolled,
    clearNewEventCount,
    refresh,
    eventsObservedCount: status?.events_detected ?? events.length,
    tipHeight: status?.tip_height ?? null,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useEvents(): EventContextValue {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
