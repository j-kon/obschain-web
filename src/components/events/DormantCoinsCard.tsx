import React from 'react';
import { History, ShieldAlert } from 'lucide-react';
import { ChainEvent, DormantCoinsMetadata } from '../../types';
import {
  formatAge,
  formatBtcFromSats,
  formatCoinAgeDestroyed,
} from '../../utils/formatters';

interface DormantCoinsCardProps {
  event: ChainEvent;
}

export const DormantCoinsCard: React.FC<DormantCoinsCardProps> = ({ event }) => {
  const meta = event.metadata as unknown as Partial<DormantCoinsMetadata>;

  const classificationLabels: Record<string, string> = {
    EARLY_BITCOIN: 'Early Bitcoin Era',
    ANCIENT: 'Ancient (15+ yrs)',
    VERY_OLD: 'Very Old (10+ yrs)',
    DORMANT: 'Dormant (5+ yrs)',
  };

  const classification = meta.classification
    ? classificationLabels[meta.classification] || meta.classification
    : null;

  const btcAmount =
    meta.total_dormant_sats !== undefined
      ? formatBtcFromSats(meta.total_dormant_sats)
      : meta.total_dormant_btc !== undefined
      ? `${meta.total_dormant_btc.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} BTC`
      : null;

  const oldestAge =
    meta.oldest_input_age_days !== undefined
      ? formatAge(meta.oldest_input_age_days, meta.oldest_input_age_seconds)
      : null;

  const cadFormatted = formatCoinAgeDestroyed(
    meta.coin_age_destroyed_btc_years,
    meta.coin_age_destroyed_btc_days
  );

  return (
    <div className="space-y-3">
      {/* Primary Highlight Banner */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg">
        <div>
          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
            Dormant Coins Moved
          </span>
          {btcAmount && (
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {btcAmount}
            </span>
          )}
        </div>

        {classification && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/40 border border-amber-600/50 text-amber-300 font-mono text-xs font-semibold">
            <History className="w-3.5 h-3.5" />
            {classification}
          </span>
        )}
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {oldestAge && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Oldest Input
            </span>
            <span className="text-slate-200 font-bold text-sm">{oldestAge}</span>
          </div>
        )}

        {meta.dormant_input_count !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Dormant Inputs
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {meta.dormant_input_count}
              {meta.total_input_count && meta.total_input_count > meta.dormant_input_count && (
                <span className="text-xs text-slate-400 font-normal">
                  {' '}
                  / {meta.total_input_count}
                </span>
              )}
            </span>
          </div>
        )}

        {cadFormatted !== 'N/A' && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Coin Age Destroyed
            </span>
            <span className="text-amber-400 font-bold text-sm">
              {cadFormatted}
            </span>
          </div>
        )}

        {meta.dormant_ratio !== undefined && (
          <div className="p-2.5 bg-surface-card/60 rounded border border-surface-border">
            <span className="text-slate-400 block text-[10px] uppercase">
              Dormant Ratio
            </span>
            <span className="text-slate-200 font-bold text-sm">
              {(meta.dormant_ratio * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Forensic Caution Note */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pt-1">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80" />
        <span>
          Coin age destruction measures historical holding duration before this broadcast.
        </span>
      </div>
    </div>
  );
};
