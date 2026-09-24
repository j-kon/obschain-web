import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUp, X, Radio } from 'lucide-react';
import { ChainEvent, EventType, EventSeverity } from '../types';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';

interface EventFeedProps {
  events: ChainEvent[];
  limit?: number;
  newEventCount?: number;
  onClearNewEvents?: () => void;
}

type FilterCategory =
  | 'ALL'
  | 'LARGE_TRANSFER'
  | 'DORMANT_COINS_MOVED'
  | 'CONSOLIDATION'
  | 'FAN_OUT'
  | 'EXTREME_FEE'
  | 'TRANSACTION_REPLACEMENT'
  | 'LONG_BLOCK_INTERVAL';

type TimeFilter = 'ALL' | '1H' | '24H' | '7D';

const CATEGORY_TABS: { id: FilterCategory; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'LARGE_TRANSFER', label: 'Large Transfers' },
  { id: 'DORMANT_COINS_MOVED', label: 'Dormant Coins' },
  { id: 'CONSOLIDATION', label: 'Consolidations' },
  { id: 'FAN_OUT', label: 'Fan-Outs' },
  { id: 'EXTREME_FEE', label: 'Extreme Fees' },
  { id: 'TRANSACTION_REPLACEMENT', label: 'Replacements' },
  { id: 'LONG_BLOCK_INTERVAL', label: 'Block Events' },
];

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  limit,
  newEventCount = 0,
  onClearNewEvents,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('ALL');
  const [severity, setSeverity] = useState<EventSeverity | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');

  const filteredEvents = useMemo(() => {
    const now = Date.now();

    return events.filter((ev) => {
      // 1. Category Filter
      if (category !== 'ALL') {
        if (category === 'DORMANT_COINS_MOVED') {
          if (
            ev.event_type !== 'DORMANT_COINS_MOVED' &&
            ev.event_type !== ('DORMANT_UTXO_SPENT' as EventType)
          ) {
            return false;
          }
        } else if (category === 'EXTREME_FEE') {
          if (
            ev.event_type !== 'EXTREME_FEE' &&
            ev.event_type !== ('FEE_SPIKE' as EventType)
          ) {
            return false;
          }
        } else if (category === 'TRANSACTION_REPLACEMENT') {
          if (
            ev.event_type !== 'TRANSACTION_REPLACEMENT' &&
            ev.event_type !== ('RBF_REPLACEMENT' as EventType)
          ) {
            return false;
          }
        } else if (ev.event_type !== category) {
          return false;
        }
      }

      // 2. Severity Filter
      if (severity !== 'ALL' && ev.severity !== severity) {
        return false;
      }

      // 3. Time Filter
      if (timeFilter !== 'ALL') {
        const evTime = new Date(ev.detected_at).getTime();
        const ageMs = now - evTime;
        if (timeFilter === '1H' && ageMs > 60 * 60 * 1000) return false;
        if (timeFilter === '24H' && ageMs > 24 * 60 * 60 * 1000) return false;
        if (timeFilter === '7D' && ageMs > 7 * 24 * 60 * 60 * 1000) return false;
      }

      // 4. Search Filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesTitle = ev.title.toLowerCase().includes(query);
        const matchesDesc = ev.description.toLowerCase().includes(query);
        const matchesTxid = ev.txid?.toLowerCase().includes(query) ?? false;
        const matchesBlock =
          ev.block_hash?.toLowerCase().includes(query) ||
          String(ev.block_height || '').includes(query);
        const matchesId = ev.id.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesTxid && !matchesBlock && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [events, category, severity, timeFilter, search]);

  const displayedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  const hasActiveFilters =
    category !== 'ALL' || severity !== 'ALL' || timeFilter !== 'ALL' || search.trim() !== '';

  const handleResetFilters = () => {
    setCategory('ALL');
    setSeverity('ALL');
    setTimeFilter('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Pills (Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin text-xs font-mono">
        {CATEGORY_TABS.map((tab) => {
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-amber-500 text-black font-semibold border-amber-400 shadow-sm'
                  : 'bg-surface-panel/80 text-slate-300 hover:text-white hover:bg-surface-card border-surface-border'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, description, TXID, block, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-surface-panel border border-surface-border rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Severity selector */}
          <div className="relative flex items-center">
            <Filter className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as EventSeverity | 'ALL')}
              className="bg-surface-panel border border-surface-border rounded-lg text-xs text-slate-200 pl-8 pr-7 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          {/* Time range selector */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="bg-surface-panel border border-surface-border rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
          >
            <option value="ALL">All Time</option>
            <option value="1H">Past 1 Hour</option>
            <option value="24H">Past 24 Hours</option>
            <option value="7D">Past 7 Days</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-2 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Floating New Events Indicator when user is scrolled */}
      {newEventCount > 0 && onClearNewEvents && (
        <div className="sticky top-20 z-30 flex justify-center animate-bounce">
          <button
            onClick={onClearNewEvents}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs shadow-lg transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {newEventCount} new event{newEventCount > 1 ? 's' : ''} observed &bull; Jump to top
            </span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Event List or Empty State */}
      {displayedEvents.length === 0 ? (
        <EmptyState
          title="No qualifying events found"
          description={
            hasActiveFilters
              ? 'No observations match your current filter parameters.'
              : 'No qualifying Bitcoin events observed yet. Waiting for incoming chain activity...'
          }
          actionText={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : (
        <div className="space-y-3.5">
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
