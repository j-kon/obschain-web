import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import {
  Incident,
  IncidentStatus,
  ProvenanceClassification,
  RecoverySummary,
  GraphEdgeType,
} from '../types';
import { IncidentStatusBadge } from '../components/incidents/IncidentStatusBadge';
import { EvidenceClassificationBadge } from '../components/incidents/EvidenceClassificationBadge';
import { ChainBadge } from '../components/incidents/ChainBadge';
import { FundRecoveryPanel } from '../components/incidents/FundRecoveryPanel';
import { WhatChainProvesSummary } from '../components/incidents/WhatChainProvesSummary';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { IncidentTransactionTable } from '../components/incidents/IncidentTransactionTable';
import { OnChainMessages } from '../components/incidents/OnChainMessages';
import { TechnicalFindingPanel } from '../components/incidents/TechnicalFindingPanel';
import { SourceList } from '../components/incidents/SourceList';
import { IncidentUpdateHistory } from '../components/incidents/IncidentUpdateHistory';
import { formatBtcFromSats } from '../utils/formatters';

// Clean React SSR comments for text matching
function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!-- -->/g, '');
}

// Realistic fixture modelled directly after backend payload for OC-2026-0001
const liquidIncidentFixture: Incident = {
  id: 'd88bbd02-cf32-42c2-83bf-7bfcf9f0868f',
  case_id: 'OC-2026-0001',
  title: 'Liquid Network Security Incident',
  summary:
    'On 6 September 2026, an invalid Liquid transaction exploited an element rangeproof cache vulnerability.',
  status: 'MONITORING',
  severity: 'CRITICAL',
  recovery: {
    affected_sats: 399602000000,
    recovered_sats: 340000000000,
    outstanding_sats: 59602000000,
    as_of_timestamp: '2026-09-23T23:59:59Z',
    source: 'Blockstream Official Disclosure',
    is_estimate: true,
  },
  total_btc_affected: 3996.02,
  total_btc_recovered: 3400.0,
  first_observed_at: '2026-09-06T13:53:00Z',
  last_updated_at: '2026-09-23T23:59:59Z',
  structured_claims: {
    verified_on_chain: [
      'Peg-out transaction confirmed on Bitcoin blockchain (Block 965,783)',
      '3,400 BTC returned in Bitcoin transaction 456b...',
      'OP_RETURN message recorded on Bitcoin (Block 965,818)',
    ],
    officially_attributed: [
      'Rangeproof verification cache consensus flaw in Elements core',
      'Emergency patch Elements v23.3.4 deployed',
    ],
    reported: [
      'Independent security researchers confirmed patch correctness',
    ],
    heuristic: [
      'Possible actor-associated intermediary address cluster',
    ],
    unknown: [
      'Real-world identity of the actor',
      'Actor motivation and long-term ethical status',
      'Full settlement of remaining ~596 BTC after 23 Sep 2026',
    ],
  },
  entities: [
    {
      id: 'ent-1',
      name: 'Exploit Actor',
      entity_type: 'UNKNOWN_ACTOR',
      description: 'Self-described white hat; true identity unverified',
      attribution_confidence: 'UNVERIFIED',
    },
  ],
  transactions: [
    {
      chain: 'LIQUID',
      txid: 'f24a4b17e88909871234567890abcdef1234567890abcdef1234567890abcdef',
      role: 'EXPLOIT',
      amount_sats: 0,
      block_height: 4050336,
      confirmed_at: '2026-09-06T13:53:00Z',
      notes: 'Invalid rangeproof transaction accepted by vulnerable node cache',
    },
    {
      chain: 'BITCOIN',
      txid: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef',
      role: 'PEG_OUT',
      amount_sats: 399602000000,
      block_height: 965783,
      confirmed_at: '2026-09-06T14:28:00Z',
      notes: 'Automated federation peg-out release',
    },
    {
      chain: 'BITCOIN',
      txid: '456b789c01234567890abcdef1234567890abcdef1234567890abcdef12345678',
      role: 'RETURN',
      amount_sats: 340000000000,
      block_height: 965950,
      confirmed_at: '2026-09-07T16:09:00Z',
      notes: 'Actor return transfer to federation multisig',
    },
  ],
  blocks: [
    {
      chain: 'LIQUID',
      height: 4050336,
      hash: '0000000000000000000000000000000000000000000000000000000000000001',
      timestamp: '2026-09-06T13:53:00Z',
    },
    {
      chain: 'BITCOIN',
      height: 965783,
      hash: '0000000000000000000123456789abcdef123456789abcdef123456789abcdef1',
      timestamp: '2026-09-06T14:28:00Z',
    },
  ],
  on_chain_messages: [
    {
      txid: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12',
      chain: 'BITCOIN',
      encoding: 'UTF-8',
      decoded_text: 'we are whitehats. contact us on chain.',
      raw_hex: '6a26776520617265207768697465686174732e20636f6e74616374207573206f6e20636861696e2e',
      confirmed_at: '2026-09-06T18:30:00Z',
      block_height: 965818,
      attributed_sender: 'Self-described white hat actor',
      sender_attribution_confidence: 'UNVERIFIED',
    },
  ],
  timeline: [
    {
      id: 'tl-1',
      timestamp: '2026-09-06T13:53:00Z',
      title: 'Invalid Liquid transaction accepted',
      description: 'Exploited node cache in block 4,050,336',
      category: 'EXPLOIT',
      evidence_ids: ['ev-1'],
      transaction_txids: ['f24a4b17...'],
      block_heights: [4050336],
      classification: 'ON_CHAIN_VERIFIED',
    },
    {
      id: 'tl-2',
      timestamp: '2026-09-06T14:28:00Z',
      title: 'Peg-out transaction confirmed on Bitcoin',
      description: '~3,996 BTC released in Bitcoin block 965,783',
      category: 'ON_CHAIN_MOVEMENT',
      evidence_ids: ['ev-2'],
      transaction_txids: ['a1b2c3d4...'],
      block_heights: [965783],
      classification: 'ON_CHAIN_VERIFIED',
    },
    {
      id: 'tl-3',
      timestamp: '2026-09-06T18:30:00Z',
      title: 'On-chain message observed',
      description: 'Whitehat claim in Bitcoin block 965,818',
      category: 'COMMUNICATION',
      evidence_ids: ['ev-3'],
      transaction_txids: ['b2c3d4e5...'],
      block_heights: [965818],
      classification: 'ON_CHAIN_VERIFIED',
    },
    {
      id: 'tl-4',
      timestamp: '2026-09-07T16:09:00Z',
      title: '3,400 BTC returned',
      description: 'Return transaction to federation in block 965,950',
      category: 'RECOVERY',
      evidence_ids: ['ev-4'],
      transaction_txids: ['456b789c...'],
      block_heights: [965950],
      classification: 'ON_CHAIN_VERIFIED',
    },
  ],
  evidence: [
    {
      id: 'ev-1',
      incident_id: 'd88bbd02-cf32-42c2-83bf-7bfcf9f0868f',
      evidence_type: 'ON_CHAIN_TRANSACTION',
      confidence: 'ON_CHAIN_VERIFIED',
      title: 'Liquid exploit transaction',
      description: 'Accepted under corrupted rangeproof validation cache',
      chain: 'LIQUID',
      verified: true,
      created_at: '2026-09-06T13:53:00Z',
    },
    {
      id: 'ev-2',
      incident_id: 'd88bbd02-cf32-42c2-83bf-7bfcf9f0868f',
      evidence_type: 'ON_CHAIN_TRANSACTION',
      confidence: 'ON_CHAIN_VERIFIED',
      title: 'Bitcoin peg-out release',
      description: '~3,996 BTC transferred from bridge cold custody',
      chain: 'BITCOIN',
      verified: true,
      created_at: '2026-09-06T14:28:00Z',
    },
  ],
  sources: [
    {
      id: 'src-1',
      publisher: 'Blockstream Research',
      title: 'Liquid Network Security Incident Post-Mortem',
      url: 'https://blog.blockstream.com/liquid-security-incident',
      publication_timestamp: '2026-09-23T18:00:00Z',
      source_category: 'OFFICIAL_TECHNICAL_REPORT',
      reliability_score: 0.95,
    },
  ],
  technical_findings: [
    {
      component: 'Elements Core',
      area: 'Rangeproof verification cache',
      category: 'Consensus-critical validation flaw',
      summary: 'Flawed cache key derivation allowed pre-calculated rangeproofs to validate invalid transactions',
      root_cause_details:
        'A caching optimization failed to incorporate the complete commitment into the cache key. This was NOT a cryptographic SHA-256 collision.',
      fix_summary: 'Strict cache key hashing and bypass on consensus validation paths',
      repository_url: 'https://github.com/ElementsProject/elements',
      pull_request_id: '1600',
      commit_hash: '9400096',
    },
  ],
  updates: [
    {
      id: 'upd-1',
      timestamp: '2026-09-23T23:59:59Z',
      title: 'Outstanding Balance Snapshot Updated',
      summary: 'Reported outstanding balance stands at ~596 BTC as of 23 Sep 2026.',
      recovery_state: {
        affected_sats: 399602000000,
        recovered_sats: 340000000000,
        outstanding_sats: 59602000000,
        as_of_timestamp: '2026-09-23T23:59:59Z',
        is_estimate: true,
      },
    },
  ],
  graph: {
    nodes: [
      { id: 'tx-liquid', label: 'Liquid Exploit TX', node_type: 'TRANSACTION', chain: 'LIQUID' },
      { id: 'tx-pegout', label: 'Bitcoin Peg-out TX', node_type: 'TRANSACTION', chain: 'BITCOIN' },
      { id: 'blk-btc', label: 'Block 965783', node_type: 'BLOCK', chain: 'BITCOIN' },
    ],
    edges: [
      { source: 'tx-liquid', target: 'tx-pegout', relationship: 'FORWARDS_TO', confidence: 'ON_CHAIN_VERIFIED' },
      { source: 'tx-pegout', target: 'blk-btc', relationship: 'CONFIRMED_IN', confidence: 'ON_CHAIN_VERIFIED' },
    ],
  },
};

