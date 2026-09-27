/**
 * ObsChain formatting utilities.
 * 
 * Monetary principles:
 * - All Bitcoin values originate from integer satoshi values.
 * - String/BigInt manipulation is preferred to prevent IEEE-754 float precision loss.
 * - Time formatters provide exact UTC, local time, and humanized relative offsets.
 */

/**
 * Format a satoshi amount as a localized integer string with "sats" suffix.
 */
export function formatSats(sats: number | bigint | string | null | undefined): string {
  if (sats === null || sats === undefined) return '0 sats';
  try {
    if (typeof sats === 'bigint') {
      return `${sats.toLocaleString('en-US')} sats`;
    }
    if (typeof sats === 'string') {
      const clean = sats.trim().split('.')[0];
      return `${BigInt(clean).toLocaleString('en-US')} sats`;
    }
    const val = BigInt(Math.trunc(sats));
    return `${val.toLocaleString('en-US')} sats`;
  } catch {
    return '0 sats';
  }
}

/**
 * Convert integer satoshis into an exact BTC string without floating-point inaccuracy.
 * 1 BTC = 100,000,000 satoshis.
 */
export function formatBtcFromSats(
  sats: number | bigint | string | null | undefined,
  options?: {
    maxDecimals?: number;
    minDecimals?: number;
    trimTrailingZeros?: boolean;
    showUnit?: boolean;
  }
): string {
  if (sats === null || sats === undefined) {
    return options?.showUnit === false ? '0.00' : '0.00 BTC';
  }

  const {
    maxDecimals = 8,
    minDecimals = 2,
    trimTrailingZeros = false,
    showUnit = true,
  } = options || {};

  try {
    const rawBigInt =
      typeof sats === 'bigint'
        ? sats
        : typeof sats === 'string'
          ? BigInt(sats.trim().split('.')[0])
          : BigInt(Math.trunc(sats));
    const isNegative = rawBigInt < 0n;
    const absBigInt = isNegative ? -rawBigInt : rawBigInt;

    const whole = absBigInt / 100_000_000n;
    const fraction = absBigInt % 100_000_000n;

    // Pad fraction to 8 digits
    const fractionStr = fraction.toString().padStart(8, '0');

    // Slice or pad according to maxDecimals
    let formattedFraction = fractionStr.slice(0, maxDecimals);

    if (trimTrailingZeros) {
      formattedFraction = formattedFraction.replace(/0+$/, '');
      if (formattedFraction.length < minDecimals) {
        formattedFraction = formattedFraction.padEnd(minDecimals, '0');
      }
    } else {
      if (formattedFraction.length < minDecimals) {
        formattedFraction = formattedFraction.padEnd(minDecimals, '0');
      }
    }

    const wholeFormatted = whole.toLocaleString('en-US');
    const sign = isNegative ? '-' : '';
    const result = formattedFraction.length > 0 
      ? `${sign}${wholeFormatted}.${formattedFraction}` 
      : `${sign}${wholeFormatted}`;

    return showUnit ? `${result} BTC` : result;
  } catch {
    return options?.showUnit === false ? '0.00' : '0.00 BTC';
  }
}

/**
 * Format fee rate in sat/vB.
 */
export function formatFeeRate(satVb: number | null | undefined, decimals = 1): string {
  if (satVb === null || satVb === undefined || isNaN(satVb)) {
    return 'N/A';
  }
  return `${satVb.toFixed(decimals)} sat/vB`;
}

/**
 * Format age in days/seconds into human readable components (e.g. "13y 8m", "42d", "5h 12m").
 */
