import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Database,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Radio,
  BarChart3,
  Gauge,
  History as HistoryIcon,
  AlertTriangle,
} from 'lucide-react';
import { fetchEvent } from '../api';
import { ChainEvent, EventRarityResponse, EventObservation } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { SourceBadge } from '../components/SourceBadge';
import { TransactionLink } from '../components/TransactionLink';
import { BlockLink } from '../components/BlockLink';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  formatRelativeTime,
  formatUtcTimestamp,
  formatLocalTimestamp,
} from '../utils/formatters';

// Specialized Cards for Metrics
import { DormantCoinsCard } from '../components/events/DormantCoinsCard';
import { ConsolidationCard } from '../components/events/ConsolidationCard';
import { FanOutCard } from '../components/events/FanOutCard';
import { ExtremeFeeCard } from '../components/events/ExtremeFeeCard';
import { ReplacementCard } from '../components/events/ReplacementCard';
import { LargeTransferCard } from '../components/events/LargeTransferCard';
import { LongBlockIntervalCard } from '../components/events/LongBlockIntervalCard';
import { WhyThisTriggered } from '../components/events/WhyThisTriggered';

// Rarity & Observation Components
import {
  RarityBadge,
  BaselineQualityBadge,
  PercentileDisplay,
  RaritySummaryCard,
  RarityMetricsPanel,
  HistoricalDistribution,
  BaselineContextCard,
  CalculationDetails,
  ImpactBreakdownPanel,
} from '../components/rarity';
import {
  ObservationLifecycle,
  WitnessPanel,
} from '../components/observations';
import { useEventRarity } from '../hooks/useEventRarity';
import { useEventObservations } from '../hooks/useEventObservations';

