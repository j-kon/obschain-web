import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '../api/client';
import { ChainEvent } from '../types';
import { EventDetailPage } from '../pages/EventDetailPage';
import { mapRarityError } from '../hooks/useEventRarity';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!-- -->/g, '');
}

const mockEvent: ChainEvent = {
  id: 'ev-test-503',
  event_type: 'LARGE_TRANSFER',
  title: 'Large 500 BTC Transfer in Block 860,000',
  description: 'Major liquidity shift observed to fresh P2WPKH script.',
  severity: 'MEDIUM',
  confidence: 'VERIFIED_ON_CHAIN',
  detected_at: '2026-09-27T10:00:00Z',
  txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  block_height: 860000,
  block_hash: '0000000000000000000192837465abcdef',
  metadata: {
    total_output_sats: 50000000000,
    fee_rate_sat_vb: 22.4,
    inputs_count: 2,
    outputs_count: 2,
  },
};

describe('Phase 7A: Error Isolation & 503 Non-Crashing Guarantee', () => {
  describe('mapRarityError pure error isolation', () => {
    it('accurately identifies HTTP 503 as temporary unavailability', () => {
      const err = new ApiError(503, 'Storage indexer exact-rank engine busy');
      const mapped = mapRarityError(err);
      expect(mapped.isUnavailable503).toBe(true);
      expect(mapped.error).toContain('temporarily unavailable');
    });

    it('identifies HTTP 404 as missing baseline record without 503 flag', () => {
      const err = new ApiError(404, 'Not Found');
      const mapped = mapRarityError(err);
      expect(mapped.isUnavailable503).toBe(false);
      expect(mapped.error).toContain('No historical rarity record found');
    });

    it('handles offline / network exception gracefully', () => {
      const err = new Error('Failed to fetch / network connection refused');
      const mapped = mapRarityError(err);
      expect(mapped.isUnavailable503).toBe(false);
      expect(mapped.error).toBe('Failed to fetch / network connection refused');
    });

    it('handles unknown error types safely', () => {
      const mapped = mapRarityError({ random: 'object' });
      expect(mapped.isUnavailable503).toBe(false);
      expect(mapped.error).toBe('Failed to retrieve event rarity analysis');
    });
  });

  describe('EventDetailPage with Isolated Rarity 503 Failure', () => {
    it('renders event details, triggers, metrics, and anchors even when rarity 503s', () => {
      const html = renderClean(
        <MemoryRouter initialEntries={['/events/ev-test-503']}>
          <EventDetailPage
            initialEvent={mockEvent}
            initialUnavailable503={true}
          />
        </MemoryRouter>
      );

      // 1. Navigation & Breadcrumb intact
      expect(html).toContain('Back to Observations Feed');

      // 2. Primary Event Header & Title rendered
      expect(html).toContain('Large 500 BTC Transfer in Block 860,000');
      expect(html).toContain('LARGE TRANSFER');

      // 3. Why This Triggered heuristic rendered
      expect(html).toContain('Why ObsChain Flagged This Event');
      expect(html).toContain('Total Value Transferred');
      expect(html).toContain('500.00000000 BTC');

      // 4. Isolated 503 Service Unavailable notice rendered in rarity section
      expect(html).toContain('Historical Rarity Temporarily Unavailable (503)');
      expect(html).toContain('Exact-rank storage indexer is currently unavailable');

      // 5. Cryptographic Anchors rendered
      expect(html).toContain('860,000');
      expect(html).toContain('4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b');

      // 6. Provenance & Attribution rendered
      expect(html).toContain('Provenance &amp; Attribution');

      // 7. Raw JSON toggle rendered
      expect(html).toContain('Raw Event Data (JSON Payload)');
    });

    it('renders non-crashing empty/error state when event observation is missing', () => {
      const html = renderClean(
        <MemoryRouter initialEntries={['/events/unknown']}>
          <EventDetailPage
            initialEvent={null}
            initialError="Event observation not found"
          />
        </MemoryRouter>
      );

      expect(html).toContain('Back to Events Feed');
      expect(html).toContain('Event observation not found');
    });
  });
});
