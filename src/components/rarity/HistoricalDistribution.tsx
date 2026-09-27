import React from 'react';
import { BaselineDistribution } from '../../types';
import { formatPercentile } from '../../utils/formatters';

interface HistoricalDistributionProps {
  metricName: string;
  eventPercentile: number | null;
  eventValueDisplay?: string;
  distribution?: BaselineDistribution | null;
  className?: string;
}

export const HistoricalDistribution: React.FC<HistoricalDistributionProps> = ({
  metricName,
  eventPercentile,
  eventValueDisplay,
  distribution,
  className = '',
}) => {
  // Quantile tick definitions along the percentile axis
  const QUANTILES = [
    { p: 50, label: 'p50', name: 'Median' },
    { p: 75, label: 'p75', name: '75th' },
    { p: 90, label: 'p90', name: '90th' },
    { p: 95, label: 'p95', name: '95th' },
    { p: 99, label: 'p99', name: '99th' },
    { p: 99.9, label: 'p99.9', name: 'Extreme' },
  ];

  const hasPercentile = eventPercentile !== null && !isNaN(eventPercentile);

  // Map percentile (0-100) to visual position % (0-100)
  // We use a non-linear scale that emphasizes the tail (p90 -> p100 gets more visual space)
  const mapPercentileToX = (p: number): number => {
    const clamped = Math.max(0, Math.min(100, p));
    if (clamped <= 50) {
      // 0 to 50 maps to 0% to 25% of chart
      return (clamped / 50) * 25;
    } else if (clamped <= 90) {
      // 50 to 90 maps to 25% to 55% of chart
      return 25 + ((clamped - 50) / 40) * 30;
    } else if (clamped <= 99) {
      // 90 to 99 maps to 55% to 80% of chart
      return 55 + ((clamped - 90) / 9) * 25;
    } else {
      // 99 to 100 maps to 80% to 98% of chart
      return 80 + ((clamped - 99) / 1) * 18;
    }
  };

  const eventX = hasPercentile ? mapPercentileToX(eventPercentile) : 0;

  return (
    <div
      className={`bg-zinc-950/60 border border-zinc-800 rounded-lg p-5 ${className}`}
      data-testid="historical-distribution-chart"
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Historical Distribution Profile
          </h4>
          <span className="text-[11px] text-zinc-500 font-mono">
            {metricName.toUpperCase().replace(/_/g, ' ')} · Tail-expanded percentile scale
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            Non-linear tail expansion
          </span>
        </div>
      </div>

      {/* SVG Axis & Event Marker */}
      <div className="relative py-7 px-2">
        {/* Background baseline track */}
        <div className="h-2 w-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-purple-900/60 rounded-full relative">
          {/* Shaded rarity zones */}
          <div
            className="absolute top-0 bottom-0 left-[55%] right-0 bg-cyan-500/10 rounded-r-full"
            title="Notable zone (>=p90)"
          />
          <div
            className="absolute top-0 bottom-0 left-[69%] right-0 bg-amber-500/15 rounded-r-full"
            title="Unusual zone (>=p95)"
          />
          <div
            className="absolute top-0 bottom-0 left-[80%] right-0 bg-rose-500/20 rounded-r-full"
            title="Rare zone (>=p99)"
          />
          <div
            className="absolute top-0 bottom-0 left-[96%] right-0 bg-purple-500/30 rounded-r-full"
            title="Extreme zone (>=p99.9)"
          />
        </div>

        {/* Quantile Tick Marks */}
        {QUANTILES.map((q) => {
          const tickX = mapPercentileToX(q.p);
          return (
            <div
              key={q.label}
              className="absolute top-6 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${tickX}%` }}
            >
              <div className="w-0.5 h-3 bg-zinc-600 mb-1" />
              <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                {q.label}
              </span>
              <span className="text-[9px] font-mono text-zinc-600">
                {q.p}%
              </span>
            </div>
          );
        })}

        {/* Current Event Marker */}
        {hasPercentile ? (
          <div
            className="absolute top-2 -translate-x-1/2 flex flex-col items-center z-10"
            style={{ left: `${eventX}%` }}
          >
            {/* Tooltip badge above marker */}
            <div className="bg-purple-950 text-purple-200 border border-purple-600/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-lg mb-1 -translate-y-6">
              THIS EVENT: {formatPercentile(eventPercentile, { includeSuffix: false })}%
            </div>
            {/* Pulsing indicator needle */}
            <div className="w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-white shadow-md shadow-purple-500/50" />
            <div className="w-0.5 h-4 bg-purple-400" />
          </div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-mono text-amber-400/80 bg-zinc-900 px-3 py-1 rounded border border-dashed border-amber-800/50">
            Event marker unavailable (insufficient sample count)
          </div>
        )}
      </div>

      {/* Screen reader text equivalent for accessibility (Section 41) */}
      <div className="sr-only">
        {hasPercentile
          ? `Event metric ${metricName} is at the ${eventPercentile} percentile. Quantiles: median p50 at 50%, p75 at 75%, p90 at 90%, p95 at 95%, p99 at 99%, p99.9 at 99.9%.`
          : `Event metric ${metricName} cannot be displayed on the distribution due to insufficient samples.`}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-3 border-t border-zinc-800/60 mt-4 flex-wrap gap-2">
        <span>
          Current value: <strong className="text-zinc-200">{eventValueDisplay || 'N/A'}</strong>
        </span>
        {distribution && (
          <span>
            Baseline range: <span className="text-zinc-400">{String(distribution.minimum)} → {String(distribution.maximum)}</span>
          </span>
        )}
      </div>
    </div>
  );
};
