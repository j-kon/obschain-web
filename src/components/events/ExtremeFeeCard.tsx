import React from 'react';
import { Flame } from 'lucide-react';
import { ChainEvent, ExtremeFeeMetadata } from '../../types';
import {
  formatBtcFromSats,
  formatFeeRate,
  formatSats,
} from '../../utils/formatters';

interface ExtremeFeeCardProps {
  event: ChainEvent;
}

export const ExtremeFeeCard: React.FC<ExtremeFeeCardProps> = ({ event }) => {
  const meta = event.metadata as unknown as Partial<ExtremeFeeMetadata>;

  const triggerLabels: Record<string, string> = {
    BOTH: 'High Fee Rate + High Absolute Fee',
    HIGH_ABSOLUTE_FEE: 'High Absolute Fee Threshold Exceeded',
    HIGH_FEE_RATE: 'High Fee Rate Threshold Exceeded',
  };

  const triggerText = meta.fee_trigger_type
    ? triggerLabels[meta.fee_trigger_type] || meta.fee_trigger_type
    : 'Extreme Fee Anomaly';

  const feeBtc =
    meta.fee_sats !== undefined
      ? formatBtcFromSats(meta.fee_sats, { maxDecimals: 6, minDecimals: 4 })
      : meta.fee_btc !== undefined
      ? `${meta.fee_btc.toFixed(6)} BTC`
      : null;

  const feeRate = formatFeeRate(meta.fee_rate_sat_vb);

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-red-950/20 border border-red-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider block">
            Extreme Fee Observed
          </span>
          {feeBtc && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {feeBtc}
              </span>
              {meta.fee_sats !== undefined && (
                <span className="text-xs font-mono text-slate-400">
                  ({formatSats(meta.fee_sats)})
                </span>
              )}
            </div>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-900/40 border border-red-600/50 text-red-300 font-mono text-xs font-semibold">
          <Flame className="w-3.5 h-3.5" />
          Fee Anomaly
        </span>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
          <span className="text-slate-400 block text-[10px] uppercase">
            Fee Rate
          </span>
          <span className="text-red-400 font-bold text-sm">{feeRate}</span>
        </div>

        {meta.vsize !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Virtual Size
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.vsize.toLocaleString()} vB
            </span>
          </div>
        )}

        {meta.total_input_sats !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Total Input
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {formatBtcFromSats(meta.total_input_sats)}
            </span>
          </div>
        )}

        <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
          <span className="text-slate-400 block text-[10px] uppercase">
            Trigger Reason
          </span>
          <span className="text-slate-300 font-semibold text-xs truncate block" title={triggerText}>
            {triggerText}
          </span>
        </div>
      </div>
    </div>
  );
};
