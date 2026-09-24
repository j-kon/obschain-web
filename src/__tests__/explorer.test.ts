import { describe, it, expect } from 'vitest';
import {
  getTransactionExplorerUrl,
  getBlockExplorerUrl,
  getAddressExplorerUrl,
} from '../utils/explorer';

describe('Explorer link helpers', () => {
  it('builds transaction explorer URLs', () => {
    const txid = '3b9264c8d1935639682570d556ad9857908b9816da33989c97b87feee7061d43';
    expect(getTransactionExplorerUrl(txid)).toBe(
      `https://mempool.space/tx/${txid}`
    );
  });

  it('builds block explorer URLs by height or hash', () => {
    expect(getBlockExplorerUrl(968123)).toBe('https://mempool.space/block/968123');
    expect(
      getBlockExplorerUrl('00000000000000000001f37e42d8')
    ).toBe('https://mempool.space/block/00000000000000000001f37e42d8');
  });

  it('builds address explorer URLs', () => {
    const addr = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
    expect(getAddressExplorerUrl(addr)).toBe(
      `https://mempool.space/address/${addr}`
    );
  });
});
