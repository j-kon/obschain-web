import React from 'react';
import { Eye, Shield, Cpu, Network, CheckCircle2, GitBranch } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
          <Eye className="w-3.5 h-3.5" />
          <span>System Philosophy &amp; Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
          About ObsChain
        </h1>
        <p className="text-base text-slate-300 leading-relaxed font-sans">
          ObsChain is an open-source Bitcoin network observation, anomaly-detection, incident-analysis,
          and on-chain intelligence platform.
        </p>
      </div>

      {/* Core Mission */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold font-mono text-amber-400 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <span>The Sovereign Provenance Principle</span>
        </h2>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-sans">
          <p>
            Blockchains provide mathematically verifiable cryptographic truth. However, conventional
            analytics platforms frequently conflate off-chain hearsay, uncorroborated social media reports,
            and heuristic wallet clustering with immutable ground truth.
          </p>
          <p className="font-semibold text-slate-100">
            ObsChain enforces an inviolable boundary:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-slate-300">
            <li>
              <strong className="text-emerald-400">Cryptographic Verification:</strong> Only confirmed block headers,
              scripts, and valid transactions constitute facts.
            </li>
            <li>
              <strong className="text-amber-400">Heuristics Never Equal Fact:</strong> Address clustering algorithms
              (common-input, change detection) are explicitly recorded as heuristics and never as definitive ownership.
            </li>
            <li>
              <strong className="text-sky-400">Provenance Tracking:</strong> Every claim, assertion, or report retains
              its source origin and confidence classification.
            </li>
          </ul>
        </div>
      </div>

      {/* Visual Direction & Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-3">
          <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Built For</span>
          </h3>
          <ul className="text-xs font-mono space-y-2 text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bitcoin Node Operators</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security &amp; Incident Response Teams</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographic Researchers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protocol Observability Engineers</span>
            </li>
          </ul>
        </div>

        <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-3">
          <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Architecture Separation</span>
          </h3>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            The ObsChain engine is completely decoupled into two independent repositories:
          </p>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-surface-card border border-surface-border">
              <span className="text-amber-400 font-bold">Backend:</span> Rust &bull; Tokio &bull; Axum &bull; SQLx
            </div>
            <div className="p-2 rounded bg-surface-card border border-surface-border">
              <span className="text-sky-400 font-bold">Frontend:</span> React &bull; TypeScript &bull; Vite &bull; Tailwind
            </div>
          </div>
        </div>
      </div>

      {/* Ingestion & Sources */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span>Ingestion &amp; Detection Layer</span>
        </h3>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          The Rust backend implements modular ingestion sources connecting to sovereign Bitcoin Core nodes
          via JSON-RPC and ZeroMQ (ZMQ), alongside public mempool.space REST and WebSocket feeds.
          Detectors evaluate block intervals, fee rate spikes, consolidation clusters, and whale movements
          concurrently without blocking the main event stream.
        </p>
      </div>
    </div>
  );
};
