import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShieldAlert } from 'lucide-react';
import { Incident } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { IncidentStatusBadge } from './incidents/IncidentStatusBadge';
import { formatBtcFromSats, formatUtcTimestamp } from '../utils/formatters';

interface IncidentCardProps {
  incident: Incident;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  const caseId = incident.case_id || incident.id;
  const targetUrl = `/incidents/${encodeURIComponent(caseId)}`;

  // Safe satoshi balance calculations
  const affectedSats = incident.recovery?.affected_sats !== undefined
    ? BigInt(incident.recovery.affected_sats)
    : BigInt(Math.trunc(incident.total_btc_affected * 100_000_000));

  const recoveredSats = incident.recovery?.recovered_sats !== undefined
    ? BigInt(incident.recovery.recovered_sats)
    : BigInt(Math.trunc(incident.total_btc_recovered * 100_000_000));

  const outstandingSats = incident.recovery?.outstanding_sats !== undefined
    ? BigInt(incident.recovery.outstanding_sats)
    : (affectedSats > recoveredSats ? affectedSats - recoveredSats : 0n);

  const isEstimate = incident.recovery?.is_estimate ?? false;

  // Safe percentage calculation
  let recoveryPercent = 0;
  if (affectedSats > 0n) {
    const basisPoints = (recoveredSats * 10000n) / affectedSats;
    recoveryPercent = Number(basisPoints) / 100;
  }

  return (
    <div className="group bg-surface-panel/90 hover:bg-surface-panel border border-surface-border hover:border-surface-borderHover rounded-xl p-6 transition-all shadow-sm hover:shadow-md">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
            {caseId}
          </span>
          <SeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.status} />
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>First observed:</span>
          <span className="text-slate-300">
            {incident.first_observed_at ? formatUtcTimestamp(incident.first_observed_at).split(',')[0] : 'N/A'}
          </span>
        </div>
      </div>

      {/* Title & Summary */}
      <div className="mb-5">
        <Link
          to={targetUrl}
          className="text-xl font-bold font-mono text-slate-100 group-hover:text-amber-400 transition-colors flex items-center justify-between gap-2"
        >
          <span>{incident.title}</span>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">
          {incident.summary}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-4 bg-surface-card/60 rounded-lg border border-surface-border/60 text-xs font-mono">
        <div>
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Affected</span>
          <span className="text-amber-400 font-semibold text-sm mt-0.5 block">
            {isEstimate && <span className="text-amber-400/80 mr-0.5" title="Estimated amount">~</span>}
            {formatBtcFromSats(affectedSats)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Recovered</span>
          <span className="text-emerald-400 font-semibold text-sm mt-0.5 block">
            {formatBtcFromSats(recoveredSats)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Outstanding</span>
          <span className="text-slate-200 font-semibold text-sm mt-0.5 block">
            {isEstimate && <span className="text-amber-400/80 mr-0.5" title="Estimated amount">~</span>}
            {formatBtcFromSats(outstandingSats)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Recovery</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-emerald-400 font-semibold text-sm">
              {recoveryPercent.toFixed(2)}%
            </span>
            <div className="hidden sm:block flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, recoveryPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="mt-4 pt-3 border-t border-surface-border/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80" />
          <span>Strict Provenance Separation Applied</span>
        </div>

        <div className="flex items-center gap-3">
          {incident.last_updated_at && (
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated: {formatUtcTimestamp(incident.last_updated_at).split(',')[0]}</span>
            </span>
          )}
          <Link
            to={targetUrl}
            className="text-amber-400 hover:text-amber-300 hover:underline font-semibold flex items-center gap-1 ml-2"
          >
            <span>Open Dossier</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
