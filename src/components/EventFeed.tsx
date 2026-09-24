import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ChainEvent } from '../types';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';

interface EventFeedProps {
  events: ChainEvent[];
  limit?: number;
}

export const EventFeed: React.FC<EventFeedProps> = ({ events, limit }) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase()) ||
      ev.txid?.toLowerCase().includes(search.toLowerCase()) ||
      false;

    const matchesSeverity =
      selectedSeverity === 'ALL' || ev.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const displayedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by hash, txid, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-panel border border-surface-border rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-surface-panel border border-surface-border rounded-lg text-sm text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {displayedEvents.length === 0 ? (
        <EmptyState
          title="No events match filter"
          description="Try broadening your search term or severity filter."
          actionText="Reset filters"
          onAction={() => {
            setSearch('');
            setSelectedSeverity('ALL');
          }}
        />
      ) : (
        <div className="space-y-3">
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
