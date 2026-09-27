import { describe, it, expect } from 'vitest';
import contractFixture from './fixtures/rarity_contract.json';
import {
  MetricRarity,
  ImpactBreakdown,
} from '../types/rarity';
import {
  formatPercentile,
  formatPopulation,
  formatBasisPoints,
  formatBtc,
  formatCoinAge,
  formatMetricValue,
} from '../utils/formatters';
import { BoundedCache } from '../api/cache';

describe('Frozen Rarity & Impact Contract (Phase 7A)', () => {
  const contracts = contractFixture.contracts;

  describe('Contract 1: exact_rarity', () => {
    const exact = contracts.exact_rarity as MetricRarity;

    it('matches frozen contract structure and types', () => {
      expect(exact.metric).toBe('value_sats');
      expect(exact.value).toBe('10000000000');
      expect(exact.value_display).toBe('100.00000000 BTC');
      expect(exact.percentile).toBe(99.94);
      expect(exact.percentile_method).toBe('EXACT_EMPIRICAL_CDF');
      expect(exact.estimated).toBe(false);
      expect(exact.rarity_band).toBe('EXTREME');
      expect(exact.band).toBe('EXTREME');
      expect(exact.rarity).toBe('EXTREME');
      expect(exact.population_size).toBe(18421);
      expect(exact.tail_count).toBe(11);
      expect(exact.baseline_quality).toBe('HIGH');
      expect(exact.is_primary).toBe(true);
    });

    it('formats exact empirical CDF without approximation prefix', () => {
      const formattedWithSuffix = formatPercentile(exact.percentile, {
        estimated: exact.estimated,
        includeSuffix: true,
      });
      expect(formattedWithSuffix).toBe('99.94th percentile');
      expect(formattedWithSuffix).not.toContain('≈');

      const formattedPercent = formatPercentile(exact.percentile, {
        estimated: exact.estimated,
        includeSuffix: false,
      });
      expect(formattedPercent).toBe('99.94%');
      expect(formattedPercent).not.toContain('≈');
    });

    it('formats population and basis points correctly', () => {
      expect(formatPopulation(exact.population_size)).toBe('18,421');
      expect(formatBasisPoints(100)).toBe('1.00%');
      expect(formatBasisPoints(9994)).toBe('99.94%');
    });
  });

  describe('Contract 2: estimated_rarity', () => {
    const estimated = contracts.estimated_rarity as MetricRarity;

    it('matches frozen contract structure for quantile interpolation', () => {
      expect(estimated.metric).toBe('value_sats');
      expect(estimated.value).toBe('10000000000');
      expect(estimated.percentile).toBe(99.94);
      expect(estimated.percentile_method).toBe('QUANTILE_INTERPOLATION_ESTIMATE');
      expect(estimated.estimated).toBe(true);
      expect(estimated.rarity_band).toBe('EXTREME');
      expect(estimated.population_size).toBe(18421);
      expect(estimated.tail_count).toBe(11);
      expect(estimated.baseline_quality).toBe('HIGH');
    });

    it('formats estimated percentile with approximation marker', () => {
      const formatted = formatPercentile(estimated.percentile, {
        estimated: estimated.estimated,
        includeSuffix: true,
      });
      expect(formatted).toBe('≈ 99.94th percentile');
      expect(formatted.startsWith('≈')).toBe(true);

      const formattedPercent = formatPercentile(estimated.percentile, {
        estimated: estimated.estimated,
        includeSuffix: false,
      });
      expect(formattedPercent).toBe('≈ 99.94%');
    });
  });

  describe('Contract 3: insufficient_data', () => {
    const insufficient = contracts.insufficient_data as MetricRarity;

    it('strictly preserves nulls without converting to 0 or COMMON', () => {
      expect(insufficient.percentile).toBeNull();
      expect(insufficient.percentile_method).toBeNull();
      expect(insufficient.tail_count).toBeNull();
      expect(insufficient.rarity_band).toBe('INSUFFICIENT_DATA');
      expect(insufficient.baseline_quality).toBe('INSUFFICIENT');
      expect(insufficient.population_size).toBe(37);
    });

    it('never renders 0% or 0th percentile for missing data', () => {
      const formatted = formatPercentile(insufficient.percentile);
      expect(formatted).toBe('N/A');
      expect(formatted).not.toBe('0%');
      expect(formatted).not.toBe('0.00%');
      expect(formatted).not.toBe('0th percentile');
    });

    it('returns N/A for basis points on null percentile', () => {
      expect(formatBasisPoints(insufficient.percentile)).toBe('N/A');
    });
  });

  describe('Contract 4: full_impact', () => {
    const full = contracts.full_impact as ImpactBreakdown;

    it('matches frozen impact model structure', () => {
      expect(full.status).toBe('EXPERIMENTAL');
      expect(full.model_id).toBe('obschain-impact-large-transfer-v1');
      expect(full.model_version).toBe('v1');
      expect(full.event_type).toBe('LARGE_TRANSFER');
      expect(full.score).toBe(85.0);
      expect(full.max_possible_points).toBe(100.0);
      expect(full.model_coverage).toBe(1.0);
      expect(full.unavailable_reason).toBeNull();
      expect(full.components).toHaveLength(4);
    });

    it('contains valid component weights and raw values', () => {
      const totalWeight = full.components.reduce((acc, c) => acc + c.weight, 0);
      expect(totalWeight).toBe(100.0);

      const valueComp = full.components.find((c) => c.metric === 'value_sats');
      expect(valueComp).toBeDefined();
      expect(valueComp?.percentile).toBe(99.94);
      expect(valueComp?.points_awarded).toBe(59.93);
    });
  });

  describe('Contract 5: partial_coverage_impact', () => {
    const partial = contracts.partial_coverage_impact as ImpactBreakdown;

    it('properly encodes partial model coverage', () => {
      expect(partial.score).toBe(42.5);
      expect(partial.model_coverage).toBe(0.5);
      expect(partial.unavailable_reason).toBeNull();
      expect(partial.components).toHaveLength(2);
    });
  });

  describe('Contract 6: unavailable_impact', () => {
    const unavailable = contracts.unavailable_impact as ImpactBreakdown;

    it('preserves null score with explicit statistical unavailable reason', () => {
      expect(unavailable.score).toBeNull();
      expect(unavailable.model_coverage).toBe(0.25);
      expect(unavailable.unavailable_reason).toBe('INSUFFICIENT_BASELINE');
      expect(unavailable.components[0].percentile).toBeNull();
      expect(unavailable.components[0].population_size).toBe(37);
    });
  });
});

