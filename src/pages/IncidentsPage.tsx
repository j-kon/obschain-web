import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { Incident } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = () => {
    setLoading(true);
    setError(null);
    api
      .getIncidents(50, 0)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Bitcoin Incident Cases &amp; Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Forensic investigation dossiers tracking major anomalies, thefts, protocol events, and fund movements.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Provenance Banner */}
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-amber-200/90 space-y-1">
          <p className="font-semibold text-amber-300 uppercase tracking-wide">
            ObsChain Strict Provenance Standard
          </p>
          <p className="leading-relaxed">
            Incident cases rigorously delineate between cryptographically verified on-chain facts,
            officially signed statements, and heuristic clustering hypotheses. Heuristic inferences
            are never classified as definitive ground truth.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading incident records..." rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={loadIncidents} />
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
};
