import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  FileText,
  Activity,
  Network,
  Coins,
  Cpu,
  BookOpen,
  History,
  Code,
  Layers,
} from 'lucide-react';
import {
  fetchIncident,
  fetchIncidentTimeline,
  fetchIncidentEvidence,
  fetchIncidentGraph,
} from '../api';
import {
  Incident,
  TimelineEntry,
  Evidence,
  IncidentGraph,
} from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  IncidentStatusBadge,
  FundRecoveryPanel,
  WhatChainProvesSummary,
  EvidenceCertaintyPanel,
  IncidentTimeline,
  IncidentGraphView,
  IncidentTransactionTable,
  OnChainMessages,
  TechnicalFindingPanel,
  SourceList,
  IncidentUpdateHistory,
  RawDossierView,
} from '../components/incidents';
import { formatUtcTimestamp } from '../utils/formatters';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [graph, setGraph] = useState<IncidentGraph | null>(null);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCaseId, setCopiedCaseId] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const loadDossier = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setGraphError(null);

    try {
      // 1. Fetch primary incident dossier
      const inc = await fetchIncident(id);
      setIncident(inc);

      // Start with embedded collections if present
      let tl = inc.timeline || [];
      let ev = inc.evidence || [];
      let gr = inc.graph || null;

      // 2. Concurrently fetch sub-resources for resilient enrichment
      const [tlRes, evRes, grRes] = await Promise.allSettled([
        fetchIncidentTimeline(id),
        fetchIncidentEvidence(id),
        fetchIncidentGraph(id),
      ]);

      if (tlRes.status === 'fulfilled' && tlRes.value.timeline?.length > 0) {
        tl = tlRes.value.timeline;
      }
      if (evRes.status === 'fulfilled' && evRes.value.evidence?.length > 0) {
        ev = evRes.value.evidence;
      }
      if (grRes.status === 'fulfilled' && grRes.value.nodes?.length > 0) {
        gr = grRes.value;
      } else if (grRes.status === 'rejected' && (!gr || gr.nodes?.length === 0)) {
        setGraphError((grRes.reason as Error)?.message || 'Transaction flow graph could not be loaded.');
      }

      setTimeline(tl);
      setEvidence(ev);
      setGraph(gr);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to load incident dossier');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDossier();
  }, [loadDossier]);

  // Update browser document title
  useEffect(() => {
    if (incident?.title) {
      document.title = `${incident.title} | ObsChain`;
    } else {
      document.title = 'Incident Dossier | ObsChain';
    }
    return () => {
      document.title = 'ObsChain - Bitcoin Intelligence & Observation';
    };
  }, [incident]);

  const handleCopyCaseId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaseId(true);
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  const navSections = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'funds', label: 'Recovery', icon: <Coins className="w-3.5 h-3.5" /> },
    { id: 'chain-proofs', label: 'Chain Proofs', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'graph', label: 'Flow Graph', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'transactions', label: 'Transactions', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'messages', label: 'Messages', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: 'Evidence', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'technical', label: 'Root Cause', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'sources', label: 'Sources', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'updates', label: 'Updates', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'raw', label: 'Raw JSON', icon: <Code className="w-3.5 h-3.5" /> },
  ], []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Incident Intelligence</span>
          </Link>
        </div>
        <LoadingState message="Loading ObsChain incident dossier..." rows={6} />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Incident Intelligence</span>
          </Link>
        </div>
        <ErrorState
          error={error || 'Incident case dossier not found'}
          onRetry={loadDossier}
        />
      </div>
    );
  }

  const caseId = incident.case_id || incident.id;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incident Intelligence Desk</span>
        </Link>

        <button
          onClick={loadDossier}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface-card hover:bg-surface-border border border-surface-border text-slate-300 text-xs font-mono transition-colors"
          title="Reload Dossier"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh Case</span>
        </button>
      </div>

      {/* Case Header Dossier Box */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-surface-border">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <span>ObsChain Incident Dossier</span>
              <span>&bull;</span>
              <button
                onClick={() => handleCopyCaseId(caseId)}
                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded transition-colors"
                title="Click to copy Case ID"
              >
                <span>{caseId}</span>
                {copiedCaseId ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-amber-400/80" />
                )}
              </button>
              {copiedCaseId && (
                <span className="text-[11px] text-emerald-400 font-sans">Copied</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-white tracking-tight">
              {incident.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <SeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.status} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-xs font-mono text-slate-400 bg-surface-card/60 p-4 rounded-lg border border-surface-border shrink-0 min-w-[220px]">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">First observed</span>
              <span className="text-slate-200 font-semibold text-sm mt-0.5 block">
                {incident.first_observed_at ? formatUtcTimestamp(incident.first_observed_at).split(',')[0] : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Last updated</span>
              <span className="text-slate-200 font-semibold text-sm mt-0.5 block">
                {incident.last_updated_at ? formatUtcTimestamp(incident.last_updated_at).split(',')[0] : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div id="overview" className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">
              Executive Summary &amp; Context
            </h3>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Strict Provenance Standard</span>
            </span>
          </div>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-surface-card/40 p-4 sm:p-5 rounded-lg border border-surface-border font-sans">
            {incident.summary}
          </p>
        </div>
      </div>

      {/* Sticky Dossier Navigation Bar */}
      <div className="sticky top-2 z-20 bg-surface-panel/95 backdrop-blur border border-surface-border rounded-xl p-2 shadow-lg overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {navSections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeSection === sec.id
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-card'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Section 1: Fund Recovery Panel */}
      <section id="funds" className="scroll-mt-20">
        {incident.recovery && (
          <FundRecoveryPanel recovery={incident.recovery} />
        )}
      </section>

      {/* Section 2: What the Chain Proves vs What Remains Unproven */}
      <section id="chain-proofs" className="scroll-mt-20">
        {incident.structured_claims && (
          <WhatChainProvesSummary claims={incident.structured_claims} />
        )}
      </section>

      {/* Section 3: Incident Timeline */}
      <section id="timeline" className="scroll-mt-20">
        <IncidentTimeline timeline={timeline} />
      </section>

      {/* Section 4: Transaction Flow Visualization (Graph) */}
      <section id="graph" className="scroll-mt-20">
        {graphError ? (
          <div className="bg-surface-card border border-rose-900/40 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Transaction Flow Graph Unavailable</span>
            </div>
            <p className="text-xs text-slate-300">
              {graphError}
            </p>
            <p className="text-xs text-slate-400">
              The rest of this incident dossier remains fully accessible and verified.
            </p>
          </div>
        ) : graph && graph.nodes && graph.nodes.length > 0 ? (
          <IncidentGraphView graph={graph} />
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 text-center text-xs font-mono text-slate-400">
            No topological flow graph mapped for this incident.
          </div>
        )}
      </section>

      {/* Section 5: Incident Transaction Table */}
      <section id="transactions" className="scroll-mt-20">
        <IncidentTransactionTable transactions={incident.transactions || []} />
      </section>

      {/* Section 6: On-Chain Messages */}
      <section id="messages" className="scroll-mt-20">
        <OnChainMessages messages={incident.on_chain_messages || []} />
      </section>

      {/* Section 7: Evidence & Certainty Breakdown */}
      <section id="evidence" className="scroll-mt-20">
        <EvidenceCertaintyPanel
          claims={incident.structured_claims}
          evidence={evidence}
        />
      </section>

      {/* Section 8: Technical Root Cause & Remediation */}
      <section id="technical" className="scroll-mt-20">
        <TechnicalFindingPanel findings={incident.technical_findings || []} />
      </section>

      {/* Section 9: Attribution & Advisory Sources */}
      <section id="sources" className="scroll-mt-20">
        <SourceList sources={incident.sources || []} />
      </section>

      {/* Section 10: Investigation Updates & Historical Snapshots */}
      <section id="updates" className="scroll-mt-20">
        <IncidentUpdateHistory updates={incident.updates || []} />
      </section>

      {/* Section 11: Raw Incident Dossier (JSON) */}
      <section id="raw" className="scroll-mt-20">
        <RawDossierView incident={incident} />
      </section>
    </div>
  );
};