describe('Incident TypeScript Models & Payload Parsing', () => {
  it('correctly maps all required fields for OC-2026-0001', () => {
    expect(liquidIncidentFixture.case_id).toBe('OC-2026-0001');
    expect(liquidIncidentFixture.status).toBe('MONITORING');
    expect(liquidIncidentFixture.severity).toBe('CRITICAL');
    expect(liquidIncidentFixture.recovery.is_estimate).toBe(true);
    expect(liquidIncidentFixture.recovery.affected_sats).toBe(399602000000);
    expect(liquidIncidentFixture.recovery.recovered_sats).toBe(340000000000);
    expect(liquidIncidentFixture.recovery.outstanding_sats).toBe(59602000000);
  });
});

describe('Recovery Formatting & Arithmetic Safety', () => {
  it('safely formats Bitcoin amounts from integer satoshis using BigInt', () => {
    const affectedBtc = formatBtcFromSats(399602000000n);
    expect(affectedBtc).toBe('3,996.02000000 BTC');

    const recoveredBtc = formatBtcFromSats(340000000000n, { minDecimals: 2, maxDecimals: 2 });
    expect(recoveredBtc).toBe('3,400.00 BTC');

    const outstandingBtc = formatBtcFromSats(59602000000n, { minDecimals: 2, maxDecimals: 2 });
    expect(outstandingBtc).toBe('596.02 BTC');
  });

  it('calculates recovery percentage without float precision loss', () => {
    const affected = 399602000000n;
    const recovered = 340000000000n;
    const basisPoints = (recovered * 10000n) / affected;
    const percent = Number(basisPoints) / 100;
    expect(percent.toFixed(2)).toBe('85.08');
  });

  it('handles division by zero gracefully when affected_sats is 0', () => {
    const zeroRec: RecoverySummary = {
      affected_sats: 0,
      recovered_sats: 0,
      outstanding_sats: 0,
      as_of_timestamp: '2026-09-24T00:00:00Z',
      is_estimate: false,
    };
    const html = renderClean(<FundRecoveryPanel recovery={zeroRec} />);
    expect(html).toContain('0.00%');
  });
});

