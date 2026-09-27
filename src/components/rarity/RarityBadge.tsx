import React from 'react';
import {
  Flame,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { RarityBand } from '../../types';

export interface RarityBadgeProps {
  band: RarityBand | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

interface BandConfig {
  label: string;
  classes: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const BAND_CONFIG: Record<string, BandConfig> = {
  EXTREME: {
    label: 'EXTREME',
    classes: 'bg-purple-950/50 text-purple-300 border-purple-800/70 shadow-sm shadow-purple-950/50',
    icon: Flame,
    description: 'Statistically extreme relative to the historical baseline (>99.9th percentile). Does not imply criminality or danger.',
  },
  RARE: {
    label: 'RARE',
    classes: 'bg-rose-950/40 text-rose-300 border-rose-800/60',
    icon: Sparkles,
    description: 'Top 1% statistical occurrence relative to the historical baseline (>99.0th percentile).',
  },
  UNUSUAL: {
    label: 'UNUSUAL',
    classes: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
    icon: AlertTriangle,
    description: 'Top 5% statistical occurrence relative to the historical baseline (>95.0th percentile).',
  },
  NOTABLE: {
    label: 'NOTABLE',
    classes: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60',
    icon: Info,
    description: 'Top 10% statistical occurrence relative to the historical baseline (>90.0th percentile).',
  },
  COMMON: {
    label: 'COMMON',
    classes: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    icon: CheckCircle2,
    description: 'Standard on-chain activity within the 90th percentile of baseline distribution.',
  },
  INSUFFICIENT_DATA: {
    label: 'INSUFFICIENT DATA',
    classes: 'bg-zinc-900 text-amber-400/90 border-dashed border-amber-800/50',
    icon: HelpCircle,
    description: 'Sample size below minimum threshold (100 events required) or baseline quality insufficient.',
  },
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-mono tracking-wider',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-mono tracking-wider',
  lg: 'text-sm px-3.5 py-1.5 gap-2 font-mono tracking-wider',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const RarityBadge: React.FC<RarityBadgeProps> = ({
  band,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = '',
}) => {
  const normalizedKey = (band || 'COMMON').toUpperCase();
  const config = BAND_CONFIG[normalizedKey] || BAND_CONFIG.COMMON;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${SIZE_CLASSES[size]} ${config.classes} ${className}`}
      title={config.description}
      role="status"
      data-testid="rarity-badge"
      aria-label={`Rarity Band: ${config.label}. ${config.description}`}
    >
      {showIcon && <IconComponent className={`${ICON_SIZES[size]} shrink-0`} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
