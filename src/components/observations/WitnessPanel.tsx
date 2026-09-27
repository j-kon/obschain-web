import React from 'react';
import { EventObservation, ObservationSource } from '../../types';
import { formatUtcTimestamp } from '../../utils/formatters';
import { ShieldCheck, Radio, Server, Globe, History, Check } from 'lucide-react';

interface WitnessPanelProps {
  primarySource?: ObservationSource | null;
  observations: EventObservation[];
  className?: string;
}

export const WitnessPanel: React.FC<WitnessPanelProps> = ({
  primarySource,
  observations,
  className = '',
}) => {
  // Aggregate unique witness sources
  const witnessMap = new Map<
    string,
    {
      source: ObservationSource;
      isPrimary: boolean;
      isReplay: boolean;
      firstSeen: string;
      observationCount: number;
    }
  >();

  // If primary source exists on event
  if (primarySource) {
    const key = `${primarySource.provider}:${primarySource.transport}`;
    witnessMap.set(key, {
      source: primarySource,
      isPrimary: true,
      isReplay: primarySource.provider.toLowerCase().includes('replay'),
      firstSeen: '',
      observationCount: 1,
    });
  }

  // Corroborate with all observations
  observations.forEach((obs, idx) => {
    const key = `${obs.source.provider}:${obs.source.transport}`;
    const existing = witnessMap.get(key);
    const isReplay = obs.mode === 'HISTORICAL_REPLAY' || obs.kind === 'HISTORICAL_REPLAY';

    if (existing) {
      existing.observationCount += 1;
      if (!existing.firstSeen || new Date(obs.observed_at) < new Date(existing.firstSeen)) {
        existing.firstSeen = obs.observed_at;
      }
    } else {
      witnessMap.set(key, {
        source: obs.source,
        isPrimary: idx === 0 && !primarySource,
        isReplay,
        firstSeen: obs.observed_at,
        observationCount: 1,
      });
    }
  });

  const witnesses = Array.from(witnessMap.values());

  const getSourceIcon = (provider: string, transport: string, isReplay: boolean) => {
    if (isReplay) return History;
    if (provider.toLowerCase().includes('bitcoin')) return Server;
    if (transport.toLowerCase().includes('zmq') || transport.toLowerCase().includes('ws')) return Radio;
    return Globe;
  };

  return (
    <div
      className={`bg-zinc-900/70 border border-zinc-800 rounded-lg p-5 ${className}`}
      data-testid="witness-panel"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
            Witnesses & Corroborating Sources
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {witnesses.length} independent {witnesses.length === 1 ? 'source' : 'sources'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {witnesses.map((w) => {
          const Icon = getSourceIcon(w.source.provider, w.source.transport, w.isReplay);

          return (
            <div
              key={`${w.source.provider}-${w.source.transport}`}
              className={`p-3.5 rounded-md border text-xs font-mono flex items-start gap-3 ${
                w.isPrimary
                  ? 'bg-zinc-950/80 border-emerald-900/50 shadow-sm'
                  : 'bg-zinc-950/40 border-zinc-800/60'
              }`}
            >
              <div
                className={`p-2 rounded-md shrink-0 ${
                  w.isPrimary
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-bold text-zinc-200 truncate">
                    {w.source.provider}
                  </span>
                  {w.isPrimary && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
                      PRIMARY WITNESS
                    </span>
                  )}
                  {!w.isPrimary && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      CORROBORATING
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center gap-2 mb-1.5">
                  <span>Transport: <code className="text-zinc-300">{w.source.transport}</code></span>
                  {w.source.endpoint && (
                    <span className="text-zinc-500 truncate" title={w.source.endpoint}>
                      ({w.source.endpoint})
                    </span>
                  )}
                </div>

                <div className="text-[11px] pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-zinc-500">
                  {w.isReplay ? (
                    <span className="text-amber-400 font-medium">
                      Historical reconstruction
                    </span>
                  ) : (
                    <span className="text-emerald-400/90 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Observed live
                    </span>
                  )}

                  {w.firstSeen && (
                    <span title={formatUtcTimestamp(w.firstSeen)}>
                      {formatUtcTimestamp(w.firstSeen).split(',')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
