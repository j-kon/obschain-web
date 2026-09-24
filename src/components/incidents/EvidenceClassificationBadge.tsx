import React, { useState } from 'react';
import { HelpCircle, Check, Shield, FileText, Activity, AlertCircle } from 'lucide-react';
import { ProvenanceClassification } from '../../types';

interface EvidenceClassificationBadgeProps {
  classification: ProvenanceClassification;
  showExplanation?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

interface Meta {
  label: string;
  shortLabel: string;
  bgBorder: string;
  icon: React.ReactNode;
  explanation: string;
}

const CLASSIFICATION_META: Record<string, Meta> = {
  ON_CHAIN_VERIFIED: {
    label: 'On-chain verified',
    shortLabel: '✓ On-chain',
    bgBorder: 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300',
    icon: <Check className="w-3 h-3 text-emerald-400 shrink-0" />,
    explanation:
      'This claim is cryptographically proven via an immutable confirmed Bitcoin or sidechain transaction, block, or script execution.',
  },
  OFFICIALLY_ATTRIBUTED: {
    label: 'Official disclosure',
    shortLabel: 'Official',
    bgBorder: 'bg-sky-950/40 border-sky-600/50 text-sky-300',
    icon: <Shield className="w-3 h-3 text-sky-400 shrink-0" />,
    explanation:
      'This claim originates from an identified official project disclosure, maintainer assessment, or verified cryptographic signature, but is not independently established by blockchain consensus.',
  },
  REPUTABLE_REPORTING: {
    label: 'Independent reporting',
    shortLabel: 'Reported',
    bgBorder: 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300',
    icon: <FileText className="w-3 h-3 text-indigo-400 shrink-0" />,
    explanation:
      'This claim was published by reputable security research teams or independent investigative journalists with transparent methodology.',
  },
  HIGH_CONFIDENCE_REPORTING: {
    label: 'Independent reporting',
    shortLabel: 'Reported',
    bgBorder: 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300',
    icon: <FileText className="w-3 h-3 text-indigo-400 shrink-0" />,
    explanation:
      'This claim was published by reputable security research teams or independent investigative journalists with transparent methodology.',
  },
  HEURISTIC: {
    label: 'Heuristic',
    shortLabel: 'Heuristic',
    bgBorder: 'bg-amber-950/40 border-amber-600/50 text-amber-300',
    icon: <Activity className="w-3 h-3 text-amber-400 shrink-0" />,
    explanation:
      'Derived from behavioral clustering, change address heuristics, or co-spending models. Heuristics are probabilistic and NEVER establish definitive address ownership.',
  },
  UNVERIFIED: {
    label: 'Unverified / self-attributed',
    shortLabel: 'Unverified',
    bgBorder: 'bg-slate-800/80 border-slate-600 text-slate-300',
    icon: <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />,
    explanation:
      'Uncorroborated single-source assertion, anonymous claim, or unverified self-description (e.g., self-proclaimed "white hat").',
  },
  DISPUTED: {
    label: 'Disputed',
    shortLabel: 'Disputed',
    bgBorder: 'bg-rose-950/40 border-rose-600/50 text-rose-300',
    icon: <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />,
    explanation:
      'This claim is contested by counterparties or directly contradicts verified on-chain observations.',
  },
};

export const EvidenceClassificationBadge: React.FC<EvidenceClassificationBadgeProps> = ({
  classification,
  showExplanation = false,
  className = '',
  size = 'md',
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const meta = CLASSIFICATION_META[classification] || CLASSIFICATION_META.UNVERIFIED;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className="relative inline-flex items-center">
      <span
        className={`inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wide uppercase border transition-colors cursor-help ${meta.bgBorder} ${sizeClasses} ${className}`}
        onClick={() => setTooltipOpen((prev) => !prev)}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        role="button"
        tabIndex={0}
        aria-label={`${meta.label}: ${meta.explanation}`}
      >
        {meta.icon}
        <span>{meta.label}</span>
        {showExplanation && <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />}
      </span>

      {tooltipOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-xs font-sans text-slate-200 normal-case pointer-events-none">
          <p className="font-semibold text-white mb-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            {meta.icon}
            <span>{meta.label}</span>
          </p>
          <p className="text-slate-300 leading-relaxed">{meta.explanation}</p>
        </div>
      )}
    </div>
  );
};
