import React from 'react';
import { ImpactBreakdown } from '../../types';
import { formatPercentile } from '../../utils/formatters';
import { AlertTriangle, Gauge, ShieldAlert, Layers, HelpCircle } from 'lucide-react';
import { TerminologyTooltip } from './TerminologyTooltip';

interface ImpactBreakdownPanelProps {
  impact: ImpactBreakdown | null | undefined;
  className?: string;
}

export const ImpactBreakdownPanel: React.FC<ImpactBreakdownPanelProps> = ({
  impact,
  className = '',
}) => {
  if (!impact) {
    return (
      <div className={`bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 ${className}`}>
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Gauge className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-300">
            Impact Index
          </h3>
        </div>
        <p className="text-xs font-mono text-zinc-500">
          No impact calculation model configured for this event type.
        </p>
      </div>
    );
  }

  const isUnavailable = impact.score === null || impact.unavailable_reason !== null;
  const isPartial = impact.model_coverage < 1.0 && !isUnavailable;

  const renderUnavailableReasonText = () => {
    switch (impact.unavailable_reason) {
      case 'INSUFFICIENT_BASELINE':
        return 'Insufficient historical baseline sample count. At least 100 qualifying events are required to calibrate the impact model.';
      case 'INSUFFICIENT_COMPONENT_COVERAGE':
        return 'Insufficient component coverage. Less than 50% of model components could be evaluated from on-chain observations.';
      case 'RARITY_UNAVAILABLE':
        return 'Primary metric rarity could not be evaluated from storage.';
      default:
        return 'The impact index cannot be determined for this event due to statistical guardrails.';
    }
  };

  return (
    <div
      className={`bg-zinc-900/80 border border-zinc-800 rounded-lg p-5 shadow-lg ${className}`}
      data-testid="impact-breakdown-panel"
    >
      {/* Header with Title & Model ID */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">
              Multivariable Synthesis
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
              EXPERIMENTAL
            </span>
          </div>
          <h3 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-1.5">
            <TerminologyTooltip term="Impact Index">
              <span>Experimental Impact Index</span>
            </TerminologyTooltip>
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Model: <code className="text-zinc-400">{impact.model_id}</code>
          </p>
        </div>

        {/* Score Pill / Unavailable Status */}
        <div className="text-right">
          {isUnavailable ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/30 border border-amber-800/60 text-amber-300 font-mono text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>UNAVAILABLE</span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <div className="text-2xl font-black font-mono text-zinc-100">
                <span className="text-purple-400">{impact.score?.toFixed(1)}</span>
                <span className="text-zinc-500 text-sm font-normal"> / 100</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Coverage: {Math.round(impact.model_coverage * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Prominent Anomaly Index Warning (Section 20) */}
      <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-md p-3 mb-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] font-mono text-zinc-300 leading-relaxed">
          <strong className="text-amber-300 uppercase">Non-Comparability Notice:</strong> This is an
          event-type-specific experimental anomaly index. It is{' '}
          <strong className="text-zinc-100">not</strong> a criminality, ownership, risk, or trading score, and
          cannot be compared across different event types.
        </div>
      </div>

      {/* Unavailable State Notice (Section 21) */}
      {isUnavailable && (
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-md p-3.5 mb-4 text-xs font-mono text-amber-200/90 leading-relaxed flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300 uppercase tracking-wide mb-0.5">
              Impact Score Unavailable ({impact.unavailable_reason})
            </div>
            <div>{renderUnavailableReasonText()}</div>
          </div>
        </div>
      )}

      {/* Partial Coverage Notice (Section 22) */}
      {isPartial && (
        <div className="bg-blue-950/20 border border-blue-900/50 rounded-md p-3 mb-4 text-xs font-mono text-blue-200/90 leading-relaxed flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-300 uppercase tracking-wide">
              Partial Model Coverage ({Math.round(impact.model_coverage * 100)}%):
            </span>{' '}
            Some expected components were unavailable in the observed transaction payload. Score reflects evaluated components only.
          </div>
        </div>
      )}

      {/* Component Breakdown Table / Progress Bars */}
      {impact.components && impact.components.length > 0 && (
        <div className="space-y-3">
          <div className="text-[11px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
            Evaluated Sub-Components ({impact.components.length})
          </div>

          <div className="space-y-2.5">
            {impact.components.map((comp, idx) => {
              const awarded = comp.points_awarded ?? 0;
              const weight = comp.weight;
              const fillPercent = weight > 0 ? Math.min(100, Math.max(0, (awarded / weight) * 100)) : 0;

              return (
                <div
                  key={`${comp.component_name}-${idx}`}
                  className="bg-zinc-950/60 border border-zinc-800/80 rounded p-3 text-xs font-mono"
                >
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <span className="text-zinc-200 font-semibold">{comp.component_name}</span>
                    <div className="text-zinc-300">
                      <span className="text-purple-300 font-bold">{awarded.toFixed(1)}</span>
                      <span className="text-zinc-500"> / {weight.toFixed(0)} pts</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 flex-wrap gap-2">
                    <span>
                      Raw: <code className="text-zinc-300">{comp.raw_value}</code>
                    </span>
                    <span>
                      Percentile:{' '}
                      <span className="text-zinc-300">
                        {comp.percentile !== null ? formatPercentile(comp.percentile, { includeSuffix: true }) : 'N/A'}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
