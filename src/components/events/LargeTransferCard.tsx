import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ChainEvent, LargeTransferMetadata } from '../../types';
import {
  formatBtcFromSats,
  formatFeeRate,
  formatSats,
} from '../../utils/formatters';

interface LargeTransferCardProps {
  event: ChainEvent;
}

export const LargeTransferCard: React.FC<LargeTransferCardProps> = ({ event }) => {
  const meta = event.metadata as unknown as Partial<LargeTransferMetadata>;

  const btcAmount =
    meta.total_output_sats !== undefined
      ? formatBtcFromSats(meta.total_output_sats)
      : meta.total_output_btc !== undefined
      ? `${meta.total_output_btc.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} BTC`
      : null;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
            Large Value Transfer
          </span>
          {btcAmount && (
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {btcAmount}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/40 border border-emerald-600/50 text-emerald-300 font-mono text-xs font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5" />
          High Value
        </span>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {meta.fee_sats !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Fee
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {formatSats(meta.fee_sats)}
            </span>
          </div>
        )}

        {meta.fee_rate_sat_vb !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Fee Rate
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {formatFeeRate(meta.fee_rate_sat_vb)}
            </span>
          </div>
        )}

        {meta.inputs_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Inputs
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.inputs_count}
            </span>
          </div>
        )}

        {meta.outputs_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Outputs
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.outputs_count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
