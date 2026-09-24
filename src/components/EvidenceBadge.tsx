import React from 'react';
import { ProvenanceClassification } from '../types';
import { ShieldCheck, ShieldAlert, Award, FileQuestion, AlertOctagon, HelpCircle } from 'lucide-react';

interface EvidenceBadgeProps {
  classification: ProvenanceClassification;
  showIcon?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  classification,
  showIcon = true,
}) => {
  const configs: Record<
    ProvenanceClassification,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    ON_CHAIN_VERIFIED: {
      label: 'On-Chain Verified',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    OFFICIALLY_ATTRIBUTED: {
      label: 'Officially Attributed',
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-300',
      border: 'border-cyan-700/60',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    HIGH_CONFIDENCE_REPORTING: {
      label: 'Corroborated Report',
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-700/60',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    HEURISTIC: {
      label: 'Heuristic Only',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      icon: <FileQuestion className="w-3.5 h-3.5" />,
    },
    UNVERIFIED: {
      label: 'Unverified Claim',
      bg: 'bg-zinc-900',
      text: 'text-zinc-400',
      border: 'border-zinc-700',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    DISPUTED: {
      label: 'Disputed',
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-700',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
    },
  };

  const c = configs[classification] || configs.UNVERIFIED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${c.bg} ${c.text} ${c.border}`}
      title={`Provenance rating: ${classification}`}
    >
      {showIcon && c.icon}
      <span>{c.label}</span>
    </span>
  );
};