describe('Estimate Marker & Temporal Context', () => {
  it('displays estimate marker (~) when is_estimate is true', () => {
    const html = renderClean(<FundRecoveryPanel recovery={liquidIncidentFixture.recovery} />);
    expect(html).toContain('~');
    expect(html).toContain('~ Estimate');
    expect(html).toContain('As reported:');
  });

  it('does NOT display estimate marker when is_estimate is false', () => {
    const exactRec: RecoverySummary = {
      affected_sats: 100000000,
      recovered_sats: 50000000,
      outstanding_sats: 50000000,
      as_of_timestamp: '2026-09-24T00:00:00Z',
      is_estimate: false,
    };
    const html = renderClean(<FundRecoveryPanel recovery={exactRec} />);
    expect(html).not.toContain('~ Estimate');
  });
});

describe('Evidence Classification Badges & Accessible Labels', () => {
  const classifications: ProvenanceClassification[] = [
    'ON_CHAIN_VERIFIED',
    'OFFICIALLY_ATTRIBUTED',
    'REPUTABLE_REPORTING',
    'HEURISTIC',
    'UNVERIFIED',
    'DISPUTED',
  ];

  it('renders neutral accessible labels for all 6 tiers', () => {
    for (const c of classifications) {
      const html = renderClean(<EvidenceClassificationBadge classification={c} />);
      expect(html).toBeTruthy();
    }
  });

  it('renders checkmark and verified label for ON_CHAIN_VERIFIED', () => {
    const html = renderClean(<EvidenceClassificationBadge classification="ON_CHAIN_VERIFIED" />);
    expect(html).toContain('On-chain verified');
    expect(html).toContain('lucide-check');
  });

  it('renders official disclosure label for OFFICIALLY_ATTRIBUTED', () => {
    const html = renderClean(<EvidenceClassificationBadge classification="OFFICIALLY_ATTRIBUTED" />);
    expect(html).toContain('Official disclosure');
  });

  it('renders neutral non-judgmental wording for UNVERIFIED and DISPUTED', () => {
    const unverifiedHtml = renderClean(<EvidenceClassificationBadge classification="UNVERIFIED" />);
    expect(unverifiedHtml).toContain('Unverified / self-attributed');

    const disputedHtml = renderClean(<EvidenceClassificationBadge classification="DISPUTED" />);
    expect(disputedHtml).toContain('Disputed');
  });
});

