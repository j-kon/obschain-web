import { useState, useEffect, useCallback } from 'react';
import { fetchEventObservations } from '../api';
import { EventObservation } from '../types';

export interface UseEventObservationsResult {
  observations: EventObservation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch chronological observation lifecycle records and witnesses.
 * Uses bounded cache to avoid redundant calls.
 * Non-blocking: errors do not crash parent event view.
 */
export function useEventObservations(
  eventId?: string | null,
  initialObservations?: EventObservation[]
): UseEventObservationsResult {
  const [observations, setObservations] = useState<EventObservation[]>(initialObservations || []);
  const [loading, setLoading] = useState<boolean>(!initialObservations && Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  const loadObservations = useCallback(
    async (bypassCache = false) => {
      if (!eventId) {
        setObservations([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchEventObservations(eventId, bypassCache);
        setObservations(data.observations || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve event observations';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    let active = true;

    if (!eventId || initialObservations) {
      return;
    }

    setLoading(true);
    setError(null);

    fetchEventObservations(eventId)
      .then((data) => {
        if (active) {
          setObservations(data.observations || []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve event observations';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [eventId, initialObservations]);

  const refetch = useCallback(async () => {
    await loadObservations(true);
  }, [loadObservations]);

  return {
    observations,
    loading,
    error,
    refetch,
  };
}
