# 02 — Technical Requirements Document (TRD)

Status: 🟢 ACTIVE

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript | Production-grade, recruiter-approved, fastest way to a stunning SPA |
| UI | Tailwind CSS + custom primitives + CSS animations (Archivo + IBM Plex Mono) | Instrument-panel design system: warm graphite + single signal accent, no component library |
| Workflow canvas | React Flow (xyflow) | Industry-standard node-graph builder |
| Charts | Recharts | Lightweight analytics |
| Real-time | Socket.IO (client) | Live agent telemetry |
| Backend | Node.js + Express + Socket.IO + TypeScript | Battle-tested real-time orchestration server |
| ORM/DB | Prisma + SQLite (dev/zero-config) | Prisma migrations + zero external DB for instant demo |
| AI | Groq SDK (qwen/qwen3.8-27b) + pluggable providers | Fast, FREE inference |
| Auth | Session-based (demo mode: instant guest) + optional NextAuth | Demo must be frictionless |
| Hosting/Infra | Localhost via concurrently; Vercel-ready frontend + Railway-ready backend | Demo-first, deployable |
| CI/CD | GitHub Actions workflow (lint + typecheck + build) | Shows engineering discipline |

## Non-Functional Requirements

- **Performance:** API response p95 < 500ms (excluding Groq stream); Socket.IO event < 50ms; UI interactive under 2s cold start.
- **Scalability:** 1 launch = 1 orchestrator session; design for many concurrent missions (session map, not global state). Socket.IO handles 100+ sockets locally.
- **Availability:** 99% target for demo sessions; crashed orchestrator auto-recovers mission state from SQLite on restart.
- **Offline support:** Simulation mode uses deterministic pseudo-random agent behavior — zero network needed.
- **Accessibility:** WCAG AA for text contrast; keyboard-navigable panels; aria-labels on interactive controls.
- **Internationalization:** English UI only (i18n-ready structure).
- **Browser/OS support:** Chrome 110+, Firefox 110+, Edge 110+; Windows dev environment.

## Third-Party Dependencies

| Dependency | Purpose | License | Cost | Alternative if it fails |
|---|---|---|---|---|
| @groq/groq-sdk | LLM inference | Apache-2.0 | Free | Simulation engine (built-in fallback) |
| socket.io / socket.io-client | Real-time events | MIT | Free | SSE or WebSocket polyfill |
| reactflow (React Flow) | Node-graph workflow builder | MIT | Free | Hand-rolled SVG graph |
| framer-motion | UI animations | MIT | Free | CSS transitions (not installed — CSS keyframes used) |
| recharts | Charts | MIT | Free | Custom SVG charts |
| next / react | Framework | MIT | Free | Vite SPA + API server |
| express | HTTP API | MIT | Free | Fastify / plain node http |
| prisma | ORM + migrations | Apache-2.0 | Free | better-sqlite3 raw SQL |
| zod | Validation | MIT | Free | Manual validation |

## Environments

- **Local/dev:** `npm run dev` at root → runs backend (:8080) + frontend (:3000) via concurrently.
- **Staging:** GitHub Actions on `main` runs lint/typecheck/build (deploy target placeholder).
- **Production:** Frontend → Vercel; Backend → Railway/Render. (Documented, not required for demo.)

## Versioning & Release Strategy

- Semantic versioning: yes (`x.y.z`).
- Release cadence: milestone-based.
- Rollback strategy: git tag + restore previous build artifact.

## Technical Constraints

- Must run entirely on localhost with zero paid services (demo-critical).
- SQLite so a recruiter can demo without installing PostgreSQL.
- Must work without an API key (simulation mode) AND with one (real AI).
- TypeScript strict mode across the codebase.