import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import contractFixture from './fixtures/rarity_contract.json';
import {
  MetricRarity,
  ImpactBreakdown,
  BaselineIdentity,
  EventObservation,
} from '../types';
import {
  PercentileDisplay,
  RaritySummaryCard,
  HistoricalDistribution,
  CalculationDetails,
  ImpactBreakdownPanel,
} from '../components/rarity';
import {
  ObservationLifecycle,
  WitnessPanel,
} from '../components/observations';
import { EventFeed } from '../components/EventFeed';
import {
  getFixtureObservations,
} from '../api/fixtures';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!-- -->/g, '');
}

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

describe('ObsChain Phase 7A: Comprehensive Runtime & Visual Acceptance', () => {
  const contracts = contractFixture.contracts;
  const exactRarity = contracts.exact_rarity as MetricRarity;
  const estimatedRarity = contracts.estimated_rarity as MetricRarity;
  const insufficientRarity = contracts.insufficient_data as MetricRarity;
  const fullImpact = contracts.full_impact as ImpactBreakdown;
  const partialImpact = contracts.partial_coverage_impact as ImpactBreakdown;
  const unavailableImpact = contracts.unavailable_impact as ImpactBreakdown;

  // -------------------------------------------------------------------------
  // Item 4: Exact-rarity UI
  // -------------------------------------------------------------------------
  describe('Item 4: Exact-Rarity Verification', () => {
    it('visibly presents EXTREME band, 99.94th percentile, EXACT pill, tail count, and population', () => {
      const html = renderClean(
        <RaritySummaryCard
          primary={exactRarity}
          baselineQuality={mockBaseline.quality}
        />
      );

      // 1. Rarity band: EXTREME
      expect(html).toContain('EXTREME');

      // 2. Percentile: 99.94th percentile (strictly without tilde)
      expect(html).toContain('99.94th percentile');
      expect(html).not.toContain('≈ 99.94');

      // 3. EXACT pill
      expect(html).toContain('EXACT');

      // 4. Extremity count and population
      expect(html).toContain('11');
      expect(html).toContain('events at or above this value');
      expect(html).toContain('18,421');
      expect(html).toContain('comparable events');

      // 5. Methodology explanation
      expect(html).toContain('Exact empirical comparison');
      expect(html).toContain('Exact Empirical CDF (eCDF)');
    });

    it('CalculationDetails presents exact mathematical formula, block range, and versions', () => {
      const html = renderClean(
        <CalculationDetails
          isOpen={true}
          onClose={() => {}}
          primary={exactRarity}
          baseline={mockBaseline}
        />
      );

      expect(html).toContain('How Was This Rarity Calculated?');
      expect(html).toContain('Exact Empirical CDF Calculation');
      expect(html).toContain('Percentile = (Rank / Total Population) × 100 = (18,410 / 18,421) × 100 =');
      expect(html).toContain('99.94%');
      expect(html).toContain('800,000 → 850,000');
      expect(html).toContain('v1.4.0');
      expect(html).toContain('v2.1');
      expect(html).toContain('HIGH');
    });
  });

  // -------------------------------------------------------------------------
  // Item 5: Estimated-rarity UI
  // -------------------------------------------------------------------------
  describe('Item 5: Estimated-Rarity Verification', () => {
    it('visibly presents ≈ 99.47th percentile, ESTIMATE pill, and historical distribution note', () => {
      const estWith9947: MetricRarity = {
        ...estimatedRarity,
        percentile: 99.47,
      };

      const html = renderClean(
        <RaritySummaryCard
          primary={estWith9947}
          baselineQuality={mockBaseline.quality}
        />
      );

      // 1. Tilde prefix and suffix
      expect(html).toContain('≈ 99.47th percentile');

      // 2. ESTIMATE pill
      expect(html).toContain('ESTIMATE');

      // 3. Clear human label
      expect(html).toContain('Estimated from historical distribution');
      expect(html).toContain('Piece-wise Quantile Interpolation');
    });
  });

  // -------------------------------------------------------------------------
  // Item 6: Insufficient-data state
  // -------------------------------------------------------------------------
  describe('Item 6: Insufficient-Data Verification', () => {
    it('explains 37 comparable events and requires at least 100 samples; no 0% or COMMON', () => {
      const html = renderClean(
        <RaritySummaryCard
          primary={insufficientRarity}
          baselineQuality="INSUFFICIENT"
        />
      );

      expect(html).toContain('Insufficient Historical Data');
      expect(html).toContain('37');
      expect(html).toContain('comparable events are indexed');
      expect(html).toContain('ObsChain requires at least');
      expect(html).toContain('100 samples');

      // STRICT NEGATIVE CHECKS: No 0%, 0th percentile, COMMON, or Impact 0
      expect(html).not.toContain('0%');
      expect(html).not.toContain('0th percentile');
      expect(html).not.toContain('COMMON');
      expect(html).not.toContain('Impact 0');
    });

    it('PercentileDisplay renders Unavailable badge with no 0%', () => {
      const html = renderClean(
        <PercentileDisplay
          percentile={insufficientRarity.percentile}
          method={insufficientRarity.percentile_method}
        />
      );

      expect(html).toContain('Unavailable');
      expect(html).toContain('Insufficient baseline samples');
      expect(html).not.toContain('0%');
      expect(html).not.toContain('0th');
    });
  });

  // -------------------------------------------------------------------------
  // Items 7 & 8: Impact Breakdown & Unavailable States
  // -------------------------------------------------------------------------
  describe('Items 7 & 8: Impact Breakdown Verification', () => {
    it('renders Experimental Impact Index with score, model ID, coverage, components, and non-trading disclaimer', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={fullImpact} />);

      expect(html).toContain('Experimental Impact Index');
      expect(html).toContain('85.0');
      expect(html).toContain('/ 100');
      expect(html).toContain('obschain-impact-large-transfer-v1');
      expect(html).toContain('Coverage: 100%');

      // Sub-components
      expect(html).toContain('Value rarity');
      expect(html).toContain('59.9');
      expect(html).toContain('Input count structure');
      expect(html).toContain('9.0');
      expect(html).toContain('Output count structure');
      expect(html).toContain('7.5');
      expect(html).toContain('Transaction size anomaly');
      expect(html).toContain('8.4');

      // Mandatory non-comparability / non-trading disclaimer
      expect(html).toContain('Non-Comparability Notice:');
      expect(html).toContain('This is an');
      expect(html).toContain('experimental anomaly index.');
      expect(html).toContain('criminality, ownership, risk, or trading score');
    });

    it('renders Partial Coverage state with explicit coverage notice', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={partialImpact} />);

      expect(html).toContain('42.5');
      expect(html).toContain('Coverage: 50%');
      expect(html).toContain('Partial Model Coverage (50%):');
      expect(html).toContain('Some expected components were unavailable in the observed transaction payload');
    });

    it('renders Unavailable state with UNAVAILABLE badge, INSUFFICIENT_BASELINE reason, and NO 0 / 100 score', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={unavailableImpact} />);

      expect(html).toContain('UNAVAILABLE');
      expect(html).toContain('Impact Score Unavailable (INSUFFICIENT_BASELINE)');
      expect(html).toContain('Insufficient historical baseline sample count. At least 100 qualifying events are required');

      // NEVER render unavailable score as 0 / 100
      expect(html).not.toContain('0.0 / 100');
      expect(html).not.toContain('0 / 100');
    });
  });

  // -------------------------------------------------------------------------
  // Item 9: Observation Lifecycle
  // -------------------------------------------------------------------------
  describe('Item 9: Observation Lifecycle Verification', () => {
    it('renders MEMPOOL_SEEN -> CONFIRMED sequence', () => {
      const obs = getFixtureObservations('fixture-exact').observations;
      const html = renderClean(<ObservationLifecycle observations={obs} />);

      expect(html).toContain('MEMPOOL SEEN');
      expect(html).toContain('CONFIRMED');
      expect(html).toContain('Observed unconfirmed in memory pool');
      expect(html).toContain('Verified on-chain inside an accepted Bitcoin block');
    });

    it('renders CONFIRMED -> REORGED_OUT -> MEMPOOL_SEEN without hack/attack implications', () => {
      const obs = getFixtureObservations('fixture-reorg').observations;
      const html = renderClean(<ObservationLifecycle observations={obs} />);

      expect(html).toContain('REORGED OUT');
      expect(html).toContain('Chain reorganization: block disconnected during normal consensus resolution. Not an exploit or attack.');

      // STRICT NEGATIVE CHECKS: A normal reorg must not imply malicious attack or exploit
      expect(html).not.toContain('malicious attack');
      expect(html).not.toContain('hacker');
      expect(html).not.toContain('exploit detected');
    });

    it('renders HISTORICAL_REPLAY with clear historical reconstruction badge', () => {
      const obs: EventObservation[] = [
        {
          id: 'obs-replay-1',
          event_id: 'ev-replay',
          kind: 'HISTORICAL_REPLAY',
          mode: 'HISTORICAL_REPLAY',
          source: { provider: 'Historical Replay', transport: 'Block Indexer Replay' },
          observed_at: '2026-09-27T08:00:00Z',
          block_height: 800050,
        },
      ];
      const html = renderClean(<ObservationLifecycle observations={obs} />);

      expect(html).toContain('HISTORICAL REPLAY');
      expect(html).toContain('Reconstructed from historical Bitcoin data during replay batch execution');
    });
  });

  // -------------------------------------------------------------------------
  // Item 10: Multi-Witness Provenance
  // -------------------------------------------------------------------------
  describe('Item 10: Multi-Witness Provenance Verification', () => {
    it('distinguishes primary witness, corroborating witness, and historical reconstruction', () => {
      const obs = getFixtureObservations('fixture-witness').observations;
      const html = renderClean(
        <WitnessPanel
          primarySource={{ provider: 'Bitcoin Core', transport: 'ZMQ (sequence)' }}
          observations={obs}
        />
      );

      expect(html).toContain('PRIMARY WITNESS');
      expect(html).toContain('Bitcoin Core');
      expect(html).toContain('CORROBORATING');
      expect(html).toContain('mempool.space');
      expect(html).toContain('Historical reconstruction');
      expect(html).toContain('Historical Replay');
    });
  });

  // -------------------------------------------------------------------------
  // Item 12: Historical Distribution
  // -------------------------------------------------------------------------
  describe('Item 12: Historical Distribution Visualization', () => {
    it('displays p50, p75, p90, p95, p99, p99.9 quantiles and THIS EVENT marker with non-linear notice', () => {
      const html = renderClean(
        <HistoricalDistribution
          metricName="value_sats"
          eventPercentile={99.94}
          eventValueDisplay="100.00000000 BTC"
        />
      );

      // Quantile tick labels
      expect(html).toContain('p50');
      expect(html).toContain('p75');
      expect(html).toContain('p90');
      expect(html).toContain('p95');
      expect(html).toContain('p99');
      expect(html).toContain('p99.9');

      // Current event marker
      expect(html).toContain('THIS EVENT: 99.94%');

      // Clear labeling of non-linear tail expansion
      expect(html).toContain('Non-linear tail expansion');
      expect(html).toContain('Tail-expanded percentile scale');
    });
  });

  // -------------------------------------------------------------------------
  // Item 15: Empty/Live-Data State on Events Feed
  // -------------------------------------------------------------------------
  describe('Item 15: Events Feed Empty State', () => {
    it('explains naturally that ObsChain is observing without presenting 0 events as error', () => {
      const html = renderClean(
        <MemoryRouter initialEntries={['/events']}>
          <EventFeed events={[]} />
        </MemoryRouter>
      );

      expect(html).toContain('No qualifying events found');
      expect(html).toContain('No qualifying Bitcoin events observed yet. Waiting for incoming chain activity...');

      // Fixture links are available
      expect(html).toContain('Frozen Contract Acceptance Fixtures (Phase 7A)');
      expect(html).toContain('Exact Empirical Rarity');
      expect(html).toContain('Estimated Rarity');
      expect(html).toContain('Insufficient Baseline Data');
      expect(html).toContain('Reorg Lifecycle');
      expect(html).toContain('Multi-Witness Provenance');
    });
  });

  // -------------------------------------------------------------------------
  // Item 19: Events Filters
  // -------------------------------------------------------------------------
  describe('Item 19: Events Filters', () => {
    it('supports ALL, EXTREME, RARE, UNUSUAL, NOTABLE, COMMON, and INSUFFICIENT_DATA', () => {
      const html = renderClean(
        <MemoryRouter initialEntries={['/events']}>
          <EventFeed events={[]} />
        </MemoryRouter>
      );

      expect(html).toContain('All Rarity Bands');
      expect(html).toContain('value="EXTREME"');
      expect(html).toContain('value="RARE"');
      expect(html).toContain('value="UNUSUAL"');
      expect(html).toContain('value="NOTABLE"');
      expect(html).toContain('value="COMMON"');
      expect(html).toContain('value="INSUFFICIENT_DATA"');
    });
  });

  // -------------------------------------------------------------------------
  // Item 23: Product Language Review
  // -------------------------------------------------------------------------
  describe('Item 23: Product Language Tone', () => {
    it('contains no speculative or hype language across rendered components', () => {
      const exactHtml = renderClean(
        <RaritySummaryCard
          primary={exactRarity}
          baselineQuality="HIGH"
        />
      );
      const impactHtml = renderClean(<ImpactBreakdownPanel impact={fullImpact} />);
      const lifecycleHtml = renderClean(
        <ObservationLifecycle observations={getFixtureObservations('fixture-reorg').observations} />
      );

      const combined = `${exactHtml} ${impactHtml} ${lifecycleHtml}`.toLowerCase();

      // Prohibited terms
      expect(combined).not.toContain('bullish');
      expect(combined).not.toContain('bearish');
      expect(combined).not.toContain('alpha');
      expect(combined).not.toContain('whale alert');
      expect(combined).not.toContain('dangerous');
      expect(combined).not.toContain('criminal investigation');
      expect(combined).not.toContain('criminal activity');
    });
  });
});
