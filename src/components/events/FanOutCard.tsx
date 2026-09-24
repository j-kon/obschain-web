import React from 'react';
import { GitBranch } from 'lucide-react';
import { ChainEvent, FanOutMetadata } from '../../types';
import { formatBtcFromSats } from '../../utils/formatters';

interface FanOutCardProps {
  event: ChainEvent;
}

export const FanOutCard: React.FC<FanOutCardProps> = ({ event }) => {
  const meta = event.metadata as unknown as Partial<FanOutMetadata>;

  const distributedBtc =
    meta.total_distributed_sats !== undefined
      ? formatBtcFromSats(meta.total_distributed_sats)
      : meta.total_distributed_btc !== undefined
      ? `${meta.total_distributed_btc.toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })} BTC`
      : null;

  const medianOutputBtc =
    meta.median_output_sats !== undefined
      ? formatBtcFromSats(meta.median_output_sats, { trimTrailingZeros: true })
      : null;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">
            Fan-Out Distribution
          </span>
          {distributedBtc && (
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {distributedBtc}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-900/40 border border-purple-600/50 text-purple-300 font-mono text-xs font-semibold">
          <GitBranch className="w-3.5 h-3.5" />
          Fan-Out
        </span>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {meta.input_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Inputs
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.input_count}
            </span>
          </div>
        )}

        {meta.output_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Outputs
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.output_count.toLocaleString()}
            </span>
          </div>
        )}

        {medianOutputBtc && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Median Output
            </span>
            <span className="text-purple-400 font-bold text-sm">
              {medianOutputBtc}
            </span>
          </div>
        )}

        {meta.output_input_ratio !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Branch Ratio
            </span>
            <span className="text-slate-200 font-bold text-sm">
              1:{meta.output_input_ratio.toFixed(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
