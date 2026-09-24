import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { fetchIncidents } from '../api';
import { Incident } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = () => {
    setLoading(true);
    setError(null);
    fetchIncidents(50, 0)
      .then((res) => {
        setIncidents(res.incidents || []);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Incident Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              Incident Intelligence
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-world Bitcoin incidents reconstructed from on-chain evidence and sourced reporting.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-mono transition-colors shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Epistemological Separation Banner */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5 flex flex-col sm:flex-row items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-amber-200/90 space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300 uppercase tracking-wider">
              ObsChain Strict Provenance Standard
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-700/50 text-amber-200">
              Epistemological Isolation
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            ObsChain incidents separate <strong className="text-emerald-300">what the blockchain mathematically proves</strong> from{' '}
            <strong className="text-sky-300">what official disclosures claim</strong>,{' '}
            <strong className="text-purple-300">what is analytical or heuristic</strong>, and{' '}
            <strong className="text-amber-300">what remains unknown</strong>. Self-attributed actor labels or motives are never promoted to verified facts.
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographic Ground Truth</span>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Attributed Disclosures</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>Unverified Actor Claims</span>
            </span>
          </div>
        </div>
      </div>

      {/* Incident List Body */}
      {loading ? (
        <LoadingState message="Loading incident intelligence dossiers from ObsChain..." rows={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={loadIncidents} />
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No recorded incident dossiers"
          description="ObsChain has not recorded any security incidents for the active network profile."
        />
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <IncidentCard key={incident.case_id || incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
};
