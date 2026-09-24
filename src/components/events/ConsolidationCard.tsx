import React from 'react';
import { GitMerge } from 'lucide-react';
import { ChainEvent, ConsolidationMetadata } from '../../types';
import { formatBtcFromSats, formatSats } from '../../utils/formatters';

interface ConsolidationCardProps {
  event: ChainEvent;
}

export const ConsolidationCard: React.FC<ConsolidationCardProps> = ({ event }) => {
  const meta = event.metadata as unknown as Partial<ConsolidationMetadata>;

  const consolidatedBtc =
    meta.total_input_sats !== undefined
      ? formatBtcFromSats(meta.total_input_sats)
      : null;

  const ratio =
    meta.input_output_ratio !== undefined
      ? `${meta.input_output_ratio.toFixed(1)}:1`
      : meta.input_count && meta.output_count
      ? `${(meta.input_count / meta.output_count).toFixed(1)}:1`
      : null;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-sky-950/20 border border-sky-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block">
            UTXO Consolidation
          </span>
          {consolidatedBtc && (
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {consolidatedBtc}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-900/40 border border-sky-600/50 text-sky-300 font-mono text-xs font-semibold">
          <GitMerge className="w-3.5 h-3.5" />
          Consolidation
        </span>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {meta.input_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Input Count
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.input_count.toLocaleString()}
            </span>
          </div>
        )}

        {meta.output_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Output Count
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.output_count.toLocaleString()}
            </span>
          </div>
        )}

        {ratio && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Input / Output Ratio
            </span>
            <span className="text-sky-400 font-bold text-sm">{ratio}</span>
          </div>
        )}

        {meta.fee_sats !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Consolidation Fee
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {formatSats(meta.fee_sats)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
