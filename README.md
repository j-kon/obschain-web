# ObsChain Web Frontend

[![CI](https://github.com/j-kon/obschain-web/actions/workflows/ci.yml/badge.svg)](https://github.com/j-kon/obschain-web/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> **Live Bitcoin network observation console and forensic incident intelligence dossier.**

Frontend Repository: https://github.com/j-kon/obschain-web  
Backend Repository: https://github.com/j-kon/obschain

---

## Overview

`obschain-web` is the sovereign web frontend for **ObsChain**, an open-source Bitcoin network observability and security intelligence engine.

The platform provides two distinct, specialized operational interfaces:
1. **Live Bitcoin Observation Console**: Real-time NOC-style monitoring of block creation, mempool dynamics, fee spikes, UTXO consolidations, dormant coin movements, and transaction replacements.
2. **Incident Intelligence Dossier Desk**: Forensic security investigation case files reconstructing real-world Bitcoin incidents from immutable on-chain evidence, attributed disclosures, and independent technical reports.

---

## Incident Intelligence UI (Phase 3B)

The Incident Desk (`/incidents`) and Incident Dossier (`/incidents/:id`) provide an exhaustive investigation environment for complex on-chain security incidents, beginning with **OC-2026-0001: Liquid Network Security Incident (September 2026)**.

### Epistemological Separation Principle

A core principle of ObsChain is strict epistemological separation. The UI strictly segregates:
- **What the blockchain proves**: Mathematically and cryptographically confirmed ledger state (transactions, blocks, amounts, OP_RETURN script payloads).
- **What official disclosures claim**: Statements and post-mortems from affected projects, maintainers, or federations.
- **What is analytical / heuristic**: Probabilistic clustering, co-spend heuristics, and behavioral hypotheses.
- **What remains unknown / unverified**: Actor identity, internal motivation, and uncorroborated counterparty claims.

Self-attributed labels (such as an exploit actor claiming to be an ethical "white hat" in an OP_RETURN message) are **never promoted to factual identity**.

---

## Incident Dossier Structure (`/incidents/:id`)

Each case dossier (e.g. `/incidents/OC-2026-0001`) contains a comprehensive suite of forensic sections:

```text
┌────────────────────────────────────────────────────────────┐
│ ObsChain Incident Dossier: OC-2026-0001                     │
│ Liquid Network Security Incident                           │
│ CRITICAL (Severity)           MONITORING (Status)          │
├────────────────────────────────────────────────────────────┤
│  Affected             Recovered       Outstanding   Recovery│
│  ~3,996.02 BTC        3,400.00 BTC    ~596.02 BTC   85.08%  │
├────────────────────────────────────────────────────────────┤
│ [Sticky Navigation]: Overview | Funds | Chain Proofs |     │
│ Timeline | Flow Graph | Transactions | Messages |          │
│ Root Cause | Sources | Updates | Raw JSON                  │
└────────────────────────────────────────────────────────────┘
```

1. **Case Header**: Prominent Case ID, incident title, discrete status badge (`MONITORING`), severity badge (`CRITICAL`), first observed date, and last updated date. Includes one-click copy actions with subtle confirmation.
2. **Fund Recovery Panel**: Integer satoshi calculations formatted using `BigInt`. Estimated values are visually marked with `~` and `~ Estimate` / `~ Snapshot` tags to ensure probabilistic figures are never conflated with exact blockchain balances.
3. **What the Chain Proves vs. Unproven Claims**: Clear side-by-side comparison of immutable cryptographic proofs versus unverified claims.
4. **Chronological Milestone Timeline**: Interactive vertical timeline of all investigation milestones with client-side category filters (`All`, `✓ On-chain`, `Exploit`, `Communication`, `Recovery`, etc.). Links directly to relevant Bitcoin and Liquid block explorers.
5. **Interactive Transaction Flow Graph (`@xyflow/react`)**: Interactive node-and-edge visualization of fund movements and entity relationships:
   - **Solid Edges (`#10b981`)**: Verified structural on-chain relationships (`CONFIRMED_IN`, `SPENDS`, `FORWARDS_TO`, `RETURNS_TO`).
   - **Dashed Edges (`#38bdf8`)**: Attributed disclosures and documentation (`ATTRIBUTED_TO`, `SUPPORTS`, `REFERENCES`).
   - **Dotted Edges (`#f59e0b`)**: Heuristic or possible links (`POSSIBLY_RELATED`).
   - **Inspector Drawer**: Click any node to open metadata details, block explorer links, and classification proofs.
6. **Incident Transaction Table**: Full transaction breakdown with role badges (`EXPLOIT`, `PEG_OUT`, `RETURN`), sidechain badges (`Bitcoin` vs `Liquid`), confirmed blocks, timestamps, and satoshi amounts.
7. **On-Chain Communication Log**: Verbatim inspection of OP_RETURN script payloads. The presence of the message is verified on-chain, but the sender attribution explicitly carries an unverified caveat.
8. **Tripartite Certainty Breakdown**: Categorization across all 6 evidence tiers:
   - `ON_CHAIN_VERIFIED` (`✓ On-chain verified`)
   - `OFFICIALLY_ATTRIBUTED` (`Official disclosure`)
   - `REPUTABLE_REPORTING` (`Independent reporting`)
   - `HEURISTIC` (`Heuristic`)
   - `UNVERIFIED` (`Unverified / self-attributed`)
   - `DISPUTED` (`Disputed`)
9. **Technical Root Cause & Remediation**: In-depth software audit details, including the critical technical distinction (*"This was NOT a cryptographic SHA-256 collision"*), with direct links to upstream pull requests (Elements PR #1600) and commits.
10. **Attribution & Advisory Sources**: Canonical publisher references, reliability ratings, publication dates, and secure external links (`rel="noopener noreferrer"`).
11. **Investigation Updates & Historical Snapshots**: Append-only log of case updates with preserved historical balances and exact as-of timestamps.
12. **Raw Dossier Viewer (JSON)**: Collapsible pretty-printed JSON viewer for researchers and developers.

---

## Backend API Endpoints Consumed

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/incidents` | `GET` | Paginated incident list with recovery summaries and case IDs. |
| `/api/v1/incidents/:id` | `GET` | Full incident dossier by Case ID (`OC-2026-0001`) or UUID. |
| `/api/v1/incidents/:id/timeline` | `GET` | Chronological investigation milestones with evidence links. |
| `/api/v1/incidents/:id/evidence` | `GET` | Structured evidence records and provenance ratings. |
| `/api/v1/incidents/:id/graph` | `GET` | Forensic relationship graph nodes and edges. |
| `/api/v1/events` | `GET` | Live Bitcoin detector events stream. |
| `/api/v1/status` | `GET` | Pipeline health, tip height, and detector telemetry. |
| `/api/v1/events/ws` | `WS` | Real-time WebSocket event broadcast. |

---

## Supported On-Chain Event Types

| Event Type | Visual Treatment | Primary Metrics & Forensics |
| :--- | :--- | :--- |
| **Dormant Coins Moved** | Archive / Clock (Amber) | Exact BTC moved, oldest input age (e.g. `13y 8m`), dormant inputs count, coin age destroyed (`BTC-years`), classification (`Very Old`, `Ancient`, etc.). |
| **UTXO Consolidation** | Merge Nodes (Sky) | Input count, output count, input/output compression ratio (e.g. `62:1`), total consolidated BTC, transaction fee. |
| **Fan-Out Distribution** | Branching Nodes (Purple) | Input count, output count, branching ratio, total distributed BTC, median output value. |
| **Extreme Transaction Fee** | Flame (Red) | Absolute fee (BTC and sats), fee rate in sat/vB, trigger reason (`High Fee Rate`, `High Absolute Fee`, or `Both`). |
| **Transaction Replacement (RBF)** | Replacement Arrows (Indigo) | Replaced transaction count, old fee, new fee, fee delta (+sats), and percentage fee increase (+%). |
| **Large Value Transfer** | High Value Vector (Emerald) | Total transferred BTC, fee, fee rate (sat/vB), input and output counts. |
| **Extended Block Interval** | Delayed Timer (Amber) | Block interval in minutes, delay deviation above 10-minute target, preceding block hash anchor. |

---

## Architecture

```text
src/
├── api/
│   ├── client.ts             # Fetch wrapper with timeout & normalized ApiError
│   ├── events.ts             # /api/v1/events REST endpoints
│   ├── status.ts             # /api/v1/status & /health REST endpoints
│   ├── incidents.ts          # /api/v1/incidents (dossier, timeline, evidence, graph)
│   ├── websocket.ts          # WebSocket client with bounded exponential backoff
│   └── index.ts              # Central API export
├── context/
│   └── EventContext.tsx      # Central live event state, deduplication, 500-cap retention
├── components/
│   ├── incidents/            # Dedicated Incident Intelligence Dossier Components
│   │   ├── ChainBadge.tsx              # Bitcoin vs Liquid sidechain badges
│   │   ├── IncidentStatusBadge.tsx     # Discrete lifecycle state badge
│   │   ├── EvidenceClassificationBadge.tsx # 6-tier provenance badge with tooltips
│   │   ├── FundRecoveryPanel.tsx       # Safe satoshi math, estimate indicators
│   │   ├── WhatChainProvesSummary.tsx  # Cryptographic truth vs unproven claims
│   │   ├── EvidenceCertaintyPanel.tsx  # Tripartite certainty breakdown
│   │   ├── IncidentTimeline.tsx        # Milestone timeline with category filter
│   │   ├── IncidentGraphView.tsx       # Interactive @xyflow/react graph with inspector
│   │   ├── IncidentTransactionTable.tsx # Cross-chain transaction table
│   │   ├── OnChainMessages.tsx         # OP_RETURN message decoder & attribution caveat
│   │   ├── TechnicalFindingPanel.tsx   # Root cause, SHA-256 non-collision note, PR links
│   │   ├── SourceList.tsx              # Provenance & advisory sources
│   │   ├── IncidentUpdateHistory.tsx   # Historical recovery snapshots
│   │   └── RawDossierView.tsx          # Collapsible JSON viewer
│   ├── events/               # Detector event cards
│   ├── IncidentCard.tsx      # Incident desk summary card with recovery meter
│   └── SeverityBadge.tsx     # Normalized severity indicator
├── utils/
│   ├── formatters.ts         # Safe integer satoshi math, exact BTC formatting, age, timestamps
│   └── explorer.ts           # Multi-chain block explorer URL builder (Bitcoin & Liquid)
└── pages/
    ├── HomePage.tsx          # Live Bitcoin Observation Console
    ├── EventsPage.tsx        # Event feed monitoring
    ├── EventDetailPage.tsx   # Single event observation detail
    ├── IncidentsPage.tsx     # Incident Intelligence Desk (/incidents)
    ├── IncidentDetailPage.tsx # Incident Dossier Primary View (/incidents/:id)
    └── AboutPage.tsx         # Sovereign provenance principles
```

---

## Monetary Precision & Financial Safety

- All Bitcoin values originate from integer satoshi quantities (`BigInt`).
- Conversion to BTC never utilizes floating-point division (`sats / 100_000_000`), using exact string padding instead.
- Recovery percentage calculations calculate basis points (`(recovered * 10000n) / affected`) before safe decimal formatting.
- Estimated amounts are explicitly flagged with `~` and `~ Estimate` markers so users never mistake heuristic snapshots for settled balances.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- (Optional) Running ObsChain backend (`http://localhost:8080`)

### Setup

```bash
# Clone the frontend repository
git clone https://github.com/j-kon/obschain-web.git
cd obschain-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The web dashboard will be available at `http://localhost:3000`.

### Running with the Backend

In a separate terminal, launch the ObsChain backend:

```bash
cd ../obschain
OBSCHAIN_MOCK_FEED=true OBSCHAIN_PORT=8080 cargo run
```

Then visit:
- **Incident Intelligence Desk**: `http://localhost:3000/incidents`
- **Liquid Incident Dossier**: `http://localhost:3000/incidents/OC-2026-0001`

---

## Quality & Verification Commands

```bash
# Run unit tests (53 tests covering parsing, arithmetic, provenance, graph)
npm test

# Run ESLint check
npm run lint

# Build production bundle (TypeScript compilation + Vite build)
npm run build

# Run security audit (0 vulnerabilities)
npm audit
```

---

## Security Principles

- **No Dangerous HTML**: No use of `dangerouslySetInnerHTML`.
- **Sanitized Outbound Links**: All external links enforce `target="_blank"` and `rel="noopener noreferrer"`.
- **Data Resilience**: Graceful fallbacks for partial backend failures (e.g. graph unavailable while dossier remains fully readable).
- **Epistemological Neutrality**: Self-reported claims from actors are never promoted to verified blockchain facts.

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
