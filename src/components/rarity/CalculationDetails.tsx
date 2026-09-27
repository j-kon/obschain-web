import React, { useEffect } from 'react';
import { MetricRarity, BaselineIdentity } from '../../types';
import { X, Calculator, CheckCircle2 } from 'lucide-react';
import { formatPopulation, formatPercentile } from '../../utils/formatters';

interface CalculationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  primary: MetricRarity;
  baseline: BaselineIdentity;
}

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({
  isOpen,
  onClose,
  primary,
  baseline,
}) => {
  // ESC key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isExact = primary.percentile_method === 'EXACT_EMPIRICAL_CDF' && !primary.estimated;
  const isInsufficient = primary.rarity_band === 'INSUFFICIENT_DATA' || primary.percentile === null;

  // Exact eCDF counts:
  // If tail_count = 11 out of 18,421, then (18,421 - 11) = 18,410 were <= this value
  const tailCount = primary.tail_count ?? 0;
  const population = primary.population_size;
  const rankCount = Math.max(0, population - tailCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calc-details-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Methodology & Audit Proof
              </span>
            </div>
            <h2 id="calc-details-title" className="text-xl font-bold font-mono text-zinc-100">
              How Was This Rarity Calculated?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="Close calculation details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mathematical Explanation */}
        <div className="py-4 space-y-4 text-sm leading-relaxed">
          {isInsufficient ? (
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-4 space-y-2">
              <h3 className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wide">
                Insufficient Historical Samples
              </h3>
              <p className="text-zinc-300 text-xs">
                The current baseline index only contains{' '}
                <strong className="text-zinc-100 font-mono">{formatPopulation(population)}</strong>{' '}
                qualifying canonical events for this event type.
              </p>
              <p className="text-zinc-400 text-xs">
                To prevent false statistical confidence and manufactured precision, ObsChain strictly requires
                at least 100 historical samples before evaluating rarity percentiles.
              </p>
            </div>
          ) : isExact ? (
            <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4 space-y-3">
              <h3 className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Exact Empirical CDF Calculation
              </h3>
              <p className="text-zinc-300 text-xs">
                In this historical baseline window, exactly{' '}
                <strong className="text-zinc-100 font-mono">{formatPopulation(rankCount)}</strong> of{' '}
                <strong className="text-zinc-100 font-mono">{formatPopulation(population)}</strong>{' '}
                comparable events had values less than or equal to this event.
              </p>
              <div className="p-3 bg-zinc-950/70 rounded border border-zinc-800 font-mono text-xs text-zinc-200">
                Percentile = (Rank / Total Population) × 100 = (
                {formatPopulation(rankCount)} / {formatPopulation(population)}) × 100 ={' '}
                <span className="text-emerald-400 font-bold">
                  {formatPercentile(primary.percentile, { includeSuffix: false })}%
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Because exact event rows are persisted in the normalized canonical event metric store, this calculation
                does not rely on estimation, histograms, or bell curve assumptions.
              </p>
            </div>
          ) : (
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-4 space-y-3">
              <h3 className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                Quantile Interpolation Estimate
              </h3>
              <p className="text-zinc-300 text-xs">
                Exact event rows for this metric were not available in the indexed population. The percentile was estimated
                via piece-wise linear interpolation across calibrated quantile distribution checkpoints (p50, p75, p90, p95, p99, p99.9).
              </p>
              <div className="p-3 bg-zinc-950/70 rounded border border-zinc-800 font-mono text-xs text-amber-200">
                Estimated Percentile:{' '}
                <span className="font-bold text-amber-300">
                  {formatPercentile(primary.percentile, { estimated: true, includeSuffix: true })}
                </span>
              </div>
            </div>
          )}

          {/* Audit Metadata Table */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Audit Provenance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Metric</span>
                <span className="text-zinc-200">{primary.metric}</span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Raw Value</span>
                <span className="text-zinc-200">{primary.value_display || primary.value}</span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Block Range</span>
                <span className="text-zinc-200">
                  {baseline.start_height.toLocaleString()} → {baseline.end_height.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Population Size</span>
                <span className="text-zinc-200">{formatPopulation(baseline.sample_count)}</span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Extremity (Tail Count)</span>
                <span className="text-zinc-200">
                  {primary.tail_count !== null ? formatPopulation(primary.tail_count) : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Baseline Quality</span>
                <span className="text-zinc-200">{baseline.quality}</span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Algorithm Version</span>
                <span className="text-zinc-200 truncate ml-2" title={baseline.algorithm_version}>
                  {baseline.algorithm_version}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-500">Metric Version</span>
                <span className="text-zinc-200 truncate ml-2" title={baseline.metric_definition_version}>
                  {baseline.metric_definition_version}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-medium rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Close Audit Details
          </button>
        </div>
      </div>
    </div>
  );
};
