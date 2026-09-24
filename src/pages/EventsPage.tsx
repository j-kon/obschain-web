import React, { useEffect, useState } from 'react';
import { Radio, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { ChainEvent } from '../types';
import { EventFeed } from '../components/EventFeed';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = () => {
    setLoading(true);
    setError(null);
    api
      .getEvents(100, 0)
      .then((res) => {
        setEvents(res.events || []);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-amber-500" />
            <span>Observed Chain Events</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Realtime Bitcoin network anomaly detections, structural spikes, and threshold triggers.
          </p>
        </div>

        <button
          onClick={loadEvents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Fetching events from ObsChain node..." rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={loadEvents} />
      ) : (
        <EventFeed events={events} />
      )}
    </div>
  );
};
