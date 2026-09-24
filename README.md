# ObsChain Web Frontend

[![CI](https://github.com/j-kon/obschain-web/actions/workflows/ci.yml/badge.svg)](https://github.com/j-kon/obschain-web/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> **Web interface for ObsChain Bitcoin network observation and incident intelligence.**

Backend: https://github.com/j-kon/obschain

---

## Overview

`obschain-web` provides a dedicated, high-performance, dark technical interface for observing Bitcoin network anomalies, mempool dynamics, and tracking incident cases.

Designed as sovereign security infrastructure rather than a trading interface, it rigorously distinguishes between on-chain cryptographic facts and heuristic claims.

---

## Architecture & Visual Direction

- **Stack**: React 18, TypeScript, Vite, Tailwind CSS.
- **Visual Design**: Dark technical interface for Bitcoin infrastructure, network observability, and research intelligence.
- **Zero Monorepo Entanglement**: Completely independent from the Rust backend repository.
- **Resilient Fallback**: Communicates with the ObsChain backend over REST API (`VITE_OBSCHAIN_API_URL`), gracefully degrading to simulated telemetry if the node is offline.

---

## Routes

- `/` - Overview, network telemetry, mempool activity, latest events, and active incidents
- `/events` - Realtime chain event observation feed with search and severity filters
- `/events/:id` - Detailed event breakdown with raw observation payloads and block/tx links
- `/incidents` - Comprehensive case dossiers of major Bitcoin incidents and exploits
- `/incidents/:id` - Forensic incident case file featuring the tripartite separation of facts, reports, and claims
- `/about` - ObsChain provenance methodology and engineering architecture

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/j-kon/obschain-web.git
cd obschain-web

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run local development server
npm run dev
```

The application will start on `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

---

## Verification & Quality

```bash
npm run lint
npm run build
npm audit
```

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
