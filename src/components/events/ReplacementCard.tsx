import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { ChainEvent, ReplacementMetadata } from '../../types';
import { formatFeeRate, formatSats } from '../../utils/formatters';
import { TransactionLink } from '../TransactionLink';

interface ReplacementCardProps {
  event: ChainEvent;
}

export const ReplacementCard: React.FC<ReplacementCardProps> = ({ event }) => {
  const meta = event.metadata as unknown as Partial<ReplacementMetadata>;

  const deltaFormatted =
    meta.fee_delta_sats !== undefined
      ? `${meta.fee_delta_sats >= 0 ? '+' : ''}${formatSats(meta.fee_delta_sats)}`
      : null;

  const percentFormatted =
    meta.fee_increase_percent !== undefined && meta.fee_increase_percent !== null
      ? `+${meta.fee_increase_percent.toFixed(1)}%`
      : null;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
            Transaction Replacement (RBF)
          </span>
          <div className="flex items-baseline gap-2">
            {deltaFormatted && (
              <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                {deltaFormatted}
              </span>
            )}
            {percentFormatted && (
              <span className="text-sm font-mono text-emerald-400/90 font-semibold">
                ({percentFormatted})
              </span>
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-900/40 border border-indigo-600/50 text-indigo-300 font-mono text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5" />
          RBF Replacement
        </span>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
          <span className="text-slate-400 block text-[10px] uppercase">
            Replaced TXs
          </span>
          <span className="text-slate-200 font-bold text-sm">
            {meta.replaced_count ?? meta.replaced_txids?.length ?? 1}
          </span>
        </div>

        {meta.old_fee_sats !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Previous Fee
            </span>
            <span className="text-slate-300 font-semibold text-xs">
              {formatSats(meta.old_fee_sats)}
              {meta.old_fee_rate_sat_vb && (
                <span className="text-[10px] text-slate-400 block">
                  ({formatFeeRate(meta.old_fee_rate_sat_vb)})
                </span>
              )}
            </span>
          </div>
        )}

        {meta.new_fee_sats !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Replacement Fee
            </span>
            <span className="text-emerald-400 font-bold text-xs">
              {formatSats(meta.new_fee_sats)}
              {meta.new_fee_rate_sat_vb && (
                <span className="text-[10px] text-slate-400 block">
                  ({formatFeeRate(meta.new_fee_rate_sat_vb)})
                </span>
              )}
            </span>
          </div>
        )}

        <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
          <span className="text-slate-400 block text-[10px] uppercase">
            Fee Delta
          </span>
          <span className="text-emerald-400 font-bold text-sm">
            {deltaFormatted || 'N/A'}
          </span>
        </div>
      </div>

      {/* Replacement TXID list if multiple */}
      {meta.replaced_txids && meta.replaced_txids.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
          <span className="text-slate-400">Replaced:</span>
          {meta.replaced_txids.slice(0, 3).map((txid) => (
            <TransactionLink key={txid} txid={txid} truncate={true} />
          ))}
          {meta.replaced_txids.length > 3 && (
            <span className="text-slate-400 text-[10px]">
              +{meta.replaced_txids.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};
