import React from 'react';
import { CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import { StructuredClaimsSummary } from '../../types';

interface WhatChainProvesSummaryProps {
  claims: StructuredClaimsSummary;
  className?: string;
}

export const WhatChainProvesSummary: React.FC<WhatChainProvesSummaryProps> = ({
  claims,
  className = '',
}) => {
  const verified = claims?.verified_on_chain || [];
  const unknown = claims?.unknown || [];

  if (verified.length === 0 && unknown.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="what-chain-proves-summary"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            What the Chain Proves vs. What Remains Unproven
          </h2>
          <p className="text-xs text-slate-400">
            ObsChain fundamental principle: cryptographic consensus is strictly segregated from external claims and identity attributions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What the Chain Proves */}
        <div className="space-y-3 bg-emerald-950/10 border border-emerald-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>What the Chain Proves (Cryptographically Verified)</span>
          </div>
          <ul className="space-y-2.5 text-xs font-mono text-emerald-200/90 leading-relaxed">
            {verified.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What It Does Not Prove */}
        <div className="space-y-3 bg-slate-900/60 border border-slate-700/60 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>What It Does Not Prove (Unknown / Unverified)</span>
          </div>
          <ul className="space-y-2.5 text-xs font-mono text-slate-300 leading-relaxed">
            {unknown.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">○</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
