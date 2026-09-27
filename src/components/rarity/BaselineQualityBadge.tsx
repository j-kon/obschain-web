import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Shield } from 'lucide-react';
import { BaselineQuality } from '../../types';

export interface BaselineQualityBadgeProps {
  quality: BaselineQuality | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  showWarningNotice?: boolean;
  className?: string;
}

interface QualityConfig {
  label: string;
  classes: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const QUALITY_CONFIG: Record<string, QualityConfig> = {
  HIGH: {
    label: 'HIGH QUALITY',
    classes: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    icon: ShieldCheck,
    description: 'High confidence baseline: complete historical coverage, >=1,000 samples, >=98% coverage ratio.',
  },
  MODERATE: {
    label: 'MODERATE QUALITY',
    classes: 'bg-blue-950/40 text-blue-300 border-blue-800/60',
    icon: Shield,
    description: 'Adequate sample size (>=100) and acceptable data coverage (>=80%).',
  },
  DEGRADED: {
    label: 'DEGRADED QUALITY',
    classes: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
    icon: ShieldAlert,
    description: 'This baseline has incomplete historical coverage. The displayed percentile is an estimate.',
  },
  INSUFFICIENT: {
    label: 'INSUFFICIENT QUALITY',
    classes: 'bg-rose-950/40 text-rose-300 border-rose-800/60 border-dashed',
    icon: ShieldX,
    description: 'There is not enough comparable historical data to calculate a reliable rarity percentile.',
  },
};

export const BaselineQualityBadge: React.FC<BaselineQualityBadgeProps> = ({
  quality,
  size = 'md',
  showLabel = true,
  showWarningNotice = false,
  className = '',
}) => {
  const normalizedKey = (quality || 'INSUFFICIENT').toUpperCase();
  const config = QUALITY_CONFIG[normalizedKey] || QUALITY_CONFIG.INSUFFICIENT;
  const IconComponent = config.icon;

  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div
      className={`inline-flex flex-col ${className}`}
      data-testid="baseline-quality-badge"
    >
      <span
        className={`inline-flex items-center font-mono font-medium rounded border ${sizeClasses} ${config.classes}`}
        title={config.description}
        role="status"
        aria-label={`Baseline Quality: ${config.label}. ${config.description}`}
      >
        <IconComponent className={`${iconSize} shrink-0`} />
        {showLabel && <span>{config.label}</span>}
      </span>

      {showWarningNotice && (normalizedKey === 'DEGRADED' || normalizedKey === 'INSUFFICIENT') && (
        <span className="text-[11px] text-amber-400/90 mt-1 leading-normal max-w-sm">
          {config.description}
        </span>
      )}
    </div>
  );
};