describe('Statistical & Metric Formatters', () => {
  it('formats Bitcoin amounts with BigInt safety without precision loss', () => {
    expect(formatBtc('10000000000')).toBe('100.00000000 BTC');
    expect(formatBtc(10000000000)).toBe('100.00000000 BTC');
    expect(formatBtc('5000')).toBe('0.00005000 BTC');
    expect(formatBtc(null)).toBe('0.00 BTC');
    expect(formatBtc(undefined)).toBe('0.00 BTC');
  });

  it('formats Coin Age Destroyed without float inaccuracies', () => {
    expect(formatCoinAge(365)).toBe('1y');
    expect(formatCoinAge(1)).toBe('1d');
    expect(formatCoinAge(null)).toBe('N/A');
  });

  it('formats diverse metric values appropriately', () => {
    expect(formatMetricValue('2500000000', 'value_sats')).toBe('25.00000000 BTC');
    expect(formatMetricValue('125.4', 'fee_rate_sat_vb')).toBe('125.4 sat/vB');
    expect(formatMetricValue('450', 'vsize')).toBe('450');
    expect(formatMetricValue('12', 'input_count')).toBe('12');
    expect(formatMetricValue(null, 'value_sats')).toBe('N/A');
  });
});

describe('BoundedCache & API Clients', () => {
  it('evicts oldest entries when capacity exceeds limit', () => {
    const cache = new BoundedCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);

    // Refresh 'a' to make it most recently accessed
    cache.get('a');
    cache.set('d', 4); // should evict 'b'

    expect(cache.has('b')).toBe(false);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('clears all cached entries', () => {
    const cache = new BoundedCache<string, string>(5);
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('k1')).toBeUndefined();
  });
});
