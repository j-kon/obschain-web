import React from 'react';
import { PercentileMethod } from '../../types';
import { formatPercentile } from '../../utils/formatters';
import { Sparkles, Calculator, AlertCircle } from 'lucide-react';

interface PercentileDisplayProps {
  percentile: number | null | undefined;
  method?: PercentileMethod | null;
  estimated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMethodLabel?: boolean;
  className?: string;
}

export const PercentileDisplay: React.FC<PercentileDisplayProps> = ({
  percentile,
  method,
  estimated = false,
  size = 'md',
  showMethodLabel = true,
  className = '',
}) => {
  // Section 6: Insufficient historical data must never render 0% or 0th percentile
  if (percentile === null || percentile === undefined || isNaN(percentile)) {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-zinc-400 font-medium"
          aria-label="Percentile unavailable: Insufficient historical baseline data"
        >
          <AlertCircle className="w-4 h-4 text-amber-500/80 shrink-0" />
          <span className="text-zinc-300">Unavailable</span>
        </span>
        {showMethodLabel && (
          <span className="text-[11px] text-amber-500/80 font-mono tracking-tight mt-0.5">
            Insufficient baseline samples
          </span>
        )}
      </div>
    );
  }

  const isEstimated = estimated || method === 'QUANTILE_INTERPOLATION_ESTIMATE';
  const isExact = method === 'EXACT_EMPIRICAL_CDF' && !isEstimated;

  const formatted = formatPercentile(percentile, {
    estimated: isEstimated,
    includeSuffix: true,
    decimals: 2,
  });

  const sizeStyles = {
    sm: {
      text: 'text-xs',
      label: 'text-[10px]',
      badge: 'px-1 py-0.5 text-[9px]',
    },
    md: {
      text: 'text-sm font-semibold',
      label: 'text-[11px]',
      badge: 'px-1.5 py-0.5 text-[10px]',
    },
    lg: {
      text: 'text-xl font-bold',
      label: 'text-xs',
      badge: 'px-2 py-0.5 text-xs',
    },
    xl: {
      text: 'text-2xl sm:text-3xl font-extrabold',
      label: 'text-xs sm:text-sm',
      badge: 'px-2.5 py-1 text-xs',
    },
  }[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`font-mono tracking-tight ${sizeStyles.text} ${
            isExact ? 'text-zinc-100' : 'text-amber-200/90'
          }`}
          role="status"
          aria-label={`${formatted} ${isExact ? '(Exact empirical CDF)' : '(Estimated from quantiles)'}`}
        >
          {formatted}
        </span>

        {/* Distinct visual pill separating exact vs estimated */}
        {isExact ? (
          <span
            className={`inline-flex items-center gap-1 font-mono rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 ${sizeStyles.badge}`}
            title="Exact empirical comparison calculated against every observed event in the historical baseline"
          >
            <Calculator className="w-3 h-3 text-emerald-400" />
            <span>EXACT</span>
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 font-mono rounded bg-amber-950/40 text-amber-300 border border-dashed border-amber-800/60 ${sizeStyles.badge}`}
            title="Estimated by piece-wise quantile interpolation from historical baseline distribution"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ESTIMATE</span>
          </span>
        )}
      </div>

      {showMethodLabel && (
        <span className={`text-zinc-400 font-sans mt-0.5 ${sizeStyles.label}`}>
          {isExact
            ? 'Exact empirical comparison'
            : 'Estimated from historical distribution'}
        </span>
      )}
    </div>
  );
};
