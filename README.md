# ObsChain Web Frontend

[![CI](https://github.com/j-kon/obschain-web/actions/workflows/ci.yml/badge.svg)](https://github.com/j-kon/obschain-web/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> **Live Bitcoin network observation console and incident intelligence dashboard.**

Backend Repository: https://github.com/j-kon/obschain

---

## Overview

`obschain-web` is the sovereign web frontend for **ObsChain**, an open-source Bitcoin network observability and security intelligence engine.

Designed like a mission-critical Network Operations Center (NOC) and distributed systems monitoring console, it consumes real-time Bitcoin block and mempool events directly from the ObsChain Rust backend via REST and live WebSocket streams.

---

## Live Data vs. Mock Development Fixtures

ObsChain maintains an honest representation of operational reality:

- **Live Bitcoin Data**: When connected to an active ObsChain backend (`● LIVE`), the console displays real Bitcoin mainnet observations, live mempool transactions, actual dormant coin spends, UTXO consolidations, fee spikes, and block intervals.
- **Backend Offline / Disconnected**: If the backend is unreachable or offline (`○ OFFLINE`), the application displays an honest offline state with actionable instructions. It **never** silently fabricates fake production numbers or simulated block heights.
- **Incident Cases**: Security incident dossiers require strict verification before publishing. If no active incidents are open, the interface clearly states `No active ObsChain incidents` rather than inventing speculative events.

---

## Supported On-Chain Event Types

The frontend provides specialized visual identity and dedicated metrics cards for all 7 ObsChain detector event types:

| Event Type | Visual Treatment | Primary Metrics & Forensics |
| :--- | :--- | :--- |
| **Dormant Coins Moved** | Archive / Clock (Amber) | Exact BTC moved, oldest input age (e.g. `13y 8m`), dormant inputs count, coin age destroyed (`BTC-years`), classification (`Very Old`, `Ancient`, etc.). |
| **UTXO Consolidation** | Merge Nodes (Sky) | Input count, output count, input/output compression ratio (e.g. `62:1`), total consolidated BTC, transaction fee. |
| **Fan-Out Distribution** | Branching Nodes (Purple) | Input count, output count, branching ratio, total distributed BTC, median output value. |
| **Extreme Transaction Fee** | Flame (Red) | Absolute fee (BTC and sats), fee rate in sat/vB, trigger reason (`High Fee Rate`, `High Absolute Fee`, or `Both`). |
| **Transaction Replacement (RBF)** | Replacement Arrows (Indigo) | Replaced transaction count, old fee, new fee, fee delta (+sats), and percentage fee increase (+%). Neutral terminology maintained. |
| **Large Value Transfer** | High Value Vector (Emerald) | Total transferred BTC, fee, fee rate (sat/vB), input and output counts. |
| **Extended Block Interval** | Delayed Timer (Amber) | Block interval in minutes, delay deviation above 10-minute target, preceding block hash anchor. |

---

## Architecture

```text
src/
├── api/
│   ├── client.ts         # Robust fetch wrapper with timeout & normalized ApiError
│   ├── events.ts         # /api/v1/events REST endpoints
│   ├── status.ts         # /api/v1/status & /health REST endpoints
│   ├── incidents.ts      # /api/v1/incidents REST endpoints
│   ├── websocket.ts      # WebSocket client with bounded exponential backoff
│   └── index.ts          # Central API namespace export
├── context/
│   └── EventContext.tsx  # Central live event state, deduplication, 500-cap retention
├── components/
│   ├── events/           # Specialized cards for each of the 7 detector event types
│   ├── EventCard.tsx     # Polymorphic event card with micro-animations & provenance
│   ├── EventFeed.tsx     # Filterable live feed (categories, severities, time, search)
│   ├── LiveIndicator.tsx # ● LIVE / ◌ CONNECTING / ↻ RECONNECTING / ○ OFFLINE badge
│   ├── NetworkStatusCard.tsx # Detailed telemetry, tip height, detectors, uptime
│   ├── SourceBadge.tsx   # Evidence provenance (mempool REST/WS, Bitcoin Core RPC/ZMQ)
│   ├── TransactionLink.tsx # Copyable TXID with centralized explorer resolution
│   └── BlockLink.tsx     # Copyable block anchor with centralized explorer resolution
├── utils/
│   ├── formatters.ts     # Safe integer satoshi math, exact BTC formatting, age, timestamps
│   └── explorer.ts       # Centralized block explorer URL builders
└── pages/
    ├── HomePage.tsx      # Main Live Bitcoin Observation Dashboard
    ├── EventsPage.tsx    # Live events monitoring console with advanced filters
    ├── EventDetailPage.tsx # In-depth forensic observation dossier with raw payload inspection
    ├── IncidentsPage.tsx # Incident cases archive
    └── AboutPage.tsx     # ObsChain sovereign provenance principles
```

### WebSocket & Live Connection Lifecycle

- **Automatic URL Derivation**: Converts `http://` to `ws://` and `https://` to `wss://` dynamically based on `VITE_OBSCHAIN_API_URL`.
- **Bounded Exponential Backoff**: Reconnect delays scale from 1s to 15s with 15% random jitter to avoid thundering-herd reconnect storms.
- **Connection States**:
  - `● LIVE`: Connected and actively receiving raw `ChainEvent` objects.
  - `◌ CONNECTING`: Initializing handshake.
  - `↻ RECONNECTING`: Lost connection, attempting backoff reconnection.
  - `○ OFFLINE`: Backend unreachable or intentionally disconnected.
- **Deduplication & Bounded Retention**: Events are deduplicated by UUID and sorted newest-first. The in-memory feed is capped at 500 events to prevent browser memory bloat.
- **Scroll Pinning**: If the user scrolls down to investigate an event, new incoming events do not forcibly jump the viewport; a floating pill (`X new events observed`) notifies the user and allows smooth jump to the top.

---

## Monetary Precision & Formatting

In Bitcoin analysis, floating-point rounding errors are unacceptable. ObsChain formats all monetary figures safely:
- All calculations originate from integer satoshi values.
- Satoshi-to-BTC conversion is calculated via BigInt arithmetic and string padding to prevent IEEE-754 precision artifacts.
- Exact UTC timestamps accompany all relative time displays for forensic precision.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- (Optional for live data) Running ObsChain backend (`http://localhost:8080`)

### Setup

```bash
# Clone the frontend repository
git clone https://github.com/j-kon/obschain-web.git
cd obschain-web

# Install dependencies
npm install

# Configure backend endpoint (default: http://localhost:8080)
cp .env.example .env

# Start development server
npm run dev
```

The web dashboard will be available at `http://localhost:3000`.

### Running with the Backend

In a separate terminal, launch the ObsChain backend:

```bash
cd ../obschain
cargo run
```

The frontend will automatically detect the backend, transition to `● LIVE`, and display live Bitcoin network observations.

---

## Development & Verification Commands

```bash
# Run unit tests (Vitest)
npm test

# Run ESLint check
npm run lint

# Build production bundle (TypeScript check + Vite)
npm run build

# Security audit
npm audit
```

---

## Security Principles

- **No Unsafe HTML**: Strict avoidance of `dangerouslySetInnerHTML`.
- **External Links**: All external explorer links include `rel="noopener noreferrer"`.
- **Input Sanitization**: Untrusted API payloads and search queries are properly sanitized.

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
