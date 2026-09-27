import React from 'react';
import { EventObservation, EventObservationKind } from '../../types';
import { formatUtcTimestamp, formatRelativeTime } from '../../utils/formatters';
import {
  Eye,
  Radio,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  History,
  Clock,
  Layers,
} from 'lucide-react';

interface ObservationLifecycleProps {
  observations: EventObservation[];
  isLoading?: boolean;
  className?: string;
}

interface KindConfig {
  label: string;
  badgeClasses: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const KIND_CONFIG: Record<EventObservationKind, KindConfig> = {
  FIRST_SEEN: {
    label: 'FIRST SEEN',
    badgeClasses: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    icon: Eye,
    description: 'Initial ingestion into ObsChain real-time pipeline.',
  },
  MEMPOOL_SEEN: {
    label: 'MEMPOOL SEEN',
    badgeClasses: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    icon: Radio,
    description: 'Observed unconfirmed in memory pool.',
  },
  CONFIRMED: {
    label: 'CONFIRMED',
    badgeClasses: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    icon: CheckCircle2,
    description: 'Verified on-chain inside an accepted Bitcoin block.',
  },
  REORGED_OUT: {
    label: 'REORGED OUT',
    badgeClasses: 'bg-amber-950/60 text-amber-300 border-amber-800/60 border-dashed',
    icon: RefreshCcw,
    description:
      'Chain reorganization: block disconnected during normal consensus resolution. Not an exploit or attack.',
  },
  WITNESSED: {
    label: 'WITNESSED',
    badgeClasses: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    icon: Sparkles,
    description: 'Corroborated by an independent secondary witness node or provider.',
  },
  HISTORICAL_REPLAY: {
    label: 'HISTORICAL REPLAY',
    badgeClasses: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: History,
    description: 'Reconstructed from historical Bitcoin data during replay batch execution.',
  },
};

export const ObservationLifecycle: React.FC<ObservationLifecycleProps> = ({
  observations,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 animate-pulse ${className}`}>
        <div className="h-4 w-48 bg-zinc-800 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-zinc-950/40 rounded border border-zinc-800/60" />
          <div className="h-14 bg-zinc-950/40 rounded border border-zinc-800/60" />
        </div>
      </div>
    );
  }

  // Sort chronological
  const sorted = [...observations].sort(
    (a, b) => new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime()
  );

  return (
    <div
      className={`bg-zinc-900/70 border border-zinc-800 rounded-lg p-5 ${className}`}
      data-testid="observation-lifecycle"
    >
      {/* Header with Title & Provenance Philosophy Notice (Section 25) */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
              Observation Lifecycle & Provenance
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {sorted.length} recorded {sorted.length === 1 ? 'stage' : 'stages'}
          </span>
        </div>

        {/* Section 25 copy */}
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          This Bitcoin event occurred once on the blockchain. ObsChain may observe it through multiple
          independent sources, transport layers, and lifecycle stages.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="p-4 bg-zinc-950/40 border border-zinc-800/60 rounded text-center text-xs font-mono text-zinc-500">
          No additional observation lifecycle stages recorded for this event.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
          {sorted.map((obs, idx) => {
            const config = KIND_CONFIG[obs.kind] || KIND_CONFIG.FIRST_SEEN;
            const IconComponent = config.icon;
            const isReplay = obs.mode === 'HISTORICAL_REPLAY' || obs.kind === 'HISTORICAL_REPLAY';

            return (
              <div
                key={obs.id || `${obs.kind}-${idx}`}
                className="relative bg-zinc-950/70 border border-zinc-800/80 rounded-md p-3 text-xs font-mono"
              >
                {/* Node bullet marker */}
                <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>

                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${config.badgeClasses}`}
                    >
                      <IconComponent className="w-3 h-3" />
                      <span>{config.label}</span>
                    </span>

                    <span className="text-zinc-300 font-semibold">
                      {obs.source.provider} · {obs.source.transport}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span title={formatUtcTimestamp(obs.observed_at)}>
                      {formatRelativeTime(obs.observed_at)}
                    </span>
                  </div>
                </div>

                {/* Subtitle / Description / Reorg / Replay notice */}
                <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                  {config.description}
                </p>

                {/* Metadata pills (height, hash, mode) */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-800/60 flex-wrap">
                  {isReplay ? (
                    <span className="text-amber-400/90 font-medium">
                      Reconstructed from historical Bitcoin data
                    </span>
                  ) : (
                    <span className="text-emerald-400/90 font-medium">
                      Observed live
                    </span>
                  )}

                  {obs.block_height !== null && obs.block_height !== undefined && (
                    <span>
                      Block: <strong className="text-zinc-300">{obs.block_height.toLocaleString()}</strong>
                    </span>
                  )}

                  {obs.block_hash && (
                    <span className="truncate max-w-[200px]" title={obs.block_hash}>
                      Hash: <code className="text-zinc-400">{obs.block_hash.slice(0, 14)}...</code>
                    </span>
                  )}

                  <span className="text-zinc-600 ml-auto">
                    {formatUtcTimestamp(obs.observed_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
