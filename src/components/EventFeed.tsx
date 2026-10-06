import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUp, X, Radio, ArrowUpDown, Sparkles, Database, Layers, ShieldCheck } from 'lucide-react';
import { ChainEvent, EventType, EventSeverity, RarityBand } from '../types';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';

interface EventFeedProps {
  events: ChainEvent[];
  limit?: number;
  newEventCount?: number;
  onClearNewEvents?: () => void;
  defaultRarityFilter?: RarityFilter;
}

export type FilterCategory =
  | 'ALL'
  | 'LARGE_TRANSFER'
  | 'DORMANT_COINS_MOVED'
  | 'CONSOLIDATION'
  | 'FAN_OUT'
  | 'EXTREME_FEE'
  | 'TRANSACTION_REPLACEMENT'
  | 'LONG_BLOCK_INTERVAL';

export type TimeFilter = 'ALL' | '1H' | '24H' | '7D';
export type RarityFilter = 'ALL' | RarityBand;
export type SortOption = 'NEWEST' | 'OLDEST' | 'SEVERITY' | 'RARITY_PERCENTILE';

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
  defaultRarityFilter = 'ALL',
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('ALL');
  const [severity, setSeverity] = useState<EventSeverity | 'ALL'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>(defaultRarityFilter);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  const filteredAndSortedEvents = useMemo(() => {
    const now = Date.now();

    const filtered = events.filter((ev) => {
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

      // 3. Rarity Band Filter
      if (rarityFilter !== 'ALL') {
        const band = ev.rarity?.primary?.band || ev.rarity?.primary?.rarity_band;
        if (band !== rarityFilter) {
          return false;
        }
      }

      // 4. Time Filter
      if (timeFilter !== 'ALL') {
        const evTime = new Date(ev.detected_at).getTime();
        const ageMs = now - evTime;
        if (timeFilter === '1H' && ageMs > 60 * 60 * 1000) return false;
        if (timeFilter === '24H' && ageMs > 24 * 60 * 60 * 1000) return false;
        if (timeFilter === '7D' && ageMs > 7 * 24 * 60 * 60 * 1000) return false;
      }

      // 5. Search Filter
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

    // Sorting (Respecting invariant: No cross-event Impact sorting allowed)
    const result = [...filtered];
    switch (sortBy) {
      case 'OLDEST':
        result.sort((a, b) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime());
        break;
      case 'SEVERITY': {
        const rank: Record<EventSeverity, number> = {
          CRITICAL: 5,
          HIGH: 4,
          MEDIUM: 3,
          LOW: 2,
          INFO: 1,
        };
        result.sort((a, b) => (rank[b.severity] || 0) - (rank[a.severity] || 0));
        break;
      }
      case 'RARITY_PERCENTILE': {
        result.sort((a, b) => {
          const pA = a.rarity?.primary?.percentile ?? -1;
          const pB = b.rarity?.primary?.percentile ?? -1;
          return pB - pA;
        });
        break;
      }
      case 'NEWEST':
      default:
        result.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
        break;
    }

    return result;
  }, [events, category, severity, rarityFilter, timeFilter, search, sortBy]);

  const displayedEvents = limit ? filteredAndSortedEvents.slice(0, limit) : filteredAndSortedEvents;

  const hasActiveFilters =
    category !== 'ALL' ||
    severity !== 'ALL' ||
    rarityFilter !== 'ALL' ||
    timeFilter !== 'ALL' ||
    search.trim() !== '' ||
    sortBy !== 'NEWEST';

  const handleResetFilters = () => {
    setCategory('ALL');
    setSeverity('ALL');
    setRarityFilter('ALL');
    setTimeFilter('ALL');
    setSearch('');
    setSortBy('NEWEST');
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
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search input */}
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

        {/* Filter selects row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rarity Band selector */}
          <div className="relative flex items-center">
            <Sparkles className="absolute left-2.5 w-3.5 h-3.5 text-amber-400 pointer-events-none" />
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value as RarityFilter)}
              className="bg-surface-panel border border-surface-border rounded-lg text-xs text-slate-200 pl-8 pr-7 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
              aria-label="Filter by Rarity Band"
            >
              <option value="ALL">All Rarity Bands</option>
              <option value="EXTREME">Extreme (&gt; 99.9%)</option>
              <option value="RARE">Rare (&gt; 99.0%)</option>
              <option value="UNUSUAL">Unusual (&gt; 95.0%)</option>
              <option value="NOTABLE">Notable (&gt; 90.0%)</option>
              <option value="COMMON">Common (&le; 90.0%)</option>
              <option value="INSUFFICIENT_DATA">Insufficient Data</option>
            </select>
          </div>

          {/* Severity selector */}
          <div className="relative flex items-center">
            <Filter className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as EventSeverity | 'ALL')}
              className="bg-surface-panel border border-surface-border rounded-lg text-xs text-slate-200 pl-8 pr-7 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
              aria-label="Filter by Severity"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-surface-panel border border-surface-border rounded-lg text-xs text-slate-200 pl-8 pr-7 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
              aria-label="Sort Events"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="SEVERITY">Severity Rank</option>
              <option value="RARITY_PERCENTILE">Highest Percentile</option>
            </select>
          </div>

          {/* Time range selector */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="bg-surface-panel border border-surface-border rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500/50 font-mono"
            aria-label="Filter by Time"
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
        <div className="space-y-6">
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

          {!hasActiveFilters && (
            <div className="bg-surface-panel/40 border border-surface-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Frozen Contract Acceptance Fixtures (Phase 7A)
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Pre-configured statistical scenarios
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mb-4 leading-relaxed">
                While local observer monitors live incoming blocks and mempool transactions, you can inspect each verified Phase 7A statistical contract state:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  to="/events/fixture-exact"
                  className="p-3.5 rounded-lg bg-surface-card hover:bg-surface-border/80 border border-surface-border transition-all group block"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-emerald-300 group-hover:text-emerald-200">
                      Exact Empirical Rarity
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      99.94% EXACT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    11 events ≥ value out of 18,421 comparable events. Full Impact Index (85.0/100).
                  </p>
                </Link>

                <Link
                  to="/events/fixture-estimated"
                  className="p-3.5 rounded-lg bg-surface-card hover:bg-surface-border/80 border border-surface-border transition-all group block"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-amber-300 group-hover:text-amber-200">
                      Estimated Rarity
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                      ≈ 99.47% ESTIMATE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Quantile interpolation estimate. Partial coverage impact score (42.5/100).
                  </p>
                </Link>

                <Link
                  to="/events/fixture-insufficient"
                  className="p-3.5 rounded-lg bg-surface-card hover:bg-surface-border/80 border border-surface-border transition-all group block"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-amber-400 group-hover:text-amber-300">
                      Insufficient Baseline Data
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      N &lt; 100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Sample size 37 &lt; 100 threshold. Null percentiles preserved. Never 0% or COMMON.
                  </p>
                </Link>

                <Link
                  to="/events/fixture-reorg"
                  className="p-3.5 rounded-lg bg-surface-card hover:bg-surface-border/80 border border-surface-border transition-all group block"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-sky-300 group-hover:text-sky-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Reorg Lifecycle</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60">
                      LIFECYCLE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    CONFIRMED → REORGED_OUT → MEMPOOL_SEEN chronology without attack implications.
                  </p>
                </Link>

                <Link
                  to="/events/fixture-witness"
                  className="p-3.5 rounded-lg bg-surface-card hover:bg-surface-border/80 border border-surface-border transition-all group block sm:col-span-2 lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-purple-300 group-hover:text-purple-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Multi-Witness Provenance</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                      PROVENANCE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Distinguishes primary witness (Core/ZMQ), corroborating witness (mempool.space), and historical reconstruction (Replay).
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>
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
