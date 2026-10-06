import contractFixture from '../__tests__/fixtures/rarity_contract.json';
import {
  ChainEvent,
  EventRarityResponse,
  EventObservationsResponse,
  MetricRarity,
  ImpactBreakdown,
  BaselineIdentity,
} from '../types';
import { ApiError } from './client';

const mockBaseline: BaselineIdentity = {
  id: 'baseline-testnet-01',
  baseline_id: 'baseline-testnet-01',
  algorithm_version: 'v1.4.0',
  metric_definition_version: 'v2.1',
  network: 'bitcoin-mainnet',
  start_height: 800000,
  end_height: 850000,
  sample_count: 18421,
  population_size: 18421,
  quality: 'HIGH',
  evaluation_mode: 'CANONICAL_EVENTS',
};

const contracts = contractFixture.contracts;

export const FIXTURE_IDS = {
  EXACT: 'fixture-exact',
  ESTIMATED: 'fixture-estimated',
  INSUFFICIENT: 'fixture-insufficient',
  REORG: 'fixture-reorg',
  WITNESS: 'fixture-witness',
  FAIL_503: 'fixture-503',
  FAIL_404: 'fixture-404',
} as const;

export function isFixtureId(id: string): boolean {
  return id.startsWith('fixture-') || id.startsWith('contract-');
}

export function getFixtureEvent(id: string): ChainEvent {
  if (id === FIXTURE_IDS.FAIL_404) {
    throw new ApiError(404, 'Event observation not found');
  }

  const baseEvent: ChainEvent = {
    id,
    event_type: 'LARGE_TRANSFER',
    title: 'Large 100 BTC Transfer in Block 860,000',
    description: 'High-value liquidity transfer observed across canonical Bitcoin chain history.',
    severity: 'CRITICAL',
    confidence: 'VERIFIED_ON_CHAIN',
    detected_at: '2026-10-05T12:00:00Z',
    txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    block_height: 860000,
    block_hash: '0000000000000000000192837465abcdef8901234567890abcdef1234567890',
    metadata: {
      total_output_sats: 10000000000,
      fee_rate_sat_vb: 24.5,
      inputs_count: 5,
      outputs_count: 2,
      vsize: 350,
    },
    source: {
      provider: 'Bitcoin Core',
      transport: 'ZMQ (rawtx)',
      endpoint: '127.0.0.1:28332',
    },
  };

  if (id === FIXTURE_IDS.REORG) {
    return {
      ...baseEvent,
      title: 'Reorganized Transaction Observation',
      description: 'Transaction temporarily detached during canonical consensus 1-block reorg.',
      event_type: 'TRANSACTION_REPLACEMENT',
    };
  }

  if (id === FIXTURE_IDS.INSUFFICIENT) {
    return {
      ...baseEvent,
      title: 'Dormant Coin Movement (Preliminary Baseline)',
      description: 'Dormant UTXO movement observed with early-stage baseline collection.',
      event_type: 'DORMANT_COINS_MOVED',
    };
  }

  return baseEvent;
}

export function getFixtureRarity(id: string): EventRarityResponse {
  if (id === FIXTURE_IDS.FAIL_503) {
    throw new ApiError(503, 'Historical rarity temporarily unavailable. ObsChain could not access the statistical population required for this calculation.');
  }
  if (id === FIXTURE_IDS.FAIL_404) {
    throw new ApiError(404, 'No historical rarity record found for this event in current baseline.');
  }

  if (id === FIXTURE_IDS.ESTIMATED) {
    const estMetric: MetricRarity = {
      ...(contracts.estimated_rarity as MetricRarity),
      percentile: 99.47,
    };
    return {
      event_id: id,
      event_type: 'LARGE_TRANSFER',
      baseline: mockBaseline,
      primary: estMetric,
      secondary: [],
      metrics: [estMetric],
      impact: contracts.partial_coverage_impact as ImpactBreakdown,
    };
  }

  if (id === FIXTURE_IDS.INSUFFICIENT) {
    const insufficientBaseline: BaselineIdentity = {
      ...mockBaseline,
      sample_count: 37,
      population_size: 37,
      quality: 'INSUFFICIENT',
    };
    return {
      event_id: id,
      event_type: 'LARGE_TRANSFER',
      baseline: insufficientBaseline,
      primary: contracts.insufficient_data as MetricRarity,
      secondary: [],
      metrics: [contracts.insufficient_data as MetricRarity],
      impact: contracts.unavailable_impact as ImpactBreakdown,
    };
  }

  // Default: exact_rarity & full_impact
  return {
    event_id: id,
    event_type: 'LARGE_TRANSFER',
    baseline: mockBaseline,
    primary: contracts.exact_rarity as MetricRarity,
    secondary: [],
    metrics: [contracts.exact_rarity as MetricRarity],
    impact: contracts.full_impact as ImpactBreakdown,
  };
}

