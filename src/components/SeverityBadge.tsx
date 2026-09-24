import React from 'react';
import { EventSeverity } from '../types';

interface SeverityBadgeProps {
  severity: EventSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
}) => {
  const styles: Record<EventSeverity, { bg: string; text: string; border: string; dot?: boolean }> = {
    INFO: {
      bg: 'bg-sky-950/60',
      text: 'text-sky-400',
      border: 'border-sky-800/60',
    },
    LOW: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-800/60',
    },
    MEDIUM: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-800/60',
    },
    HIGH: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-400',
      border: 'border-orange-800/60',
    },
    CRITICAL: {
      bg: 'bg-red-950/80',
      text: 'text-red-400',
      border: 'border-red-700/80',
      dot: true,
    },
  };

  const style = styles[severity] || styles.INFO;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono uppercase tracking-wider ${sizeClasses} ${style.bg} ${style.text} ${style.border}`}
    >
      {style.dot && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
      )}
      {severity}
    </span>
  );
};
