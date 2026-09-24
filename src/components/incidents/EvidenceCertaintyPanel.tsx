import React, { useState } from 'react';
import {
  CheckCircle2,
  Shield,
  FileText,
  Activity,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { StructuredClaimsSummary, Evidence } from '../../types';
import { EvidenceClassificationBadge } from './EvidenceClassificationBadge';

interface EvidenceCertaintyPanelProps {
  claims: StructuredClaimsSummary;
  evidence?: Evidence[];
  className?: string;
}

type TabKey = 'all' | 'verified' | 'official' | 'reported' | 'heuristic' | 'unknown';

export const EvidenceCertaintyPanel: React.FC<EvidenceCertaintyPanelProps> = ({
  claims,
  evidence = [],
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const verifiedClaims = claims?.verified_on_chain || [];
  const officialClaims = claims?.officially_attributed || [];
  const reportedClaims = claims?.reported || [];
  const heuristicClaims = claims?.heuristic || [];
  const unknownClaims = claims?.unknown || [];

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="evidence-certainty-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Tripartite Certainty Breakdown</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every incident assertion is classified into its strict evidentiary certainty tier.
          </p>
        </div>

        {/* Tab Filter Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-surface-subtle border border-surface-border text-xs font-mono">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-surface-card text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tiers
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'verified'
                ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            On-Chain ({verifiedClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'official'
                ? 'bg-sky-950/60 text-sky-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Official ({officialClaims.length})
          </button>
          {reportedClaims.length > 0 && (
            <button
              onClick={() => setActiveTab('reported')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'reported'
                  ? 'bg-indigo-950/60 text-indigo-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reported ({reportedClaims.length})
            </button>
          )}
          {heuristicClaims.length > 0 && (
            <button
              onClick={() => setActiveTab('heuristic')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'heuristic'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heuristic ({heuristicClaims.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('unknown')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'unknown'
                ? 'bg-slate-800 text-slate-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unknown ({unknownClaims.length})
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tier 1: Verified On-Chain */}
        {(activeTab === 'all' || activeTab === 'verified') && verifiedClaims.length > 0 && (
          <div className="space-y-3 bg-emerald-950/10 border border-emerald-800/30 rounded-lg p-5">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  Tier 1: Verified On-Chain Truth
                </h3>
              </div>
              <EvidenceClassificationBadge classification="ON_CHAIN_VERIFIED" size="sm" />
            </div>
            <p className="text-[11px] text-emerald-400/80 font-mono">
              Immutable facts proven directly by Bitcoin and sidechain consensus ledgers.
            </p>
            <ul className="space-y-2 text-xs font-mono text-emerald-100">
              {verifiedClaims.map((claim, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tier 2: Officially Attributed */}
        {(activeTab === 'all' || activeTab === 'official') && officialClaims.length > 0 && (
          <div className="space-y-3 bg-sky-950/10 border border-sky-800/30 rounded-lg p-5">
            <div className="flex items-center justify-between pb-2 border-b border-sky-800/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  Tier 2: Officially Attributed &amp; Disclosed
                </h3>
              </div>
              <EvidenceClassificationBadge classification="OFFICIALLY_ATTRIBUTED" size="sm" />
            </div>
            <p className="text-[11px] text-sky-400/80 font-mono">
              Disclosures from core maintainers, node operators, and verified infrastructure teams.
            </p>
            <ul className="space-y-2 text-xs font-mono text-sky-100">
              {officialClaims.map((claim, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-sky-400 font-bold shrink-0 mt-0.5">◆</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tier 3: Independent Reporting */}
        {(activeTab === 'all' || activeTab === 'reported') && reportedClaims.length > 0 && (
          <div className="space-y-3 bg-indigo-950/10 border border-indigo-800/30 rounded-lg p-5">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-800/30">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  Tier 3: Sourced Independent Reporting
                </h3>
              </div>
              <EvidenceClassificationBadge classification="REPUTABLE_REPORTING" size="sm" />
            </div>
            <p className="text-[11px] text-indigo-400/80 font-mono">
              External estimates and reporting from security firms with transparent methodologies.
            </p>
            <ul className="space-y-2 text-xs font-mono text-indigo-100">
              {reportedClaims.map((claim, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-indigo-400 font-bold shrink-0 mt-0.5">●</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tier 4: Heuristics */}
        {(activeTab === 'all' || activeTab === 'heuristic') && heuristicClaims.length > 0 && (
          <div className="space-y-3 bg-amber-950/10 border border-amber-800/30 rounded-lg p-5">
            <div className="flex items-center justify-between pb-2 border-b border-amber-800/30">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Tier 4: Analytical / Heuristic Inferences
                </h3>
              </div>
              <EvidenceClassificationBadge classification="HEURISTIC" size="sm" />
            </div>
            <p className="text-[11px] text-amber-400/80 font-mono">
              Probabilistic inferences from address clustering. Never implies definitive ownership.
            </p>
            <ul className="space-y-2 text-xs font-mono text-amber-100">
              {heuristicClaims.map((claim, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">▲</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tier 5: Unknown / Unverified */}
        {(activeTab === 'all' || activeTab === 'unknown') && unknownClaims.length > 0 && (
          <div className="space-y-3 bg-slate-900/60 border border-slate-700/60 rounded-lg p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Tier 5: Unknown / Unverified Claims
                </h3>
              </div>
              <EvidenceClassificationBadge classification="UNVERIFIED" size="sm" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Unverified actor identities, self-attributions, or elements lacking cryptographic proof.
            </p>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {unknownClaims.map((claim, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 font-bold shrink-0 mt-0.5">○</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Linked Evidence Items Table */}
      {evidence.length > 0 && (
        <div className="pt-4 border-t border-surface-border space-y-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Primary Evidence Artifacts ({evidence.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidence.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border space-y-2 text-xs font-mono"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-white leading-snug">
                    {ev.title || ev.description}
                  </span>
                  <EvidenceClassificationBadge classification={ev.confidence} size="sm" />
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {ev.description}
                </p>
                {ev.txid && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 overflow-hidden text-ellipsis">
                    <span className="text-slate-400">TXID:</span>
                    <span className="font-mono text-slate-300 truncate">{ev.txid}</span>
                  </div>
                )}
                {ev.block_height && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-400">Block:</span>
                    <span className="text-slate-300 font-mono">#{ev.block_height.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
