import { describe, it, expect } from 'vitest';
import {
  formatSats,
  formatBtcFromSats,
  formatFeeRate,
  formatAge,
  formatCoinAgeDestroyed,
  formatUtcTimestamp,
  formatRelativeTime,
} from '../utils/formatters';

describe('formatSats', () => {
  it('formats positive integer satoshis with commas and suffix', () => {
    expect(formatSats(1842540000)).toBe('1,842,540,000 sats');
    expect(formatSats(1)).toBe('1 sats');
    expect(formatSats(0)).toBe('0 sats');
  });

  it('handles BigInt satoshis safely', () => {
    expect(formatSats(2_100_000_000_000_000n)).toBe('2,100,000,000,000,000 sats');
  });

  it('handles null/undefined gracefully', () => {
    expect(formatSats(null)).toBe('0 sats');
    expect(formatSats(undefined)).toBe('0 sats');
  });
});

describe('formatBtcFromSats (Monetary precision)', () => {
  it('converts exact integer satoshis to BTC without floating point loss', () => {
    expect(formatBtcFromSats(100_000_000)).toBe('1.00000000 BTC');
    expect(formatBtcFromSats(1)).toBe('0.00000001 BTC');
    expect(formatBtcFromSats(184254000000)).toBe('1,842.54000000 BTC');
  });

  it('supports decimal trim options', () => {
    expect(
      formatBtcFromSats(184254000000, { trimTrailingZeros: true, minDecimals: 2 })
    ).toBe('1,842.54 BTC');

    expect(
      formatBtcFromSats(50000000, { trimTrailingZeros: true, minDecimals: 2 })
    ).toBe('0.50 BTC');
  });

  it('handles zero and null amounts', () => {
    expect(formatBtcFromSats(0)).toBe('0.00000000 BTC');
    expect(formatBtcFromSats(null)).toBe('0.00 BTC');
    expect(formatBtcFromSats(undefined)).toBe('0.00 BTC');
  });
});

describe('formatFeeRate', () => {
  it('formats sat/vB fee rate', () => {
    expect(formatFeeRate(742.0)).toBe('742.0 sat/vB');
    expect(formatFeeRate(12.345, 2)).toBe('12.35 sat/vB');
  });

  it('handles null/undefined/NaN', () => {
    expect(formatFeeRate(null)).toBe('N/A');
    expect(formatFeeRate(undefined)).toBe('N/A');
    expect(formatFeeRate(NaN)).toBe('N/A');
  });
});

describe('formatAge', () => {
  it('formats multi-year coin ages', () => {
    // 13 years, ~8 months = ~5000 days
    expect(formatAge(5000)).toBe('13y 8m');
    expect(formatAge(365)).toBe('1y');
  });

  it('formats month and day coin ages', () => {
    expect(formatAge(45)).toBe('1m 15d');
    expect(formatAge(7)).toBe('7d');
  });

  it('formats hour/minute ages for fresh events', () => {
    expect(formatAge(0, 7200)).toBe('2h 0m');
    expect(formatAge(0, 180)).toBe('3m');
    expect(formatAge(0, 0)).toBe('< 1 day');
  });
});

describe('formatCoinAgeDestroyed', () => {
  it('formats BTC-years and BTC-days', () => {
    expect(formatCoinAgeDestroyed(25214.2)).toBe('25,214.2 BTC-years');
    expect(formatCoinAgeDestroyed(null, 1500)).toBe('1,500 BTC-days');
    expect(formatCoinAgeDestroyed(null, null)).toBe('N/A');
  });
});

describe('formatUtcTimestamp', () => {
  it('formats ISO timestamps to strict UTC strings', () => {
    const iso = '2026-09-24T05:31:42.000Z';
    expect(formatUtcTimestamp(iso)).toBe('24 Sep 2026, 05:31:42 UTC');
  });
});

describe('formatRelativeTime', () => {
  it('formats relative offsets', () => {
    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 2000).toISOString())).toBe('just now');
    expect(formatRelativeTime(new Date(now - 42000).toISOString())).toBe('42s ago');
    expect(formatRelativeTime(new Date(now - 120000).toISOString())).toBe('2m ago');
    expect(formatRelativeTime(new Date(now - 7200000).toISOString())).toBe('2h ago');
    expect(formatRelativeTime(new Date(now - 86400000 * 3).toISOString())).toBe('3d ago');
  });
});
