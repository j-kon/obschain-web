import React from 'react';
import { Radio, RefreshCw, Layers } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { EventFeed } from '../components/EventFeed';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { LiveIndicator } from '../components/LiveIndicator';

export const EventsPage: React.FC = () => {
  const {
    events,
    connectionState,
    loading,
    error,
    refresh,
    newEventCount,
    clearNewEventCount,
    eventsObservedCount,
  } = useEvents();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-amber-500" />
              <span>Observed Chain Events</span>
            </h1>
            <LiveIndicator state={connectionState} />
          </div>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Realtime Bitcoin network anomaly detections, structural spikes, dormant coin movements, and threshold triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-panel border border-surface-border text-xs font-mono text-slate-300">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{eventsObservedCount.toLocaleString()} Total Observed</span>
          </div>

          <button
            onClick={() => refresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-mono transition-colors"
            title="Refresh events from node"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading && events.length === 0 ? (
        <LoadingState message="Fetching events from ObsChain node..." rows={6} />
      ) : error && events.length === 0 ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : (
        <EventFeed
          events={events}
          newEventCount={newEventCount}
          onClearNewEvents={clearNewEventCount}
        />
      )}
    </div>
  );
};
