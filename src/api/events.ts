import { apiFetch } from './client';
import { ChainEvent, EventsResponse } from '../types';

export async function fetchEvents(limit = 50, offset = 0): Promise<EventsResponse> {
  return apiFetch<EventsResponse>(`/api/v1/events?limit=${limit}&offset=${offset}`);
}

export async function fetchEvent(id: string): Promise<ChainEvent> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<ChainEvent>(`/api/v1/events/${cleanId}`);
}
