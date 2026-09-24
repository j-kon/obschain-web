import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { Incident } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface IncidentCardProps {
  incident: Incident;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  const statusColors: Record<string, string> = {
    INVESTIGATING: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    OPEN: 'text-red-400 bg-red-950/40 border-red-800/60',
    MITIGATED: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    CLOSED: 'text-slate-400 bg-slate-900 border-slate-700',
    DISPUTED: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
  };

  const statusStyle = statusColors[incident.status] || statusColors.INVESTIGATING;

  return (
    <div className="group bg-surface-panel/80 hover:bg-surface-panel border border-surface-border hover:border-surface-borderHover rounded-lg p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <span
            className={`font-mono text-xs font-semibold px-2.5 py-1 rounded border uppercase tracking-wider ${statusStyle}`}
          >
            {incident.status}
          </span>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last updated: {new Date(incident.last_updated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-4">
        <Link
          to={`/incidents/${incident.id}`}
          className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center justify-between"
        >
          <span>{incident.title}</span>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          {incident.summary}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-surface-border/50 text-xs font-mono">
        <div>
          <span className="text-slate-400 block">BTC Affected:</span>
          <span className="text-amber-400 font-semibold text-sm">
            {incident.total_btc_affected.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{' '}
            BTC
          </span>
        </div>

        <div>
          <span className="text-slate-400 block">BTC Recovered:</span>
          <span className="text-emerald-400 font-semibold text-sm">
            {incident.total_btc_recovered.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{' '}
            BTC
          </span>
        </div>

        <div>
          <span className="text-slate-400 block">Verified Facts:</span>
          <span className="text-slate-200 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {incident.facts?.length || 0}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block">Evidence Items:</span>
          <span className="text-slate-200 font-medium flex items-center gap-1 mt-0.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            {incident.evidence?.length || 0}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-500/80" />
          <span>Strict Provenance Verified</span>
        </div>

        <Link
          to={`/incidents/${incident.id}`}
          className="text-amber-400 font-mono hover:underline flex items-center gap-1"
        >
          View Case Dossier &rarr;
        </Link>
      </div>
    </div>
  );
};