export interface EventDetailPageProps {
  initialEvent?: ChainEvent | null;
  initialError?: string | null;
  initialRarity?: EventRarityResponse | null;
  initialUnavailable503?: boolean;
  initialObservations?: EventObservation[];
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  initialEvent,
  initialError,
  initialRarity,
  initialUnavailable503 = false,
  initialObservations,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = paramId || initialEvent?.id;
  const [event, setEvent] = useState<ChainEvent | null>(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent && !initialError);
  const [error, setError] = useState<string | null>(initialError || null);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTxid, setCopiedTxid] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [calcDetailsOpen, setCalcDetailsOpen] = useState(false);

  // Non-blocking async enrichment hooks (with error isolation)
  const {
    rarity,
    loading: rarityLoading,
    error: rarityError,
    isUnavailable503,
  } = useEventRarity(id, undefined, initialRarity, initialUnavailable503);

  const {
    observations,
    loading: obsLoading,
    error: obsError,
  } = useEventObservations(id, initialObservations);

  useEffect(() => {
    if (!id || initialEvent) return;
    setLoading(true);
    setError(null);

    fetchEvent(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [id, initialEvent]);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return <LoadingState message="Loading event observation report..." />;
  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events Feed</span>
        </Link>
        <ErrorState error={error || 'Event observation not found'} />
      </div>
    );
  }

  const renderSpecializedMetrics = () => {
    switch (event.event_type) {
      case 'DORMANT_COINS_MOVED':
      case 'DORMANT_UTXO_SPENT':
        return <DormantCoinsCard event={event} />;
      case 'CONSOLIDATION':
        return <ConsolidationCard event={event} />;
      case 'FAN_OUT':
        return <FanOutCard event={event} />;
      case 'EXTREME_FEE':
      case 'FEE_SPIKE':
        return <ExtremeFeeCard event={event} />;
      case 'TRANSACTION_REPLACEMENT':
      case 'RBF_REPLACEMENT':
        return <ReplacementCard event={event} />;
      case 'LARGE_TRANSFER':
        return <LargeTransferCard event={event} />;
      case 'LONG_BLOCK_INTERVAL':
        return <LongBlockIntervalCard event={event} />;
      default:
        return null;
    }
  };

  const primaryRarity = rarity?.primary;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Observations Feed</span>
        </Link>
      </div>

      {/* Main Dossier Report */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-surface-border">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={event.severity} />
              <EvidenceBadge
                classification={
                  event.confidence === 'VERIFIED_ON_CHAIN'
                    ? 'ON_CHAIN_VERIFIED'
                    : 'HEURISTIC'
                }
              />
              <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-700/60 uppercase">
                {event.event_type.replace(/_/g, ' ')}
              </span>
              {event.source && <SourceBadge source={event.source} />}

              {/* Rarity & Impact badges if enriched */}
              {primaryRarity && (
                <div className="flex items-center gap-1.5">
                  <RarityBadge band={primaryRarity.band} size="sm" showLabel={true} />
                  {primaryRarity.percentile !== null && primaryRarity.percentile !== undefined && (
                    <PercentileDisplay
                      percentile={primaryRarity.percentile}
                      method={primaryRarity.percentile_method}
                      estimated={primaryRarity.estimated}
                      size="sm"
                      showMethodLabel={false}
                    />
                  )}
                  <BaselineQualityBadge quality={primaryRarity.baseline_quality} size="sm" />
                </div>
              )}

              {rarity?.impact?.score !== null && rarity?.impact?.score !== undefined && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-purple-950/50 text-purple-300 border border-purple-800/60"
                  title="ObsChain Event Impact Index"
                >
                  Impact {rarity.impact.score}/100
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {event.title}
            </h1>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 sm:justify-end text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{formatRelativeTime(event.detected_at)}</span>
            </div>
            <div className="text-[11px] text-slate-400" title="Universal Coordinated Time">
              {formatUtcTimestamp(event.detected_at)}
            </div>
            <div className="text-[10px] text-slate-400" title="User Local Time">
              {formatLocalTimestamp(event.detected_at)}
            </div>
          </div>
        </div>

        {/* Section 1: Event Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>Observation Summary</span>
          </h2>
          <div className="p-4 rounded-lg bg-surface-card/60 border border-surface-border text-slate-200 text-sm leading-relaxed font-sans">
            {event.description}
          </div>
        </div>

        {/* Section 2: Why This Triggered */}
        <WhyThisTriggered event={event} />

        {/* Section 3: Primary Observation Metrics */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Primary Observation Metrics</span>
          </h2>
          {renderSpecializedMetrics()}
        </div>

        {/* Section 4: Historical Rarity & Statistical Context */}
        <div className="space-y-4 pt-2 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Historical Rarity &amp; Empirical Context</span>
            </h2>
            {rarity && (
              <span className="text-[11px] font-mono text-slate-500">
                Baseline: {rarity.baseline.baseline_id}
              </span>
            )}
          </div>

          {/* Rarity Loading State */}
          {rarityLoading && (
            <div className="p-6 rounded-lg bg-zinc-950/40 border border-zinc-800 animate-pulse space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-20 bg-zinc-850 rounded w-full"></div>
            </div>
          )}

          {/* 503 Isolation State */}
          {isUnavailable503 && (
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Historical Rarity Temporarily Unavailable (503)</span>
              </div>
              <p className="text-amber-200/80">
                Exact-rank storage indexer is currently unavailable or under maintenance.
                Event observation details and metrics remain fully accessible.
              </p>
            </div>
          )}

          {/* Non-503 Error State */}
          {rarityError && !isUnavailable503 && (
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
              <span>{rarityError}</span>
            </div>
          )}

          {/* Loaded Rarity Analysis */}
          {rarity && primaryRarity && (
            <div className="space-y-4">
              <RaritySummaryCard
                primary={primaryRarity}
                baselineQuality={rarity.baseline.quality}
                onOpenDetails={() => setCalcDetailsOpen(true)}
              />

              {/* Distribution curve */}
              <HistoricalDistribution
                metricName={primaryRarity.metric}
                eventPercentile={primaryRarity.percentile}
                eventValueDisplay={primaryRarity.value_display}
              />

              {/* Secondary component metrics */}
              {rarity.secondary && rarity.secondary.length > 0 && (
                <RarityMetricsPanel
                  primary={primaryRarity}
                  secondary={rarity.secondary}
                />
              )}

              {/* Baseline identity card */}
              <BaselineContextCard baseline={rarity.baseline} />

              {/* Accessible Calculation Details Modal */}
              <CalculationDetails
                isOpen={calcDetailsOpen}
                onClose={() => setCalcDetailsOpen(false)}
                primary={primaryRarity}
                baseline={rarity.baseline}
              />
            </div>
          )}
        </div>

        {/* Section 5: Impact Breakdown */}
        <div className="space-y-3 pt-2 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Event Impact Index</span>
            </h2>
          </div>

          <ImpactBreakdownPanel impact={rarity?.impact} />
        </div>

        {/* Section 6: Observation Lifecycle & Corroborating Witnesses */}
        <div className="space-y-4 pt-2 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HistoryIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Observation Lifecycle &amp; Witness Corroboration</span>
            </h2>
          </div>

          {obsError && (
            <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <span>Observation history note: {obsError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ObservationLifecycle
              observations={observations}
              isLoading={obsLoading}
            />
            <WitnessPanel
              primarySource={event.source}
              observations={observations}
            />
          </div>
        </div>

        {/* Section 7: Cryptographic Identifiers */}
        <div className="space-y-3 pt-2 border-t border-surface-border">
          <h2 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Cryptographic Identifiers &amp; Anchors</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {/* Event ID */}
            <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Event ID</span>
                <button
                  onClick={() => copyToClipboard(event.id, setCopiedId)}
                  className="hover:text-amber-400 transition-colors"
                  title="Copy Event ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-slate-200 select-all font-mono text-[11px] truncate" title={event.id}>
                {event.id}
              </div>
            </div>

            {/* Transaction ID */}
            <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Associated Transaction</span>
                {event.txid && (
                  <button
                    onClick={() => copyToClipboard(event.txid!, setCopiedTxid)}
                    className="hover:text-amber-400 transition-colors"
                    title="Copy TXID"
                  >
                    {copiedTxid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              {event.txid ? (
                <div>
                  <TransactionLink txid={event.txid} truncate={true} />
                </div>
              ) : (
                <div className="text-slate-400 italic text-[11px]">No specific tx bound</div>
              )}
            </div>

            {/* Block Anchor */}
            <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Block Anchor</span>
                {event.block_hash && (
                  <button
                    onClick={() => copyToClipboard(event.block_hash!, setCopiedHash)}
                    className="hover:text-sky-400 transition-colors"
                    title="Copy Block Hash"
                  >
                    {copiedHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              {event.block_height ? (
                <div className="flex items-center gap-2">
                  <BlockLink height={event.block_height} hash={event.block_hash} />
                  {event.block_hash && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={event.block_hash}>
                      {event.block_hash.slice(0, 10)}...
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 italic text-[11px]">Mempool (unconfirmed)</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 8: Provenance & Attribution */}
        <div className="p-4 rounded-lg bg-surface-card/40 border border-surface-border space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Provenance &amp; Attribution
            </span>
            <span className="text-slate-400 text-[10px]">Continuous Verification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Data Origin</span>
              <span>
                {event.source
                  ? `${event.source.provider} (${event.source.transport})`
                  : 'ObsChain Core Ingestion'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Confidence Rating</span>
              <span className="text-emerald-400 font-semibold">
                {event.confidence.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 9: Raw Event Data */}
        <div className="pt-2 border-t border-surface-border">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="w-full flex items-center justify-between py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>Raw Event Data (JSON Payload)</span>
            </span>
            {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawJson && (
            <div className="mt-2 relative">
              <pre className="p-4 rounded-lg bg-[#06080D] border border-surface-border font-mono text-xs text-amber-400/90 overflow-x-auto leading-relaxed">
                {JSON.stringify(
                  {
                    event,
                    rarity,
                    observations,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
