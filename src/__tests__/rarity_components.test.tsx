import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import contractFixture from './fixtures/rarity_contract.json';
import {
  MetricRarity,
  ImpactBreakdown,
  BaselineIdentity,
  EventObservation,
  RarityBand,
  BaselineQuality,
} from '../types/rarity';
import { ChainEvent } from '../types';
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
import { WhyThisTriggered } from '../components/events/WhyThisTriggered';

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

describe('Rarity & Intelligence UI Components', () => {
  const contracts = contractFixture.contracts;
  const exactRarity = contracts.exact_rarity as MetricRarity;
  const estimatedRarity = contracts.estimated_rarity as MetricRarity;
  const insufficientRarity = contracts.insufficient_data as MetricRarity;
  const fullImpact = contracts.full_impact as ImpactBreakdown;
  const partialImpact = contracts.partial_coverage_impact as ImpactBreakdown;
  const unavailableImpact = contracts.unavailable_impact as ImpactBreakdown;

  describe('RarityBadge', () => {
    const allBands: RarityBand[] = [
      'COMMON',
      'NOTABLE',
      'UNUSUAL',
      'RARE',
      'EXTREME',
      'INSUFFICIENT_DATA',
    ];

    it.each(allBands)('renders accessible badge for band %s', (band) => {
      const html = renderClean(<RarityBadge band={band} showLabel={true} />);
      expect(html).toContain(band.replace(/_/g, ' '));
      expect(html).toContain('aria-label');
      expect(html).toContain('data-testid="rarity-badge"');
    });

    it('renders compact icon-only badge when showLabel is false', () => {
      const html = renderClean(<RarityBadge band="EXTREME" showLabel={false} />);
      expect(html).toContain('data-testid="rarity-badge"');
      expect(html).toContain('aria-label="Rarity Band: EXTREME.');
    });
  });

  describe('BaselineQualityBadge', () => {
    const qualities: BaselineQuality[] = ['HIGH', 'MODERATE', 'DEGRADED', 'INSUFFICIENT'];

    it.each(qualities)('renders badge with correct label for %s quality', (quality) => {
      const html = renderClean(<BaselineQualityBadge quality={quality} showLabel={true} />);
      expect(html).toContain(quality);
      expect(html).toContain('data-testid="baseline-quality-badge"');
    });
  });

  describe('PercentileDisplay', () => {
    it('renders exact empirical CDF with EXACT pill and no tilde', () => {
      const html = renderClean(
        <PercentileDisplay
          percentile={exactRarity.percentile}
          method={exactRarity.percentile_method}
          estimated={exactRarity.estimated}
        />
      );
      expect(html).toContain('99.94th percentile');
      expect(html).toContain('EXACT');
      expect(html).not.toContain('≈');
    });

    it('renders quantile estimate with ESTIMATE pill and tilde', () => {
      const html = renderClean(
        <PercentileDisplay
          percentile={estimatedRarity.percentile}
          method={estimatedRarity.percentile_method}
          estimated={estimatedRarity.estimated}
        />
      );
      expect(html).toContain('≈ 99.94th percentile');
      expect(html).toContain('ESTIMATE');
    });

    it('strictly renders Unavailable and never 0% for insufficient data', () => {
      const html = renderClean(
        <PercentileDisplay
          percentile={insufficientRarity.percentile}
          method={insufficientRarity.percentile_method}
        />
      );
      expect(html).toContain('Unavailable');
      expect(html).toContain('Insufficient baseline samples');
      expect(html).not.toContain('0%');
      expect(html).not.toContain('0th percentile');
    });
  });

  describe('RaritySummaryCard', () => {
    it('renders primary metric, percentile, population and frequency', () => {
      const html = renderClean(
        <RaritySummaryCard
          primary={exactRarity}
          baselineQuality={mockBaseline.quality}
          onOpenDetails={() => {}}
        />
      );
      expect(html).toContain('100.00000000 BTC');
      expect(html).toContain('99.94th percentile');
      expect(html).toContain('18,421');
      expect(html).toContain('11 comparable-or-rarer events');
      expect(html).toContain('How was this calculated?');
    });

    it('renders insufficient data state cleanly', () => {
      const html = renderClean(
        <RaritySummaryCard
          primary={insufficientRarity}
          baselineQuality="INSUFFICIENT"
        />
      );
      expect(html).toContain('Insufficient Historical Data');
      expect(html).toContain('37');
      expect(html).not.toContain('0th percentile');
    });
  });

  describe('RarityMetricsPanel', () => {
    it('renders all evaluated dimensions and marks primary', () => {
      const secondaryMetric: MetricRarity = {
        ...exactRarity,
        metric: 'vsize',
        value: '350',
        value_display: '350 vB',
        percentile: 82.5,
        is_primary: false,
      };

      const html = renderClean(
        <RarityMetricsPanel
          primary={exactRarity}
          secondary={[secondaryMetric]}
        />
      );

      expect(html).toContain('Component Rarity Metrics');
      expect(html).toContain('(2 tracked dimensions)');
      expect(html).toContain('PRIMARY');
      expect(html).toContain('VALUE SATS');
      expect(html).toContain('VSIZE');
    });
  });

  describe('HistoricalDistribution', () => {
    it('renders quantile ticks and event marker', () => {
      const html = renderClean(
        <HistoricalDistribution
          metricName="value_sats"
          eventPercentile={99.94}
          eventValueDisplay="100.00000000 BTC"
        />
      );
      expect(html).toContain('p50');
      expect(html).toContain('p75');
      expect(html).toContain('p90');
      expect(html).toContain('p95');
      expect(html).toContain('p99');
      expect(html).toContain('p99.9');
      expect(html).toContain('THIS EVENT');
    });

    it('renders insufficient data banner when percentile is null', () => {
      const html = renderClean(
        <HistoricalDistribution
          metricName="value_sats"
          eventPercentile={null}
        />
      );
      expect(html).toContain('Event marker unavailable (insufficient sample count)');
    });
  });

  describe('BaselineContextCard', () => {
    it('renders complete baseline identification fields', () => {
      const html = renderClean(<BaselineContextCard baseline={mockBaseline} />);
      expect(html).toContain('Historical Baseline Context');
      expect(html).toContain('800,000 → 850,000');
      expect(html).toContain('50,000 blocks');
      expect(html).toContain('v1.4.0');
      expect(html).toContain('18,421');
      expect(html).toContain('Mode: CANONICAL_EVENTS');
    });
  });

  describe('CalculationDetails Modal', () => {
    it('renders eCDF formula, sample size, tail count, and audit provenance when open', () => {
      const html = renderClean(
        <CalculationDetails
          isOpen={true}
          onClose={() => {}}
          primary={exactRarity}
          baseline={mockBaseline}
        />
      );
      expect(html).toContain('How Was This Rarity Calculated?');
      expect(html).toContain('Percentile = (Rank / Total Population) × 100');
      expect(html).toContain('18,421'); // population
      expect(html).toContain('11'); // tail count
      expect(html).toContain('18,410'); // rank count (18421 - 11)
      expect(html).toContain('Audit Provenance');
    });

    it('renders nothing when closed', () => {
      const html = renderClean(
        <CalculationDetails
          isOpen={false}
          onClose={() => {}}
          primary={exactRarity}
          baseline={mockBaseline}
        />
      );
      expect(html).toBe('');
    });
  });

  describe('ImpactBreakdownPanel', () => {
    it('strictly renders prominent non-comparability invariant warning', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={fullImpact} />);
      expect(html).toContain(
        'cannot be compared across different event types'
      );
    });

    it('renders full impact model with component weights and points awarded', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={fullImpact} />);
      expect(html).toContain('85');
      expect(html).toContain('Coverage: 100%');
      expect(html).toContain('Value rarity');
      expect(html).toContain('59.9');
      expect(html).toContain('Input count structure');
    });

    it('renders partial coverage impact with clear indicator', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={partialImpact} />);
      expect(html).toContain('42.5');
      expect(html).toContain('Coverage: 50%');
      expect(html).toContain('Partial Model Coverage (50%)');
    });

    it('renders unavailable impact with reason explanation and null score handling', () => {
      const html = renderClean(<ImpactBreakdownPanel impact={unavailableImpact} />);
      expect(html).toContain('Unavailable');
      expect(html).toContain('Insufficient historical baseline sample count');
      expect(html).not.toContain('Score: 0');
    });
  });

  describe('ObservationLifecycle & WitnessPanel', () => {
    const mockObservations: EventObservation[] = [
      {
        id: 'obs-01',
        event_id: 'ev-test',
        mode: 'LIVE',
        kind: 'FIRST_SEEN',
        source: { provider: 'bitcoin-core-p2p', transport: 'p2p' },
        observed_at: '2026-09-27T10:00:00Z',
      },
      {
        id: 'obs-02',
        event_id: 'ev-test',
        mode: 'LIVE',
        kind: 'MEMPOOL_SEEN',
        source: { provider: 'mempool-zmq', transport: 'zmq' },
        observed_at: '2026-09-27T10:00:05Z',
      },
      {
        id: 'obs-03',
        event_id: 'ev-test',
        mode: 'LIVE',
        kind: 'CONFIRMED',
        source: { provider: 'bitcoin-rpc', transport: 'rpc' },
        observed_at: '2026-09-27T10:10:00Z',
        block_height: 865000,
        block_hash: '0000000000000000000123456789abcdef',
      },
    ];

    it('renders observation lifecycle stages chronologically', () => {
      const html = renderClean(
        <ObservationLifecycle observations={mockObservations} />
      );
      expect(html).toContain('Observation Lifecycle');
      expect(html).toContain('FIRST SEEN');
      expect(html).toContain('MEMPOOL SEEN');
      expect(html).toContain('CONFIRMED');
      expect(html).toContain('865,000');
    });

    it('renders witness panel with primary and corroborating sources', () => {
      const html = renderClean(
        <WitnessPanel
          primarySource={{ provider: 'bitcoin-core-p2p', transport: 'p2p' }}
          observations={mockObservations}
        />
      );
      expect(html).toContain('Witnesses &amp; Corroborating Sources');
      expect(html).toContain('bitcoin-core-p2p');
      expect(html).toContain('PRIMARY WITNESS');
      expect(html).toContain('mempool-zmq');
      expect(html).toContain('bitcoin-rpc');
    });
  });

  describe('WhyThisTriggered', () => {
    it('renders verified heuristics for Dormant Coins Moved without inventing thresholds', () => {
      const event: ChainEvent = {
        id: 'ev-dormant',
        event_type: 'DORMANT_COINS_MOVED',
        title: '50 BTC dormant for 12 years spent',
        description: 'Coins moved from 2014 address',
        severity: 'HIGH',
        confidence: 'VERIFIED_ON_CHAIN',
        detected_at: '2026-09-27T10:00:00Z',
        metadata: {
          total_dormant_sats: 5000000000,
          oldest_input_age_days: 4380,
          oldest_input_age_seconds: 378432000,
          dormant_input_count: 1,
          total_input_count: 1,
        },
      };

      const html = renderClean(<WhyThisTriggered event={event} />);
      expect(html).toContain('Why ObsChain Flagged This Event');
      expect(html).toContain('Dormant Value Moved');
      expect(html).toContain('50.00000000 BTC');
      expect(html).toContain('Oldest Spent Output Age');
      expect(html).toContain('12y');
    });

    it('renders verified heuristics for Large Transfer', () => {
      const event: ChainEvent = {
        id: 'ev-large',
        event_type: 'LARGE_TRANSFER',
        title: '1,000 BTC Transfer',
        description: 'Whale transfer observed',
        severity: 'MEDIUM',
        confidence: 'VERIFIED_ON_CHAIN',
        detected_at: '2026-09-27T10:00:00Z',
        metadata: {
          total_output_sats: 100000000000,
          fee_rate_sat_vb: 15.5,
          inputs_count: 3,
          outputs_count: 2,
        },
      };

      const html = renderClean(<WhyThisTriggered event={event} />);
      expect(html).toContain('Total Value Transferred');
      expect(html).toContain('1,000.00000000 BTC');
      expect(html).toContain('Fee Rate');
      expect(html).toContain('15.5 sat/vB');
    });
  });
});
