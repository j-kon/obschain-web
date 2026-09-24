export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConfidenceLevel =
  | 'VERIFIED_ON_CHAIN'
  | 'HIGH'
  | 'MODERATE'
  | 'HEURISTIC'
  | 'LOW';

export type EventType =
  | 'LARGE_TRANSFER'
  | 'DORMANT_UTXO_SPENT'
  | 'CONSOLIDATION'
  | 'FAN_OUT'
  | 'FEE_SPIKE'
  | 'RBF_REPLACEMENT'
  | 'LONG_BLOCK_INTERVAL'
  | 'REORG_DETECTED'
  | 'MINING_ANOMALY'
  | 'UNUSUAL_FEE_RATIO';

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
  metadata: Record<string, unknown>;
}

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

export interface SystemStatus {
  status: string;
  version: string;
  network: string;
  engine: string;
  timestamp: string;
  uptime_seconds: number;
  active_detectors: string[];
  storage_backend: string;
  is_mock_feed: boolean;
  mock_data_disclaimer: string;
}

export interface EventsResponse {
  events: ChainEvent[];
  count: number;
  limit: number;
  offset: number;
  is_mock_feed: boolean;
}

export interface IncidentsResponse {
  incidents: Incident[];
  count: number;
  limit: number;
  offset: number;
  is_mock_feed: boolean;
}
