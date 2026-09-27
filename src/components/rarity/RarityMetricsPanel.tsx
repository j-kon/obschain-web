import React from 'react';
import { MetricRarity } from '../../types';
import { RarityBadge } from './RarityBadge';
import { PercentileDisplay } from './PercentileDisplay';
import { Layers } from 'lucide-react';

interface RarityMetricsPanelProps {
  primary: MetricRarity;
  secondary: MetricRarity[];
  className?: string;
}

export const RarityMetricsPanel: React.FC<RarityMetricsPanelProps> = ({
  primary,
  secondary,
  className = '',
}) => {
  const allMetrics = [primary, ...secondary];

  return (
    <div className={`bg-zinc-900/70 border border-zinc-800 rounded-lg p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
          Component Rarity Metrics
        </h3>
        <span className="text-xs font-mono text-zinc-500">
          ({allMetrics.length} tracked {allMetrics.length === 1 ? 'dimension' : 'dimensions'})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allMetrics.map((m, idx) => {
          const isPrimary = m.is_primary ?? idx === 0;

          return (
            <div
              key={`${m.metric}-${idx}`}
              className={`p-3.5 rounded-md border transition-all ${
                isPrimary
                  ? 'bg-zinc-900/90 border-zinc-700/80 shadow-sm'
                  : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold text-zinc-200">
                      {m.metric.toUpperCase().replace(/_/g, ' ')}
                    </span>
                    {isPrimary && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {m.value_display || m.value}
                  </span>
                </div>
                <RarityBadge band={m.rarity_band} size="sm" />
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800/60">
                <PercentileDisplay
                  percentile={m.percentile}
                  method={m.percentile_method}
                  estimated={m.estimated}
                  size="sm"
                  showMethodLabel={false}
                />
                <span className="text-[10px] font-mono text-zinc-500">
                  {m.percentile_method === 'EXACT_EMPIRICAL_CDF'
                    ? 'eCDF'
                    : m.percentile_method === 'QUANTILE_INTERPOLATION_ESTIMATE'
                      ? 'Quantile'
                      : 'Unavailable'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
