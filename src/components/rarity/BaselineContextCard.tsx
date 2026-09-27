import React from 'react';
import { BaselineIdentity } from '../../types';
import { BaselineQualityBadge } from './BaselineQualityBadge';
import { formatPopulation } from '../../utils/formatters';
import { Compass, Hash, Calendar, Binary } from 'lucide-react';

interface BaselineContextCardProps {
  baseline: BaselineIdentity;
  className?: string;
}

export const BaselineContextCard: React.FC<BaselineContextCardProps> = ({
  baseline,
  className = '',
}) => {
  const blockRangeSpan = baseline.end_height - baseline.start_height;

  return (
    <div
      className={`bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 ${className}`}
      data-testid="baseline-context-card"
    >
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
            Historical Baseline Context
          </h3>
        </div>
        <BaselineQualityBadge quality={baseline.quality} size="sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
        {/* Network & Block Range */}
        <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Hash className="w-3.5 h-3.5 text-zinc-500" />
            <span>Block Height Window</span>
          </div>
          <div className="text-zinc-100 font-semibold">
            {baseline.start_height.toLocaleString()} → {baseline.end_height.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500">
            {blockRangeSpan.toLocaleString()} blocks (~{Math.round((blockRangeSpan * 10) / 1440)} days)
          </span>
        </div>

        {/* Population & Sample Count */}
        <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Qualifying Population</span>
          </div>
          <div className="text-zinc-100 font-semibold">
            {formatPopulation(baseline.sample_count || baseline.population_size)} events
          </div>
          <span className="text-[11px] text-zinc-500">
            Mode: {baseline.evaluation_mode || 'CANONICAL_EVENTS'}
          </span>
        </div>

        {/* Algorithm & Specification */}
        <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800/60 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Binary className="w-3.5 h-3.5 text-zinc-500" />
            <span>Algorithmic Specification</span>
          </div>
          <div className="text-zinc-200 truncate" title={baseline.algorithm_version}>
            {baseline.algorithm_version}
          </div>
          <span className="text-[11px] text-zinc-500 truncate block" title={baseline.metric_definition_version}>
            Def: {baseline.metric_definition_version}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500 flex-wrap gap-2">
        <span className="truncate">
          Baseline ID: <code className="text-zinc-400 select-all">{baseline.baseline_id || baseline.id}</code>
        </span>
        <span className="text-zinc-400 font-medium uppercase">
          Network: {baseline.network}
        </span>
      </div>
    </div>
  );
};
