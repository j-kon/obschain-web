import React from 'react';
import { History, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { IncidentUpdate } from '../../types';
import { formatBtcFromSats, formatUtcTimestamp } from '../../utils/formatters';

interface IncidentUpdateHistoryProps {
  updates: IncidentUpdate[];
  className?: string;
}

export const IncidentUpdateHistory: React.FC<IncidentUpdateHistoryProps> = ({
  updates,
  className = '',
}) => {
  if (!updates || updates.length === 0) return null;

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="incident-update-history"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            Investigation Updates &amp; Historical Snapshots ({updates.length})
          </h2>
          <p className="text-xs text-slate-400">
            Append-only record of post-incident developments. Historical recovery estimates retain their exact as-of dates.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {updates.map((update) => {
          const rec = update.recovery_state;
          return (
            <div
              key={update.id}
              className="p-5 rounded-xl bg-surface-subtle border border-surface-border space-y-3 font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-border/60">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="font-bold text-white text-sm">{update.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatUtcTimestamp(update.timestamp)}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {update.summary}
              </p>

              {rec && (
                <div className="p-3.5 rounded-lg bg-surface-card border border-surface-border space-y-2 mt-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reported Snapshot State (As of {formatUtcTimestamp(rec.as_of_timestamp)})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400">Affected:</span>{' '}
                      <span className="text-white font-semibold">
                        {rec.is_estimate ? '~' : ''}
                        {formatBtcFromSats(rec.affected_sats)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Recovered:</span>{' '}
                      <span className="text-emerald-400 font-semibold">
                        {formatBtcFromSats(rec.recovered_sats)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Outstanding:</span>{' '}
                      <span className="text-rose-400 font-semibold">
                        ~{formatBtcFromSats(rec.outstanding_sats)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