export function getFixtureObservations(id: string): EventObservationsResponse {
  if (id === FIXTURE_IDS.REORG) {
    // Chronology: CONFIRMED -> REORGED_OUT -> MEMPOOL_SEEN
    return {
      event_id: id,
      count: 3,
      observations: [
        {
          id: 'obs-reorg-1',
          event_id: id,
          observed_at: '2026-10-05T11:45:00Z',
          kind: 'CONFIRMED',
          source: { provider: 'Bitcoin Core', transport: 'ZMQ (rawblock)' },
          mode: 'LIVE',
          block_height: 859998,
          block_hash: '0000000000000000000192837465abcdef8901234567890abcdef1234567890',
        },
        {
          id: 'obs-reorg-2',
          event_id: id,
          observed_at: '2026-10-05T11:55:00Z',
          kind: 'REORGED_OUT',
          source: { provider: 'Bitcoin Core', transport: 'ZMQ (rawblock)' },
          mode: 'LIVE',
          block_height: 859998,
        },
        {
          id: 'obs-reorg-3',
          event_id: id,
          observed_at: '2026-10-05T11:55:05Z',
          kind: 'MEMPOOL_SEEN',
          source: { provider: 'Bitcoin Core', transport: 'mempool' },
          mode: 'LIVE',
        },
      ],
    };
  }

  if (id === FIXTURE_IDS.WITNESS) {
    // Multi-witness: Bitcoin Core / ZMQ, mempool.space / WebSocket, Historical Replay
    return {
      event_id: id,
      count: 4,
      observations: [
        {
          id: 'obs-witness-1',
          event_id: id,
          observed_at: '2026-10-05T11:58:12Z',
          kind: 'MEMPOOL_SEEN',
          source: { provider: 'Bitcoin Core', transport: 'ZMQ (sequence)', endpoint: '127.0.0.1:28332' },
          mode: 'LIVE',
        },
        {
          id: 'obs-witness-2',
          event_id: id,
          observed_at: '2026-10-05T11:58:13Z',
          kind: 'WITNESSED',
          source: { provider: 'mempool.space', transport: 'WebSocket', endpoint: 'wss://mempool.space/api/v1/ws' },
          mode: 'LIVE',
        },
        {
          id: 'obs-witness-3',
          event_id: id,
          observed_at: '2026-10-05T12:00:00Z',
          kind: 'CONFIRMED',
          source: { provider: 'Bitcoin Core', transport: 'ZMQ (rawblock)', endpoint: '127.0.0.1:28332' },
          mode: 'LIVE',
          block_height: 860000,
        },
        {
          id: 'obs-witness-4',
          event_id: id,
          observed_at: '2026-10-05T12:05:00Z',
          kind: 'HISTORICAL_REPLAY',
          source: { provider: 'Historical Replay', transport: 'Block Indexer Replay' },
          mode: 'HISTORICAL_REPLAY',
          block_height: 860000,
        },
      ],
    };
  }

  // Default: MEMPOOL_SEEN -> CONFIRMED
  return {
    event_id: id,
    count: 2,
    observations: [
      {
        id: 'obs-def-1',
        event_id: id,
        observed_at: '2026-10-05T11:58:30Z',
        kind: 'MEMPOOL_SEEN',
        source: { provider: 'mempool.space', transport: 'WebSocket' },
        mode: 'LIVE',
      },
      {
        id: 'obs-def-2',
        event_id: id,
        observed_at: '2026-10-05T12:00:00Z',
        kind: 'CONFIRMED',
        source: { provider: 'Bitcoin Core', transport: 'ZMQ (rawblock)' },
        mode: 'LIVE',
        block_height: 860000,
      },
    ],
  };
}
