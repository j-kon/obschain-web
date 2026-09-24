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
// Incident Intelligence & Provenance Models
// -------------------------------------------------------------

export type Chain = 'BITCOIN' | 'LIQUID';

export type ProvenanceClassification =
  | 'ON_CHAIN_VERIFIED'
  | 'OFFICIALLY_ATTRIBUTED'
  | 'REPUTABLE_REPORTING'
  | 'HIGH_CONFIDENCE_REPORTING' // backward compat
  | 'HEURISTIC'
  | 'UNVERIFIED'
  | 'DISPUTED';

export type IncidentStatus =
  | 'DETECTED'
  | 'INVESTIGATING'
  | 'VERIFIED'
  | 'MONITORING'
  | 'RECOVERY'
  | 'RESOLVED'
  | 'CLOSED'
  | 'OPEN' // legacy
  | 'MITIGATED' // legacy
  | 'DISPUTED';

export type EvidenceType =
  | 'ON_CHAIN_TRANSACTION'
  | 'ON_CHAIN_BLOCK'
  | 'MEMPOOL_SNAPSHOT'
  | 'OFFICIAL_STATEMENT'
  | 'OFFICIAL_TECHNICAL_REPORT'
  | 'SECURITY_ADVISORY'
  | 'SOURCE_REPOSITORY'
  | 'HEURISTIC_CLUSTER'
  | 'DISPUTED_CLAIM'
  | 'INDEPENDENT_REPORTING';

export type SourceCategory =
  | 'BITCOIN_BLOCKCHAIN'
  | 'LIQUID_BLOCKCHAIN'
  | 'OFFICIAL_TECHNICAL_REPORT'
  | 'OFFICIAL_PUBLIC_STATEMENT'
  | 'SOURCE_REPOSITORY'
  | 'SECURITY_ADVISORY'
  | 'INDEPENDENT_REPORTING';

export type TransactionRole =
  | 'EXPLOIT'
  | 'PEG_OUT'
  | 'TRANSFER'
  | 'FORWARDING'
  | 'RETURN'
  | 'RECOVERY'
  | 'COMMUNICATION'
  | 'OTHER';

export type TimelineCategory =
  | 'EXPLOIT'
  | 'ON_CHAIN_MOVEMENT'
  | 'DISCOVERY'
  | 'CONTAINMENT'
  | 'COMMUNICATION'
  | 'DISCLOSURE'
  | 'PATCH'
  | 'RECOVERY'
  | 'NETWORK_RESTART'
  | 'OTHER';

export interface RecoverySummary {
  affected_sats: number;
  recovered_sats: number;
  outstanding_sats: number;
  as_of_timestamp: string;
  source?: string | null;
  is_estimate: boolean;
}

export interface StructuredClaimsSummary {
  verified_on_chain: string[];
  officially_attributed: string[];
  reported: string[];
  heuristic: string[];
  unknown: string[];
}

export interface Source {
  id: string;
  publisher: string;
  title: string;
  url?: string | null;
  publication_timestamp?: string | null;
  retrieved_timestamp?: string | null;
  source_category: SourceCategory;
  reliability_score: number;
  name?: string | null;
  published_at?: string | null; // legacy
}

export interface Evidence {
  id: string;
  incident_id: string;
  evidence_type: EvidenceType;
  confidence: ProvenanceClassification;
  title?: string;
  description: string;
  observed_at?: string | null;
  source_id?: string | null;
  source_reference?: string | null;
  txid?: string | null;
  block_hash?: string | null;
  block_height?: number | null;
  chain?: Chain;
  verified: boolean;
  raw_data?: Record<string, unknown> | null;
  created_at: string;
  reference?: string | null;
  classification?: ProvenanceClassification | null;
}

export interface IncidentTransaction {
  chain: Chain;
  txid: string;
  role: TransactionRole;
  amount_sats?: number | null;
  block_height?: number | null;
  block_hash?: string | null;
  confirmed_at?: string | null;
  evidence_id?: string | null;
  notes?: string | null;
}

export interface IncidentBlock {
  chain: Chain;
  height: number;
  hash: string;
  timestamp: string;
  tx_count?: number | null;
  evidence_id?: string | null;
}

export interface IncidentEntity {
  id: string;
  name: string;
  entity_type: string;
  description: string;
  attribution_confidence: ProvenanceClassification;
}

export interface OnChainMessage {
  txid: string;
  chain: Chain;
  encoding: string;
  decoded_text: string;
  raw_hex: string;
  confirmed_at?: string | null;
  block_height?: number | null;
  attributed_sender?: string | null;
  sender_attribution_confidence: ProvenanceClassification;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: TimelineCategory;
  source_id?: string | null;
  evidence_ids: string[];
  transaction_txids: string[];
  block_heights: number[];
  classification: ProvenanceClassification;
  // Legacy compatibility:
  evidence_id?: string | null;
}

// Backward-compatibility alias
export type TimelineEvent = TimelineEntry;

export interface TechnicalFinding {
  component: string;
  area: string;
  category: string;
  summary: string;
  root_cause_details: string;
  fix_summary: string;
  repository_url?: string | null;
  pull_request_id?: string | null;
  commit_hash?: string | null;
}

export interface IncidentUpdate {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  source_id?: string | null;
  recovery_state?: RecoverySummary | null;
}

export type GraphNodeType =
  | 'TRANSACTION'
  | 'BLOCK'
  | 'ADDRESS'
  | 'ENTITY'
  | 'SOURCE'
  | 'EVIDENCE';

export type GraphEdgeType =
  | 'SPENDS'
  | 'CONFIRMED_IN'
  | 'FORWARDS_TO'
  | 'RETURNS_TO'
  | 'REFERENCES'
  | 'SUPPORTS'
  | 'ATTRIBUTED_TO'
  | 'POSSIBLY_RELATED';

export interface GraphNode {
  id: string;
  label: string;
  node_type: GraphNodeType;
  chain?: Chain | null;
  metadata?: Record<string, unknown> | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: GraphEdgeType;
  confidence: ProvenanceClassification;
}

export interface IncidentGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Incident {
  id: string;
  case_id: string;
  title: string;
  summary: string;
  status: IncidentStatus;
  severity: EventSeverity;
  recovery: RecoverySummary;
  total_btc_affected: number;
  total_btc_recovered: number;
  first_observed_at: string;
  last_updated_at: string;
  structured_claims: StructuredClaimsSummary;
  entities: IncidentEntity[];
  transactions: IncidentTransaction[];
  blocks: IncidentBlock[];
  on_chain_messages: OnChainMessage[];
  timeline: TimelineEntry[];
  evidence: Evidence[];
  sources: Source[];
  technical_findings: TechnicalFinding[];
  updates: IncidentUpdate[];
  graph: IncidentGraph;
  // Legacy / fallback fields:
  facts?: string[];
  reported_claims?: string[];
  unverified_claims?: string[];
  associated_txids?: string[];
  associated_block_heights?: number[];
}

export interface IncidentsResponse {
  incidents: Incident[];
  count: number;
  limit: number;
  offset: number;
  is_mock_feed: boolean;
}

export interface IncidentTimelineResponse {
  incident_id: string;
  case_id: string;
  timeline: TimelineEntry[];
  count: number;
}

export interface IncidentEvidenceResponse {
  incident_id: string;
  case_id: string;
  evidence: Evidence[];
  count: number;
}

// WebSocket Connection State
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';
