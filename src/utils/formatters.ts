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
    const val = typeof sats === 'bigint' ? sats : BigInt(Math.trunc(Number(sats)));
    return `${val.toLocaleString()} sats`;
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
    const rawBigInt = typeof sats === 'bigint' ? sats : BigInt(Math.trunc(Number(sats)));
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
