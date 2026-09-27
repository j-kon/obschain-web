import { useState, useEffect, useCallback } from 'react';
import { fetchEventRarity } from '../api';
import { ApiError } from '../api/client';
import { EventRarityResponse } from '../types';

export interface UseEventRarityResult {
  rarity: EventRarityResponse | null;
  loading: boolean;
  error: string | null;
  isUnavailable503: boolean;
  refetch: () => Promise<void>;
}

/**
 * Pure error normalization helper for rarity API failures.
 * Distinguishes temporary 503 service unavailability from permanent errors.
 */
export function mapRarityError(err: unknown): { isUnavailable503: boolean; error: string } {
  if (err instanceof ApiError && err.status === 503) {
    return {
      isUnavailable503: true,
      error: 'Historical rarity computation is temporarily unavailable from the backend indexer.',
    };
  }
  if (err instanceof ApiError && err.status === 404) {
    return {
      isUnavailable503: false,
      error: 'No historical rarity record found for this event in current baseline.',
    };
  }
  return {
    isUnavailable503: false,
    error: err instanceof Error ? err.message : 'Failed to retrieve event rarity analysis',
  };
}

/**
 * Custom hook to fetch historical rarity and impact data for an event.
 * Uses bounded cache in API layer to avoid redundant network requests.
 * Graciously isolates 503 Service Unavailable and general errors to ensure
 * parent components never crash or block event inspection.
 */
export function useEventRarity(
  eventId?: string | null,
  baselineId?: string,
  initialRarity?: EventRarityResponse | null,
  initialUnavailable503 = false
): UseEventRarityResult {
  const [rarity, setRarity] = useState<EventRarityResponse | null>(initialRarity || null);
  const [loading, setLoading] = useState<boolean>(!initialRarity && !initialUnavailable503 && Boolean(eventId));
  const [error, setError] = useState<string | null>(
    initialUnavailable503
      ? 'Historical rarity computation is temporarily unavailable from the backend indexer.'
      : null
  );
  const [isUnavailable503, setIsUnavailable503] = useState<boolean>(initialUnavailable503);

  const loadRarity = useCallback(
    async (bypassCache = false) => {
      if (!eventId) {
        setRarity(null);
        setLoading(false);
        setError(null);
        setIsUnavailable503(false);
        return;
      }

      setLoading(true);
      setError(null);
      setIsUnavailable503(false);

      try {
        const data = await fetchEventRarity(eventId, baselineId, bypassCache);
        setRarity(data);
      } catch (err: unknown) {
        const mapped = mapRarityError(err);
        setIsUnavailable503(mapped.isUnavailable503);
        setError(mapped.error);
      } finally {
        setLoading(false);
      }
    },
    [eventId, baselineId]
  );

  useEffect(() => {
    let active = true;

    if (!eventId || initialRarity || initialUnavailable503) {
      return;
    }

    setLoading(true);
    setError(null);
    setIsUnavailable503(false);

    fetchEventRarity(eventId, baselineId)
      .then((data) => {
        if (active) {
          setRarity(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const mapped = mapRarityError(err);
          setIsUnavailable503(mapped.isUnavailable503);
          setError(mapped.error);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [eventId, baselineId, initialRarity, initialUnavailable503]);

  const refetch = useCallback(async () => {
    await loadRarity(true);
  }, [loadRarity]);

  return {
    rarity,
    loading,
    error,
    isUnavailable503,
    refetch,
  };
}
