import { Chain } from '../types';

/**
 * External block and transaction explorer link helpers.
 * Centralizes explorer URLs with multi-chain awareness (Bitcoin and Liquid Network).
 */

const BITCOIN_EXPLORER_BASE = 'https://mempool.space';
const LIQUID_EXPLORER_BASE = 'https://blockstream.info/liquid';

export function getTransactionExplorerUrl(txid: string, chain: Chain = 'BITCOIN'): string {
  const cleanTxid = encodeURIComponent(txid.trim());
  const base = chain === 'LIQUID' ? LIQUID_EXPLORER_BASE : BITCOIN_EXPLORER_BASE;
  return `${base}/tx/${cleanTxid}`;
}

export function getBlockExplorerUrl(heightOrHash: number | string, chain: Chain = 'BITCOIN'): string {
  const clean = encodeURIComponent(String(heightOrHash).trim());
  const base = chain === 'LIQUID' ? LIQUID_EXPLORER_BASE : BITCOIN_EXPLORER_BASE;
  return `${base}/block/${clean}`;
}

export function getAddressExplorerUrl(address: string, chain: Chain = 'BITCOIN'): string {
  const clean = encodeURIComponent(address.trim());
  const base = chain === 'LIQUID' ? LIQUID_EXPLORER_BASE : BITCOIN_EXPLORER_BASE;
  return `${base}/address/${clean}`;
}
