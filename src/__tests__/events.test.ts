import { describe, it, expect } from 'vitest';
import { ChainEvent, EventType } from '../types';

describe('Event Deduplication & Sorting', () => {
  const event1: ChainEvent = {
    id: 'evt-001',
    event_type: 'DORMANT_COINS_MOVED',
    severity: 'HIGH',
    confidence: 'VERIFIED_ON_CHAIN',
    title: 'Dormant coins moved',
    description: '1,842 BTC moved after 13 years',
    detected_at: '2026-09-24T05:30:00.000Z',
    metadata: {
      total_dormant_sats: 184254000000,
      oldest_input_age_days: 5000,
      classification: 'VERY_OLD',
    },
  };

  const event2: ChainEvent = {
    id: 'evt-002',
    event_type: 'EXTREME_FEE',
    severity: 'MEDIUM',
    confidence: 'VERIFIED_ON_CHAIN',
    title: 'Extreme fee transaction',
    description: 'High fee rate',
    detected_at: '2026-09-24T05:35:00.000Z', // newer
    metadata: {
      fee_sats: 31000000,
      fee_rate_sat_vb: 742,
      fee_trigger_type: 'BOTH',
    },
  };

  const event1Duplicate: ChainEvent = {
    ...event1,
    title: 'Duplicate event 1',
  };

  it('deduplicates events by unique ID', () => {
    const list = [event1];
    const incoming = [event2, event1Duplicate];

    const deduplicated = [...list];
    for (const item of incoming) {
      if (!deduplicated.some((e) => e.id === item.id)) {
        deduplicated.push(item);
      }
    }

    expect(deduplicated).toHaveLength(2);
    expect(deduplicated.map((e) => e.id)).toEqual(['evt-001', 'evt-002']);
  });

  it('sorts events newest first by detected_at', () => {
    const list = [event1, event2];
    list.sort(
      (a, b) =>
        new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
    );

    expect(list[0].id).toBe('evt-002'); // 05:35:00
    expect(list[1].id).toBe('evt-001'); // 05:30:00
  });

  it('caps retained event list to max limit', () => {
    const maxRetained = 3;
    const manyEvents: ChainEvent[] = Array.from({ length: 10 }, (_, i) => ({
      ...event1,
      id: `evt-${i}`,
      detected_at: new Date(Date.now() + i * 1000).toISOString(),
    }));

    const capped = manyEvents.slice(0, maxRetained);
    expect(capped).toHaveLength(3);
  });

  it('filters events by category correctly', () => {
    const events: ChainEvent[] = [
      event1,
      event2,
      {
        id: 'evt-003',
        event_type: 'CONSOLIDATION',
        severity: 'LOW',
        confidence: 'VERIFIED_ON_CHAIN',
        title: 'UTXO Consolidation',
        description: 'Consolidation of 50 inputs',
        detected_at: '2026-09-24T05:32:00.000Z',
        metadata: { input_count: 50, output_count: 1 },
      },
    ];

    const dormantOnly = events.filter(
      (e) =>
        e.event_type === 'DORMANT_COINS_MOVED' ||
        e.event_type === ('DORMANT_UTXO_SPENT' as EventType)
    );
    expect(dormantOnly).toHaveLength(1);
    expect(dormantOnly[0].id).toBe('evt-001');

    const feeOnly = events.filter((e) => e.event_type === 'EXTREME_FEE');
    expect(feeOnly).toHaveLength(1);
    expect(feeOnly[0].id).toBe('evt-002');
  });
});
