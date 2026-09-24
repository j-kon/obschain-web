import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ChevronRight,
  History,
  GitMerge,
  GitBranch,
  Flame,
  RefreshCw,
  ArrowUpRight,
  Timer,
  Activity,
} from 'lucide-react';
import { ChainEvent, EventType } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { EvidenceBadge } from './EvidenceBadge';
import { TransactionLink } from './TransactionLink';
import { BlockLink } from './BlockLink';
import { SourceBadge } from './SourceBadge';
import { formatRelativeTime, formatUtcTimestamp } from '../utils/formatters';

// Specialized Cards
import { DormantCoinsCard } from './events/DormantCoinsCard';
import { ConsolidationCard } from './events/ConsolidationCard';
import { FanOutCard } from './events/FanOutCard';
import { ExtremeFeeCard } from './events/ExtremeFeeCard';
import { ReplacementCard } from './events/ReplacementCard';
import { LargeTransferCard } from './events/LargeTransferCard';
import { LongBlockIntervalCard } from './events/LongBlockIntervalCard';

interface EventCardProps {
  event: ChainEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const relativeTime = formatRelativeTime(event.detected_at);
  const utcTime = formatUtcTimestamp(event.detected_at);

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'DORMANT_COINS_MOVED':
      case 'DORMANT_UTXO_SPENT':
        return <History className="w-4 h-4 text-amber-400" />;
      case 'CONSOLIDATION':
        return <GitMerge className="w-4 h-4 text-sky-400" />;
      case 'FAN_OUT':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'EXTREME_FEE':
      case 'FEE_SPIKE':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'TRANSACTION_REPLACEMENT':
      case 'RBF_REPLACEMENT':
        return <RefreshCw className="w-4 h-4 text-indigo-400" />;
      case 'LARGE_TRANSFER':
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case 'LONG_BLOCK_INTERVAL':
        return <Timer className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderSpecializedBody = () => {
    switch (event.event_type) {
      case 'DORMANT_COINS_MOVED':
      case 'DORMANT_UTXO_SPENT':
        return <DormantCoinsCard event={event} />;
      case 'CONSOLIDATION':
        return <ConsolidationCard event={event} />;
      case 'FAN_OUT':
        return <FanOutCard event={event} />;
      case 'EXTREME_FEE':
      case 'FEE_SPIKE':
        return <ExtremeFeeCard event={event} />;
      case 'TRANSACTION_REPLACEMENT':
      case 'RBF_REPLACEMENT':
        return <ReplacementCard event={event} />;
      case 'LARGE_TRANSFER':
        return <LargeTransferCard event={event} />;
      case 'LONG_BLOCK_INTERVAL':
        return <LongBlockIntervalCard event={event} />;
      default:
        return null;
    }
  };

  return (
    <article
      className="group relative bg-surface-panel/90 hover:bg-surface-panel border border-surface-border hover:border-surface-borderHover rounded-xl p-5 transition-all duration-200 shadow-sm animate-fadeIn"
      aria-label={`Event: ${event.title}`}
    >
      {/* Header bar: Badges, Type, Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={event.severity} size="sm" />
          <EvidenceBadge
            classification={
              event.confidence === 'VERIFIED_ON_CHAIN'
                ? 'ON_CHAIN_VERIFIED'
                : 'HEURISTIC'
            }
          />
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 uppercase tracking-wide bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60">
            {getEventIcon(event.event_type)}
            <span>{event.event_type.replace(/_/g, ' ')}</span>
          </span>
          {event.source && <SourceBadge source={event.source} short={true} />}
        </div>

        <div
          className="flex items-center gap-1.5 text-xs text-slate-400 font-mono"
          title={`Detected at ${utcTime}`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <time dateTime={event.detected_at}>{relativeTime}</time>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <Link
          to={`/events/${event.id}`}
          className="text-base sm:text-lg font-semibold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center justify-between gap-2 font-mono"
        >
          <span>{event.title}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>
        <p className="text-sm text-slate-300 mt-1 leading-relaxed font-sans">
          {event.description}
        </p>
      </div>

      {/* Specialized Metrics Card Body */}
      {renderSpecializedBody()}

      {/* Footer bar: TXID, Block Anchor, Mock indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3 border-t border-surface-border/60 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {event.txid && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono">TXID:</span>
              <TransactionLink txid={event.txid} />
            </div>
          )}

          {event.block_height && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono">Block:</span>
              <BlockLink height={event.block_height} hash={event.block_hash} />
            </div>
          )}
        </div>

        <Link
          to={`/events/${event.id}`}
          className="text-[11px] font-mono text-slate-400 hover:text-amber-400 transition-colors"
        >
          Full Investigation &rarr;
        </Link>
      </div>
    </article>
  );
};
