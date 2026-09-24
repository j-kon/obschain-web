import {
  ChainEvent,
  EventsResponse,
  Incident,
  IncidentsResponse,
  SystemStatus,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_OBSCHAIN_API_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errMsg = `API error ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson?.error) {
          errMsg = errJson.error;
        }
      } catch {
        // use default error message
      }
      throw new ApiError(res.status, errMsg);
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      `Failed to connect to ObsChain backend at ${API_BASE_URL}. Ensure the backend service is running. Details: ${(error as Error).message}`
    );
  }
}

export const api = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    return fetchJson<{ status: string; timestamp: string; version: string }>('/health');
  },

  async getStatus(): Promise<SystemStatus> {
    return fetchJson<SystemStatus>('/api/v1/status');
  },

  async getEvents(limit = 50, offset = 0): Promise<EventsResponse> {
    return fetchJson<EventsResponse>(`/api/v1/events?limit=${limit}&offset=${offset}`);
  },

  async getEventById(id: string): Promise<ChainEvent> {
    return fetchJson<ChainEvent>(`/api/v1/events/${id}`);
  },

  async getIncidents(limit = 50, offset = 0): Promise<IncidentsResponse> {
    return fetchJson<IncidentsResponse>(`/api/v1/incidents?limit=${limit}&offset=${offset}`);
  },

  async getIncidentById(id: string): Promise<Incident> {
    return fetchJson<Incident>(`/api/v1/incidents/${id}`);
  },
};
