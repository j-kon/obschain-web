import React from 'react';
import { Timer } from 'lucide-react';
import { ChainEvent, LongBlockIntervalMetadata } from '../../types';

interface LongBlockIntervalCardProps {
  event: ChainEvent;
}

export const LongBlockIntervalCard: React.FC<LongBlockIntervalCardProps> = ({
  event,
}) => {
  const meta = event.metadata as unknown as Partial<LongBlockIntervalMetadata>;

  const intervalMin =
    meta.interval_minutes !== undefined
      ? meta.interval_minutes
      : meta.interval_seconds !== undefined
      ? meta.interval_seconds / 60
      : null;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
            Extended Block Interval
          </span>
          {intervalMin !== null && (
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {intervalMin.toFixed(1)}{' '}
              <span className="text-sm font-normal text-slate-400">minutes</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/40 border border-amber-600/50 text-amber-300 font-mono text-xs font-semibold">
          <Timer className="w-3.5 h-3.5" />
          Interval Anomaly
        </span>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
        <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
          <span className="text-slate-400 block text-[10px] uppercase">
            Target Interval
          </span>
          <span className="text-slate-300 font-semibold text-sm">10.0 min</span>
        </div>

        <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
          <span className="text-slate-400 block text-[10px] uppercase">
            Delay Above Target
          </span>
          <span className="text-amber-400 font-bold text-sm">
            {intervalMin !== null ? `+${(intervalMin - 10).toFixed(1)} min` : 'N/A'}
          </span>
        </div>

        {meta.previous_block_hash && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Preceding Block
            </span>
            <span
              className="text-slate-300 font-semibold text-xs truncate block"
              title={meta.previous_block_hash}
            >
              {meta.previous_block_hash.slice(0, 16)}...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
