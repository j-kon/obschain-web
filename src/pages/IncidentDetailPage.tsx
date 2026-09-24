import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileQuestion,
  Info,
  Network,
  ExternalLink,
  ShieldCheck,
  Layers,
  Database,
} from 'lucide-react';
import { api } from '../api/client';
import { Incident } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { Timeline } from '../components/Timeline';
import { TransactionLink } from '../components/TransactionLink';
import { BlockLink } from '../components/BlockLink';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    api
      .getIncidentById(id)
      .then((data) => {
        setIncident(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingState message="Loading incident case file..." />;
  if (error || !incident) {
    return (
      <div className="space-y-4">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incidents</span>
        </Link>
        <ErrorState error={error || 'Incident case file not found'} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top back navigation */}
      <div>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incident Intelligence</span>
        </Link>
      </div>

      {/* Case Header Card */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={incident.severity} />
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 uppercase tracking-wider font-semibold">
                Status: {incident.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {incident.title}
            </h1>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-3.5 h-3.5" />
              <span>Observed: {new Date(incident.first_observed_at).toLocaleDateString()}</span>
            </div>
            <div>Case ID: {incident.id}</div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">
            Case Summary
          </h3>
          <p className="text-slate-200 text-base leading-relaxed bg-surface-card/60 p-4 rounded-lg border border-surface-border">
            {incident.summary}
          </p>
        </div>

        {/* Financial Flow Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-surface-card/40 border border-surface-border">
            <span className="text-xs font-mono text-slate-400">Total BTC Affected:</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {incident.total_btc_affected.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{' '}
              BTC
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card/40 border border-surface-border">
            <span className="text-xs font-mono text-slate-400">Total BTC Recovered:</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {incident.total_btc_recovered.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{' '}
              BTC
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card/40 border border-surface-border">
            <span className="text-xs font-mono text-slate-400">Verified On-Chain Facts:</span>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>{incident.facts?.length || 0}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card/40 border border-surface-border">
            <span className="text-xs font-mono text-slate-400">Evidence Records:</span>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
              <span>{incident.evidence?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tripartite Breakdown: Facts vs Reported vs Unverified */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Observed Facts */}
        <div className="bg-surface-panel border border-emerald-800/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-bold text-emerald-300 uppercase tracking-wide">
              1. Observed Facts
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Cryptographically verified directly on the Bitcoin blockchain.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-slate-200 font-sans">
            {incident.facts?.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reported Information */}
        <div className="bg-surface-panel border border-purple-800/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
            <Info className="w-4 h-4 text-purple-400" />
            <h3 className="font-mono text-sm font-bold text-purple-300 uppercase tracking-wide">
              2. Reported Info
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Corroborated security advisories and official party statements.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-slate-200 font-sans">
            {incident.reported_claims?.map((claim, i) => (
              <li key={i} className="flex items-start gap-2 bg-purple-950/20 p-2.5 rounded border border-purple-900/40">
                <span className="text-purple-400 font-bold">&bull;</span>
                <span>{claim}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unverified Claims */}
        <div className="bg-surface-panel border border-amber-800/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
            <FileQuestion className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-sm font-bold text-amber-300 uppercase tracking-wide">
              3. Unverified Claims
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Heuristic clustering &amp; community assertions requiring verification.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-slate-200 font-sans">
            {incident.unverified_claims?.map((claim, i) => (
              <li key={i} className="flex items-start gap-2 bg-amber-950/20 p-2.5 rounded border border-amber-900/40">
                <span className="text-amber-400 font-bold">&bull;</span>
                <span>{claim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transaction Graph Visualization Placeholder */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-500" />
            <span>Interactive Fund Flow &amp; Transaction Graph</span>
          </h3>
          <span className="text-xs font-mono text-slate-400 bg-surface-card px-2.5 py-1 rounded border border-surface-border">
            Engine: Directed DAG (Phase 4 Target)
          </span>
        </div>

        <div className="h-48 border border-dashed border-surface-border rounded-lg bg-[#06080D] flex flex-col items-center justify-center p-6 text-center space-y-2">
          <Network className="w-8 h-8 text-amber-500/60 animate-pulse" />
          <p className="text-sm font-mono text-slate-300">
            Graph Topology Model: 24 Destination UTXOs &bull; 4 Aggregation Stages
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Visual transaction DAG rendering module connects directly to the backend{' '}
            <code className="text-amber-400 font-mono">obschain-intelligence::TransactionGraph</code> API.
          </p>
        </div>
      </div>

      {/* Associated Transactions & Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transactions */}
        <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            <span>Associated Transactions ({incident.associated_txids?.length || 0})</span>
          </h3>
          <div className="space-y-2">
            {incident.associated_txids?.map((txid) => (
              <div key={txid} className="p-2.5 rounded bg-surface-card border border-surface-border">
                <TransactionLink txid={txid} truncate={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Blocks */}
        <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Associated Block Heights ({incident.associated_block_heights?.length || 0})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {incident.associated_block_heights?.map((height) => (
              <BlockLink key={height} height={height} />
            ))}
          </div>
        </div>
      </div>

      {/* Incident Timeline */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <h3 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span>Incident Chronology &amp; Timeline</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {incident.timeline?.length || 0} Key Milestones
          </span>
        </div>

        <Timeline events={incident.timeline} />
      </div>

      {/* Evidence & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence List */}
        <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2 pb-2 border-b border-surface-border">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Evidence Records &amp; Provenance</span>
          </h3>
          <div className="space-y-3">
            {incident.evidence?.map((ev) => (
              <div key={ev.id} className="p-3 rounded-lg bg-surface-card/60 border border-surface-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-semibold">{ev.evidence_type}</span>
                  <EvidenceBadge classification={ev.classification} />
                </div>
                <p className="text-xs text-slate-200">{ev.description}</p>
                <div className="text-[11px] font-mono text-slate-400 truncate">Ref: {ev.reference}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources List */}
        <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2 pb-2 border-b border-surface-border">
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>Attribution &amp; Advisory Sources</span>
          </h3>
          <div className="space-y-3">
            {incident.sources?.map((src) => (
              <div key={src.id} className="p-3 rounded-lg bg-surface-card/60 border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{src.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Reliability score: {(src.reliability_score * 100).toFixed(0)}%
                  </div>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-surface-panel text-amber-400 transition-colors"
                    title={src.url}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
