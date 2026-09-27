import React from 'react';
import { MetricRarity, BaselineQuality } from '../../types';
import { RarityBadge } from './RarityBadge';
import { BaselineQualityBadge } from './BaselineQualityBadge';
import { PercentileDisplay } from './PercentileDisplay';
import { TerminologyTooltip } from './TerminologyTooltip';
import { formatPopulation } from '../../utils/formatters';
import { BarChart3, Database, Info } from 'lucide-react';

interface RaritySummaryCardProps {
  primary: MetricRarity;
  baselineQuality?: BaselineQuality | string;
  onOpenDetails?: () => void;
  className?: string;
}

export const RaritySummaryCard: React.FC<RaritySummaryCardProps> = ({
  primary,
  baselineQuality,
  onOpenDetails,
  className = '',
}) => {
  const isInsufficient =
    primary.rarity_band === 'INSUFFICIENT_DATA' ||
    primary.percentile === null ||
    primary.population_size < 100;

  const quality = primary.baseline_quality || baselineQuality || 'HIGH';

  return (
    <div
      className={`bg-zinc-900/90 border border-zinc-800 rounded-lg p-5 shadow-lg backdrop-blur-sm ${className}`}
      data-testid="rarity-summary-card"
    >
      {/* Header with Metric Name & Rarity Badge */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Primary Anomaly Metric
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
              PRIMARY
            </span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100 font-mono tracking-tight">
            {primary.metric.toUpperCase().replace(/_/g, ' ')}
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Raw Value: <span className="text-zinc-200 font-medium">{primary.value_display || primary.value}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <RarityBadge band={primary.rarity_band} size="lg" />
          <BaselineQualityBadge quality={quality} size="sm" />
        </div>
      </div>

      {/* Main Statistical Context: Insufficient Data vs Evaluated Percentile */}
      {isInsufficient ? (
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-md p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase font-bold text-amber-300 tracking-wider">
                Insufficient Historical Data
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-semibold text-zinc-100 font-mono">
                  {formatPopulation(primary.population_size)}
                </span>{' '}
                comparable events are indexed in this baseline window.
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ObsChain requires at least <span className="font-mono text-zinc-300">100 samples</span> before
                assigning a rarity percentile or computing empirical impact.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/60 border border-zinc-800/80 rounded-md p-4 mb-4">
          {/* Percentile Highlight */}
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-mono text-zinc-400 mb-1">
              Statistical Percentile
            </span>
            <PercentileDisplay
              percentile={primary.percentile}
              method={primary.percentile_method}
              estimated={primary.estimated}
              size="xl"
            />
          </div>

          {/* Population & Tail Count Comparison */}
          <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[11px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
              <TerminologyTooltip term="Tail Count">
                <span>Extremity Count</span>
              </TerminologyTooltip>
            </span>
            <div className="text-sm font-mono text-zinc-200">
              {primary.tail_count !== null && primary.tail_count !== undefined ? (
                <>
                  <span className="font-bold text-emerald-400 text-base">
                    {formatPopulation(primary.tail_count)}
                  </span>{' '}
                  <span className="text-zinc-400">
                    events at or above this value
                  </span>
                </>
              ) : (
                <span className="text-zinc-400">Distribution quantile estimate</span>
              )}
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-500" />
              <span>
                out of{' '}
                <strong className="text-zinc-200">
                  {formatPopulation(primary.population_size)}
                </strong>{' '}
                comparable events
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Frequency & Methodology Metadata */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
        <div className="flex items-center justify-between gap-2 text-zinc-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <TerminologyTooltip term="eCDF">
              <span className="text-zinc-400">Calculation Method</span>
            </TerminologyTooltip>
          </span>
          <span className="text-zinc-200 font-medium">
            {primary.percentile_method === 'EXACT_EMPIRICAL_CDF'
              ? 'Exact Empirical CDF (eCDF)'
              : primary.percentile_method === 'QUANTILE_INTERPOLATION_ESTIMATE'
                ? 'Piece-wise Quantile Interpolation'
                : 'Insufficient Data'}
          </span>
        </div>

        {primary.frequency && (
          <div className="text-zinc-400 leading-relaxed text-[11px] bg-zinc-950/40 p-2.5 rounded border border-zinc-800/50">
            {primary.frequency}
          </div>
        )}

        {onOpenDetails && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onOpenDetails}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>How was this calculated?</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
