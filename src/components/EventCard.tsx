import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { ChainEvent } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { EvidenceBadge } from './EvidenceBadge';
import { TransactionLink } from './TransactionLink';
import { BlockLink } from './BlockLink';

interface EventCardProps {
  event: ChainEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formattedDate = new Date(event.detected_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="group relative bg-surface-panel/80 hover:bg-surface-panel border border-surface-border hover:border-surface-borderHover rounded-lg p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={event.severity} />
          <EvidenceBadge
            classification={
              event.confidence === 'VERIFIED_ON_CHAIN'
                ? 'ON_CHAIN_VERIFIED'
                : 'HEURISTIC'
            }
          />
          <span className="font-mono text-xs text-slate-400 uppercase tracking-wide bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {event.event_type.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <time dateTime={event.detected_at}>{formattedDate}</time>
        </div>
      </div>

      <div className="mb-3">
        <Link
          to={`/events/${event.id}`}
          className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center justify-between"
        >
          <span>{event.title}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>
        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed font-sans">
          {event.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-surface-border/50 text-xs">
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

        {Boolean(event.metadata && (event.metadata as Record<string, unknown>).is_mock) && (
          <span className="ml-auto font-mono text-[10px] text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
            Mock Simulation
          </span>
        )}
      </div>
    </div>
  );
};