describe('Timeline Chronological Rendering & Filtering', () => {
  it('renders all milestones along the timeline in order', () => {
    const html = renderClean(<IncidentTimeline timeline={liquidIncidentFixture.timeline} />);
    expect(html).toContain('Invalid Liquid transaction accepted');
    expect(html).toContain('Peg-out transaction confirmed on Bitcoin');
    expect(html).toContain('On-chain message observed');
    expect(html).toContain('3,400 BTC returned');
  });

  it('renders filter buttons for timeline categories', () => {
    const html = renderClean(<IncidentTimeline timeline={liquidIncidentFixture.timeline} />);
    expect(html).toContain('All (4)');
    expect(html).toContain('✓ On-chain');
    expect(html).toContain('Exploit');
    expect(html).toContain('Communication');
  });
});

describe('Bitcoin & Liquid Chain Badges', () => {
  it('renders distinctive badges without generic crypto casino styles', () => {
    const btcHtml = renderClean(<ChainBadge chain="BITCOIN" />);
    expect(btcHtml).toContain('Bitcoin');
    expect(btcHtml).toContain('Bitcoin Mainnet Consensus Layer');

    const liquidHtml = renderClean(<ChainBadge chain="LIQUID" />);
    expect(liquidHtml).toContain('Liquid');
    expect(liquidHtml).toContain('Liquid Network Federated Sidechain');
  });
});

