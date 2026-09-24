import React from 'react';
import { Coins, CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react';
import { RecoverySummary } from '../../types';
import { formatBtcFromSats, formatSats, formatUtcTimestamp } from '../../utils/formatters';

interface FundRecoveryPanelProps {
  recovery: RecoverySummary;
  className?: string;
}

export const FundRecoveryPanel: React.FC<FundRecoveryPanelProps> = ({
  recovery,
  className = '',
}) => {
  const {
    affected_sats,
    recovered_sats,
    outstanding_sats,
    as_of_timestamp,
    source,
    is_estimate,
  } = recovery;

  // Safe percentage calculation with division by zero guard
  const percentage =
    affected_sats > 0
      ? Math.min(100, Math.max(0, (recovered_sats / affected_sats) * 100))
      : 0;

  const affectedBtc = formatBtcFromSats(affected_sats, { maxDecimals: 2, minDecimals: 2 });
  const recoveredBtc = formatBtcFromSats(recovered_sats, { maxDecimals: 2, minDecimals: 2 });
  const outstandingBtc = formatBtcFromSats(outstanding_sats, { maxDecimals: 2, minDecimals: 2 });

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="fund-recovery-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              Fund Recovery &amp; Exposure
            </h2>
            <p className="text-xs text-slate-400">
              Verified on-chain reserves and reported outstanding recovery state.
            </p>
          </div>
        </div>

        {as_of_timestamp && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-surface-subtle px-3 py-1.5 rounded-lg border border-surface-border">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>As reported: {formatUtcTimestamp(as_of_timestamp)}</span>
          </div>
        )}
      </div>

      {/* Grid of Key Monetary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Affected */}
        <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL AFFECTED</span>
            {is_estimate && (
              <span className="text-amber-400 text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                ~ Estimate
              </span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {is_estimate ? '~' : ''}
            {affectedBtc}
          </div>
          <div className="text-xs font-mono text-slate-400">
            {formatSats(affected_sats)}
          </div>
        </div>

        {/* Recovered */}
        <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIRMED RETURNED</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {percentage.toFixed(2)}%
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 tracking-tight">
            {recoveredBtc}
          </div>
          <div className="text-xs font-mono text-emerald-400/80">
            {formatSats(recovered_sats)}
          </div>
        </div>

        {/* Outstanding */}
        <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-800/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>OUTSTANDING</span>
            </span>
            <span className="text-[11px] font-mono text-rose-400">
              ~ Snapshot
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 tracking-tight">
            ~{outstandingBtc}
          </div>
          <div className="text-xs font-mono text-rose-400/80">
            {formatSats(outstanding_sats)}
          </div>
        </div>
      </div>

      {/* Recovery Meter Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-300 font-medium">RECOVERY PROGRESS</span>
          <span className="text-emerald-400 font-bold">{percentage.toFixed(2)}% RETURNED</span>
        </div>
        <div
          className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/80 relative"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-700 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>0 BTC</span>
          <span>{affectedBtc}</span>
        </div>
      </div>

      {/* Snapshot Reference Note */}
      {source && (
        <div className="flex items-start gap-2 text-xs font-mono text-slate-400 bg-surface-subtle/60 p-3 rounded-lg border border-surface-border">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-slate-300 font-medium">Recovery Reference Note: </span>
            <span>
              Outstanding figure ({outstandingBtc}) reflects reported recovery state as of {formatUtcTimestamp(as_of_timestamp)} per {source}. Not permanently current.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
