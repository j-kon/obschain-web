/**
 * External block and transaction explorer link helpers.
 * Centralizes explorer URLs so the app does not scatter hardcoded URLs across components.
 */

const DEFAULT_EXPLORER_BASE = 'https://mempool.space';

export function getTransactionExplorerUrl(txid: string): string {
  const cleanTxid = encodeURIComponent(txid.trim());
  return `${DEFAULT_EXPLORER_BASE}/tx/${cleanTxid}`;
}

export function getBlockExplorerUrl(heightOrHash: number | string): string {
  const clean = encodeURIComponent(String(heightOrHash).trim());
  return `${DEFAULT_EXPLORER_BASE}/block/${clean}`;
}

export function getAddressExplorerUrl(address: string): string {
  const clean = encodeURIComponent(address.trim());
  return `${DEFAULT_EXPLORER_BASE}/address/${clean}`;
}