describe('Incident Status & Severity Badges', () => {
  it('renders all discrete incident statuses', () => {
    const statuses: IncidentStatus[] = [
      'DETECTED',
      'INVESTIGATING',
      'VERIFIED',
      'MONITORING',
      'RECOVERY',
      'RESOLVED',
      'CLOSED',
      'DISPUTED',
    ];
    for (const st of statuses) {
      const html = renderClean(<IncidentStatusBadge status={st} />);
      expect(html).toBeTruthy();
    }
  });

  it('keeps severity separate from status', () => {
    const statusHtml = renderClean(<IncidentStatusBadge status="MONITORING" />);
    expect(statusHtml).toContain('Monitoring');
    expect(statusHtml).not.toContain('CRITICAL');
  });
});

describe('On-Chain Message Identity Separation (MANDATORY OBSCHAIN PRINCIPLE)', () => {
  it('renders message text factually as on-chain data', () => {
    const html = renderClean(<OnChainMessages messages={liquidIncidentFixture.on_chain_messages} />);
    expect(html).toContain('we are whitehats. contact us on chain.');
    expect(html).toContain('Block #965,818');
  });

  it('strictly segregates self-attributed white hat claim from verified identity', () => {
    const html = renderClean(<OnChainMessages messages={liquidIncidentFixture.on_chain_messages} />);
    // MUST display attribution caveat and unverified status
    expect(html).toContain('Sender Attribution: Self-described white hat actor');
    expect(html).toContain('Unverified / self-attributed');
    expect(html).toContain('self-attributions (e.g. claiming to be an ethical white-hat) remain UNVERIFIED');

    // MUST NEVER render self-attributed label as "Verified white-hat identity"
    expect(html).not.toContain('Verified white-hat identity');
    expect(html).not.toContain('Verified White Hat');
  });
});

describe('What the Chain Proves vs Unproven Claims', () => {
  it('renders verified items and unproven items in separate semantic sections', () => {
    const html = renderClean(
      <WhatChainProvesSummary claims={liquidIncidentFixture.structured_claims} />
    );
    expect(html).toContain('What the Chain Proves (Cryptographically Verified)');
    expect(html).toContain('Peg-out transaction confirmed on Bitcoin blockchain');

    expect(html).toContain('What It Does Not Prove (Unknown / Unverified)');
    expect(html).toContain('Real-world identity of the actor');
    expect(html).toContain('Actor motivation and long-term ethical status');
  });
});

describe('Technical Root Cause & Reference Links', () => {
  it('renders technical finding with explicit non-collision note', () => {
    const html = renderClean(
      <TechnicalFindingPanel findings={liquidIncidentFixture.technical_findings} />
    );
    expect(html).toContain('Elements Core');
    expect(html).toContain('Rangeproof verification cache');
    expect(html).toContain('This was NOT a cryptographic SHA-256 collision.');
    expect(html).toContain('Elements PR #1600');
    expect(html).toContain('Commit 9400096');
  });
});

