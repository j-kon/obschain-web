import { EventType, ObservationSource } from './index';

// ---------------------------------------------------------------------------
// Statistical & Rarity Enums
// ---------------------------------------------------------------------------

export type RarityBand =
  | 'COMMON'
  | 'NOTABLE'
  | 'UNUSUAL'
  | 'RARE'
  | 'EXTREME'
  | 'INSUFFICIENT_DATA';

export type PercentileMethod =
  | 'EXACT_EMPIRICAL_CDF'
  | 'QUANTILE_INTERPOLATION_ESTIMATE';

export type BaselineQuality =
  | 'HIGH'
  | 'MODERATE'
  | 'DEGRADED'
  | 'INSUFFICIENT';

export type EvaluationMode =
  | 'CANONICAL_EVENTS'
  | 'RAW_BLOCKS'
  | 'EMPIRICAL_DISTRIBUTION';

export type ImpactUnavailableReason =
  | 'INSUFFICIENT_BASELINE'
  | 'INSUFFICIENT_COMPONENT_COVERAGE'
  | 'RARITY_UNAVAILABLE';

// ---------------------------------------------------------------------------
// Metric Rarity & Impact Models (Frozen Backend Contract)
// ---------------------------------------------------------------------------

export interface MetricRarity {
  metric: string;
  value: string;
  value_display: string;
  percentile: number | null;
  percentile_method: PercentileMethod | null;
  estimated: boolean;
  rarity_band: RarityBand;
  band: RarityBand;
  rarity: RarityBand;
  population_size: number;
  tail_count: number | null;
  baseline_quality: BaselineQuality;
  frequency: string;
  is_primary: boolean;
}

export interface ImpactComponent {
  component_name: string;
  metric: string;
  raw_value: string;
  percentile: number | null;
  weight: number;
  points_awarded: number;
  population_size: number;
}

export interface ImpactBreakdown {
  status: string;
  model_id: string;
  model_version?: string;
  event_type: EventType | string;
  score: number | null;
  max_possible_points: number;
  model_coverage: number;
  coverage_ratio?: number;
  unavailable_reason: ImpactUnavailableReason | null;
  components: ImpactComponent[];
}

export interface BaselineIdentity {
  id: string;
  baseline_id: string;
  algorithm_version: string;
  metric_definition_version: string;
  network: string;
  start_height: number;
  end_height: number;
  sample_count: number;
  population_size: number;
  quality: BaselineQuality | string;
  evaluation_mode: EvaluationMode | string;
}

export interface EventRarityResponse {
  event_id: string;
  event_type: EventType;
  baseline: BaselineIdentity;
  primary: MetricRarity;
  secondary: MetricRarity[];
  metrics: MetricRarity[];
  impact: ImpactBreakdown | null;
}

export interface EventEnrichedRarity {
  baseline_id: string;
  primary: MetricRarity;
  secondary: MetricRarity[];
  impact?: ImpactBreakdown | null;
}

// ---------------------------------------------------------------------------
// Observation Provenance & Lifecycle Models
// ---------------------------------------------------------------------------

export type EventObservationKind =
  | 'FIRST_SEEN'
  | 'MEMPOOL_SEEN'
  | 'CONFIRMED'
  | 'REORGED_OUT'
  | 'WITNESSED'
  | 'HISTORICAL_REPLAY';

export type ObservationMode =
  | 'LIVE'
  | 'HISTORICAL_REPLAY';

export interface ObservationWitness {
  source: ObservationSource;
  observed_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface EventObservation {
  id: string;
  event_id: string;
  mode: ObservationMode;
  kind: EventObservationKind;
  source: ObservationSource;
  observed_at: string;
  bitcoin_time?: string | null;
  replay_job_id?: string | null;
  block_height?: number | null;
  block_hash?: string | null;
  confirmation_status?: string | null;
  source_sequence?: number | null;
  mempool_sequence?: number | null;
  witness?: ObservationWitness | null;
}

export interface EventObservationsResponse {
  event_id: string;
  observations: EventObservation[];
  count: number;
}

// ---------------------------------------------------------------------------
// Baseline Run & Statistical Distribution Models
// ---------------------------------------------------------------------------

export type BaselineRunStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED';

export interface BaselineRun {
  id: string;
  network: string;
  start_height: number;
  end_height: number;
  started_at: string;
  completed_at?: string | null;
  status: BaselineRunStatus;
  algorithm_version: string;
  canonical_event_count: number;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface BaselineDistribution {
  id: string;
  baseline_run_id: string;
  event_type: EventType | string;
  metric: string;
  unit: string;
  sample_count: number;
  candidate_count: number;
  missing_count: number;
  coverage_ratio: number;
  minimum: unknown;
  maximum: unknown;
  mean: number;
  p50: unknown;
  p75: unknown;
  p90: unknown;
  p95: unknown;
  p99: unknown;
  p999: unknown;
  quality: BaselineQuality;
  samples_json?: unknown;
  created_at: string;
}

export interface BaselinesResponse {
  baselines: BaselineRun[];
  count: number;
  limit: number;
  offset: number;
}

export interface BaselineDetailResponse {
  baseline: BaselineRun;
  distributions: BaselineDistribution[];
  distribution_count: number;
}

export interface DistributionsResponse {
  distributions: BaselineDistribution[];
  count: number;
}
