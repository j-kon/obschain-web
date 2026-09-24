import React from 'react';
import { IncidentStatus } from '../../types';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IncidentStatusBadge: React.FC<IncidentStatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const norm = status.toUpperCase();

  let label: string = status;
  let bgBorder = 'bg-slate-800/60 border-slate-700 text-slate-300';
  let dotColor = 'bg-slate-400';

  switch (norm) {
    case 'DETECTED':
      label = 'Detected';
      bgBorder = 'bg-amber-950/40 border-amber-600/50 text-amber-300';
      dotColor = 'bg-amber-400 animate-pulse';
      break;
    case 'INVESTIGATING':
      label = 'Investigating';
      bgBorder = 'bg-blue-950/40 border-blue-600/50 text-blue-300';
      dotColor = 'bg-blue-400 animate-pulse';
      break;
    case 'VERIFIED':
      label = 'Verified';
      bgBorder = 'bg-rose-950/40 border-rose-600/50 text-rose-300';
      dotColor = 'bg-rose-400';
      break;
    case 'MONITORING':
      label = 'Monitoring';
      bgBorder = 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300';
      dotColor = 'bg-indigo-400';
      break;
    case 'RECOVERY':
      label = 'Recovery in Progress';
      bgBorder = 'bg-purple-950/40 border-purple-500/50 text-purple-300';
      dotColor = 'bg-purple-400';
      break;
    case 'RESOLVED':
    case 'MITIGATED':
      label = 'Resolved';
      bgBorder = 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300';
      dotColor = 'bg-emerald-400';
      break;
    case 'CLOSED':
      label = 'Closed';
      bgBorder = 'bg-slate-900/60 border-slate-700 text-slate-400';
      dotColor = 'bg-slate-500';
      break;
    case 'DISPUTED':
      label = 'Disputed';
      bgBorder = 'bg-orange-950/40 border-orange-600/50 text-orange-300';
      dotColor = 'bg-orange-400';
      break;
    default:
      label = status;
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-mono font-medium tracking-wide uppercase border ${bgBorder} ${sizeClasses} ${className}`}
      title={`Incident Status: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