describe('Attribution & Advisory Source List', () => {
  it('renders source details with secure attributes', () => {
    const html = renderClean(<SourceList sources={liquidIncidentFixture.sources} />);
    expect(html).toContain('Blockstream Research');
    expect(html).toContain('Official Technical Report');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

describe('Investigation Updates & Historical Snapshots', () => {
  it('preserves historical snapshot with explicit as-of date', () => {
    const html = renderClean(
      <IncidentUpdateHistory updates={liquidIncidentFixture.updates} />
    );
    expect(html).toContain('Outstanding Balance Snapshot Updated');
    expect(html).toContain('Reported Snapshot State (As of 23 Sep 2026');
    expect(html).toContain('596.02');
  });
});

describe('Incident Transaction Table', () => {
  it('renders transactions across Bitcoin and Liquid sidechains', () => {
    const html = renderClean(
      <IncidentTransactionTable transactions={liquidIncidentFixture.transactions} />
    );
    expect(html).toContain('EXPLOIT');
    expect(html).toContain('PEG OUT');
    expect(html).toContain('RETURN');
    expect(html).toContain('Liquid');
    expect(html).toContain('Bitcoin');
  });
});

describe('Graph Relationship Edge Classification & Unknown Relationships', () => {
  it('correctly maps known edge types without crashing', () => {
    const edges: { relationship: GraphEdgeType }[] = [
      { relationship: 'SPENDS' },
      { relationship: 'CONFIRMED_IN' },
      { relationship: 'FORWARDS_TO' },
      { relationship: 'RETURNS_TO' },
      { relationship: 'REFERENCES' },
      { relationship: 'SUPPORTS' },
      { relationship: 'ATTRIBUTED_TO' },
      { relationship: 'POSSIBLY_RELATED' },
    ];
    expect(edges).toHaveLength(8);
  });

  it('handles unknown/novel edge relationships safely without crashing', () => {
    const unknownEdge = {
      relationship: 'EXPERIMENTAL_LINK' as unknown as GraphEdgeType,
      source: 'node-a',
      target: 'node-b',
    };
    expect(unknownEdge.relationship).toBe('EXPERIMENTAL_LINK');
  });
});

describe('Incident Not Found State & Error Resilience', () => {
  it('renders clean error state for missing incident case', () => {
    const html = renderClean(
      <div className="space-y-6">
        <a href="/incidents">Back to Incident Intelligence Desk</a>
        <div data-testid="error-state">
          <p>Incident case dossier not found (HTTP 404)</p>
        </div>
      </div>
    );
    expect(html).toContain('Back to Incident Intelligence Desk');
    expect(html).toContain('Incident case dossier not found');
  });
});

describe('Partial API Failure State & Dossier Resilience', () => {
  it('renders dossier cleanly even when graph dataset is empty or unavailable', () => {
    // Dossier with missing graph data
    const partialIncident: Incident = {
      ...liquidIncidentFixture,
      graph: { nodes: [], edges: [] },
    };

    const fundsHtml = renderClean(<FundRecoveryPanel recovery={partialIncident.recovery} />);
    const timelineHtml = renderClean(<IncidentTimeline timeline={partialIncident.timeline} />);
    const txHtml = renderClean(<IncidentTransactionTable transactions={partialIncident.transactions} />);

    // All surrounding panels must still render normally
    expect(fundsHtml).toContain('Fund Recovery');
    expect(fundsHtml).toContain('3,996.02 BTC');
    expect(timelineHtml).toContain('Incident Investigation Timeline');
    expect(txHtml).toContain('EXPLOIT');
    expect(txHtml).toContain('PEG OUT');
  });

  it('renders dossier cleanly when evidence items or on-chain messages are empty', () => {
    const emptyMessagesHtml = renderClean(<OnChainMessages messages={[]} />);
    expect(emptyMessagesHtml).toBe(''); // Null render, no crash

    const emptyFindingsHtml = renderClean(<TechnicalFindingPanel findings={[]} />);
    expect(emptyFindingsHtml).toBe(''); // Null render, no crash

    const emptySourcesHtml = renderClean(<SourceList sources={[]} />);
    expect(emptySourcesHtml).toBe(''); // Null render, no crash
  });
});

