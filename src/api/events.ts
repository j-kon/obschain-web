import { apiFetch } from './client';
import { BoundedCache } from './cache';
import {
  ChainEvent,
  EventObservationsResponse,
  EventRarityResponse,
  EventsResponse,
} from '../types';

const rarityCache = new BoundedCache<string, EventRarityResponse>(200);
const observationsCache = new BoundedCache<string, EventObservationsResponse>(200);

export async function fetchEvents(limit = 50, offset = 0): Promise<EventsResponse> {
  return apiFetch<EventsResponse>(`/api/v1/events?limit=${limit}&offset=${offset}`);
}

export async function fetchEvent(id: string): Promise<ChainEvent> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<ChainEvent>(`/api/v1/events/${cleanId}`);
}

/**
 * Fetch full historical rarity and impact breakdown for an event.
 * Protected with bounded memory cache keyed on event_id + baseline_id.
 */
export async function fetchEventRarity(
  id: string,
  baselineId?: string,
  bypassCache = false
): Promise<EventRarityResponse> {
  const cleanId = encodeURIComponent(id.trim());
  const cacheKey = baselineId ? `${cleanId}:${baselineId}` : cleanId;

  if (!bypassCache) {
    const cached = rarityCache.get(cacheKey);
    if (cached) return cached;
  }

  const query = baselineId ? `?baseline_id=${encodeURIComponent(baselineId)}` : '';
  const result = await apiFetch<EventRarityResponse>(`/api/v1/events/${cleanId}/rarity${query}`);
  rarityCache.set(cacheKey, result);
  return result;
}

/**
 * Fetch chronological observation provenance and witnesses for an event.
 * Protected with bounded memory cache keyed on event_id.
 */
export async function fetchEventObservations(
  id: string,
  bypassCache = false
): Promise<EventObservationsResponse> {
  const cleanId = encodeURIComponent(id.trim());

  if (!bypassCache) {
    const cached = observationsCache.get(cleanId);
    if (cached) return cached;
  }

  const result = await apiFetch<EventObservationsResponse>(`/api/v1/events/${cleanId}/observations`);
  observationsCache.set(cleanId, result);
  return result;
}