export function formatAge(ageDays: number, ageSeconds?: number): string {
  if (ageDays <= 0 && (!ageSeconds || ageSeconds <= 0)) {
    return '< 1 day';
  }

  const days = Math.floor(ageDays);
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    if (months > 0) {
      return `${years}y ${months}m`;
    }
    return `${years}y`;
  }

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    if (remDays > 0) {
      return `${months}m ${remDays}d`;
    }
    return `${months}m`;
  }

  if (days >= 1) {
    return `${days}d`;
  }

  if (ageSeconds && ageSeconds > 0) {
    const hours = Math.floor(ageSeconds / 3600);
    const minutes = Math.floor((ageSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  return '< 1 day';
}

/**
 * Format coin age destroyed (CAD) in BTC-years or BTC-days.
 */
export function formatCoinAgeDestroyed(
  cadBtcYears?: number | string | null,
  cadBtcDays?: number | null
): string {
  if (cadBtcYears !== undefined && cadBtcYears !== null) {
    const num = Number(cadBtcYears);
    if (!isNaN(num) && num > 0) {
      return `${num.toLocaleString(undefined, { maximumFractionDigits: 1 })} BTC-years`;
    }
  }

  if (cadBtcDays !== undefined && cadBtcDays !== null) {
    const num = Number(cadBtcDays);
    if (!isNaN(num) && num > 0) {
      return `${num.toLocaleString(undefined, { maximumFractionDigits: 1 })} BTC-days`;
    }
  }

  return 'N/A';
}

/**
 * Format an ISO timestamp to strict absolute UTC string.
 * E.g. "24 Sep 2026, 05:31:42 UTC"
 */
export function formatUtcTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const day = date.getUTCDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} UTC`;
  } catch {
    return isoString;
  }
}

/**
 * Format an ISO timestamp into user local time.
 */
export function formatLocalTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "42s ago", "2m ago", "just now").
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = Date.now();
    const diffMs = now - date.getTime();

    if (diffMs < 0) return 'just now';

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'recently';
  }
}

/**
 * Format BTC amount alias matching formatBtcFromSats.
 */
export function formatBtc(
  sats: number | bigint | string | null | undefined,
  options?: Parameters<typeof formatBtcFromSats>[1]
): string {
  return formatBtcFromSats(sats, options);
}

/**
 * Format population count as integer with thousands separators.
 */
export function formatPopulation(count: number | bigint | string | null | undefined): string {
  if (count === null || count === undefined) return '0';
  try {
    if (typeof count === 'bigint') {
      return count.toLocaleString('en-US');
    }
    if (typeof count === 'string') {
      const clean = count.trim().split('.')[0];
      return BigInt(clean).toLocaleString('en-US');
    }
    return BigInt(Math.trunc(count)).toLocaleString('en-US');
  } catch {
    return String(count);
  }
}

/**
 * Format percentile with exact or estimated precision.
 * e.g. 99.94 -> "99.94th percentile", or with tilde if estimated: "≈ 99.47th percentile"
 */
export function formatPercentile(
  percentile: number | null | undefined,
  options?: {
    estimated?: boolean;
    includeSuffix?: boolean;
    decimals?: number;
  }
): string {
  if (percentile === null || percentile === undefined || isNaN(percentile)) {
    return 'N/A';
  }

  const { estimated = false, includeSuffix = true, decimals = 2 } = options || {};
  const formattedNumber = percentile.toFixed(decimals);

  let suffix = '';
  if (includeSuffix) {
    const lastDigit = Math.floor(percentile) % 10;
    const lastTwoDigits = Math.floor(percentile) % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      suffix = 'th';
    } else if (lastDigit === 1) {
      suffix = 'st';
    } else if (lastDigit === 2) {
      suffix = 'nd';
    } else if (lastDigit === 3) {
      suffix = 'rd';
    } else {
      suffix = 'th';
    }
  }

  const prefix = estimated ? '≈ ' : '';
  const suffixStr = includeSuffix ? `${suffix} percentile` : '%';
  return `${prefix}${formattedNumber}${suffixStr}`;
}

/**
 * Format basis points (1 bp = 0.01%).
 * e.g. 9999 -> "99.99%"
 */
export function formatBasisPoints(bp: number | null | undefined): string {
  if (bp === null || bp === undefined || isNaN(bp)) {
    return 'N/A';
  }
  return `${(bp / 100).toFixed(2)}%`;
}

/**
 * Format duration in seconds into human-readable duration (e.g. "1h 42m 15s", "45s", "12m 30s").
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '0s';
  }
  const sec = Math.floor(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = sec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Format coin age into human-readable string.
 */
export function formatCoinAge(days: number | null | undefined, seconds?: number | null): string {
  if (days === null || days === undefined || isNaN(days)) {
    return 'N/A';
  }
  return formatAge(days, seconds ?? undefined);
}

/**
 * Format generic metric value based on metric name and unit.
 */
export function formatMetricValue(
  value: string | number | bigint | null | undefined,
  metricName: string,
  unit?: string
): string {
  if (value === null || value === undefined) return 'N/A';
  const valStr = String(value);

  const lower = metricName.toLowerCase();
  if (lower.includes('sats') || lower.includes('satoshis') || unit === 'satoshis') {
    return formatBtcFromSats(valStr);
  }
  if (lower.includes('fee_rate') || unit === 'sat/vB') {
    const num = Number(valStr);
    return isNaN(num) ? `${valStr} sat/vB` : formatFeeRate(num);
  }
  if (lower.includes('coin_age_destroyed') || unit === 'satoshi-days') {
    return `${valStr} satoshi-days`;
  }
  if (lower.includes('ratio') || unit === 'basis-points') {
    const num = Number(valStr);
    return isNaN(num) ? valStr : formatBasisPoints(num);
  }
  if (lower.includes('age_days')) {
    const num = Number(valStr);
    return isNaN(num) ? `${valStr} days` : formatCoinAge(num);
  }
  if (lower.includes('interval_seconds')) {
    const num = Number(valStr);
    return isNaN(num) ? `${valStr}s` : formatDuration(num);
  }

  return valStr;
}

