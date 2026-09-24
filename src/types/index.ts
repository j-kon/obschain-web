export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConfidenceLevel =
  | 'VERIFIED_ON_CHAIN'
  | 'HIGH'
  | 'MODERATE'
  | 'HEURISTIC'
  | 'LOW';

export type EventType =
  | 'LARGE_TRANSFER'
  | 'DORMANT_COINS_MOVED'
  | 'DORMANT_UTXO_SPENT' // legacy alias
  | 'CONSOLIDATION'
  | 'FAN_OUT'
  | 'EXTREME_FEE'
  | 'FEE_SPIKE' // legacy alias
  | 'TRANSACTION_REPLACEMENT'
  | 'RBF_REPLACEMENT' // legacy alias
  | 'LONG_BLOCK_INTERVAL'
  | 'REORG_DETECTED'
  | 'MINING_ANOMALY'
  | 'UNUSUAL_FEE_RATIO';

export type DormantClassification =
  | 'DORMANT'
  | 'VERY_OLD'
  | 'ANCIENT'
  | 'EARLY_BITCOIN';

export type ExtremeFeeTriggerType =
  | 'HIGH_ABSOLUTE_FEE'
  | 'HIGH_FEE_RATE'
  | 'BOTH';

export interface ObservationSource {
  provider: string;
  transport: string;
  endpoint?: string | null;
  source_type?: string;
  ingested_at?: string;
}

// -------------------------------------------------------------
// Typed Metadata Interfaces Matching Backend Serialization
// -------------------------------------------------------------

export interface DormantCoinsMetadata {
  total_dormant_sats: number;
  total_dormant_btc: number;
  dormant_input_count: number;
  total_input_count: number;
  oldest_input_age_days: number;
  oldest_input_age_seconds: number;
  youngest_qualifying_age_days: number;
  total_input_sats: number;
  total_output_sats: number;
  dormant_ratio: number;
  coin_age_destroyed_sats_days: number | string; // u128 from backend
  coin_age_destroyed_btc_days: number;
  coin_age_destroyed_btc_years: number;
  classification: DormantClassification;
}

export interface ConsolidationMetadata {
  input_count: number;
  output_count: number;
  input_output_ratio: number;
  total_input_sats: number;
  total_output_sats: number;
  fee_sats: number;
}

export interface FanOutMetadata {
  input_count: number;
  output_count: number;
  output_input_ratio: number;
  total_distributed_sats: number;
  total_distributed_btc: number;
  median_output_sats: number;
  smallest_output_sats: number;
  largest_output_sats: number;
}

export interface ExtremeFeeMetadata {
  fee_sats: number;
  fee_btc: number;
  fee_rate_sat_vb?: number | null;
  vsize: number;
  total_input_sats: number;
  total_output_sats: number;
  fee_trigger_type: ExtremeFeeTriggerType;
}

export interface ReplacementMetadata {
  replaced_txids: string[];
  replacement_txid: string;
  replaced_count: number;
  old_fee_sats: number;
  new_fee_sats: number;
  fee_delta_sats: number;
  fee_increase_percent?: number | null;
  old_fee_rate_sat_vb?: number | null;
  new_fee_rate_sat_vb?: number | null;
}

export interface LargeTransferMetadata {
  total_output_sats?: number;
  total_output_btc?: number;
  fee_sats?: number;
  fee_rate_sat_vb?: number | null;
  vsize?: number;
  inputs_count?: number;
  outputs_count?: number;
}

export interface LongBlockIntervalMetadata {
  interval_seconds?: number;
  interval_minutes?: number;
  previous_block_hash?: string;
  block_time?: string;
}

// -------------------------------------------------------------
// Core ChainEvent Definition
// -------------------------------------------------------------

export interface ChainEvent {
  id: string;
  event_type: EventType;
  severity: EventSeverity;
  confidence: ConfidenceLevel;
  title: string;
  description: string;
  detected_at: string;
  block_height?: number | null;
  block_hash?: string | null;
  txid?: string | null;
  source?: ObservationSource | null;
  metadata: Record<string, unknown>;
}

// -------------------------------------------------------------
// System Status & Ingestion Provenance Models
// -------------------------------------------------------------

export interface SourcesStatus {
  mempool_rest: string;
  mempool_websocket: string;
  bitcoin_core: string;
}

export interface PipelineMetrics {
  transactions_observed: number;
  blocks_observed: number;
  transactions_enriched: number;
  utxo_lookup_failures: number;
  cache_hits: number;
  cache_misses: number;
  events_generated: number;
  events_deduplicated: number;
}

export interface SystemStatus {
  service: string;
  network: string;
  status: string;
  version: string;
  engine: string;
  timestamp: string;
  uptime_seconds: number;
  sources: SourcesStatus;
  tip_height: number;
  events_detected: number;
  active_detectors: string[];
  storage_backend: string;
  is_mock_feed: boolean;
  metrics: PipelineMetrics;
}

export interface EventsResponse {
  events: ChainEvent[];
  count: number;
  limit: number;
  offset: number;
  is_mock_feed: boolean;
}

// -------------------------------------------------------------
// Incident Models (Preserved for Future Incident Features)
// -------------------------------------------------------------

export type ProvenanceClassification =
  | 'ON_CHAIN_VERIFIED'
  | 'OFFICIALLY_ATTRIBUTED'
  | 'HIGH_CONFIDENCE_REPORTING'
  | 'HEURISTIC'
  | 'UNVERIFIED'
  | 'DISPUTED';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'MITIGATED'
  | 'CLOSED'
  | 'DISPUTED';

export type EvidenceType =
  | 'ON_CHAIN_TRANSACTION'
  | 'ON_CHAIN_BLOCK'
  | 'MEMPOOL_SNAPSHOT'
  | 'OFFICIAL_STATEMENT'
  | 'SECURITY_ADVISORY'
  | 'HEURISTIC_CLUSTER'
  | 'DISPUTED_CLAIM';

export interface Evidence {
  id: string;
  incident_id: string;
  evidence_type: EvidenceType;
  classification: ProvenanceClassification;
  description: string;
  reference: string;
  raw_data?: Record<string, unknown> | null;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  evidence_id?: string | null;
  classification: ProvenanceClassification;
}

export interface Source {
  id: string;
  name: string;
  url?: string | null;
  reliability_score: number;
  published_at?: string | null;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  status: IncidentStatus;
  severity: EventSeverity;
  total_btc_affected: number;
  total_btc_recovered: number;
  first_observed_at: string;
  last_updated_at: string;
  facts: string[];
  reported_claims: string[];
  unverified_claims: string[];
  associated_txids: string[];
  associated_block_heights: number[];
  timeline: TimelineEvent[];
  evidence: Evidence[];
  sources: Source[];
}

export interface IncidentsResponse {
  incidents: Incident[];
  count: number;
  limit: number;
  offset: number;
  is_mock_feed: boolean;
}

// WebSocket Connection State
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';
