# 02 — Technical Requirements Document (TRD)

Status: 🟢 ACTIVE

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript | Production-grade, recruiter-approved, fastest way to a stunning SPA |
| UI | Tailwind CSS + custom primitives + CSS animations (Archivo + IBM Plex Mono) | Instrument-panel design system: warm graphite + single signal accent, no component library |
| Workflow canvas | React Flow (xyflow) | Industry-standard node-graph builder |
| Charts | Hand-rolled SVG | No chart dependency; flat schematics match the design system |
| Real-time | Polling `GET /api/missions/:id` (~900 ms) | No socket server — deploys cleanly to serverless |
| Backend | Node.js + Express + TypeScript | Single Express app, served as a long-lived process locally or a Vercel function in prod |
| Persistence | JSON document `MissionStore`: filesystem (dev) / Vercel Blob (prod) | Zero DB to provision; one abstraction, two backends |
| AI | Groq SDK (qwen/qwen3.8-27b) + pluggable providers | Fast, FREE inference |
| Auth | None (open demo) | Demo must be frictionless |
| Hosting/Infra | Vercel (frontend + API function + Blob); localhost via concurrently | Two CLI/zero-config deploys, no servers to babysit |
| CI/CD | GitHub Actions workflow (lint + typecheck + build) | Shows engineering discipline |

## Non-Functional Requirements

- **Performance:** read endpoints p95 < 500ms; a mission completes inside a bounded budget (`MISSION_BUDGET_MS`, default 45s) with per-request LLM timeouts (15s).
- **Scalability:** 1 launch = 1 in-memory orchestrator session; clients poll instead of holding a connection, so serverless instances stay stateless between requests.
- **Availability:** production runs on Vercel with mission documents in Blob; a failed invocation never leaves a client stuck (poll surfaces `failed`).
- **Offline support:** Simulation mode uses deterministic pseudo-random agent behavior — zero network needed.
- **Accessibility:** WCAG AA for text contrast; keyboard-navigable panels; aria-labels on interactive controls.
- **Internationalization:** English UI only (i18n-ready structure).
- **Browser/OS support:** Chrome 110+, Firefox 110+, Edge 110+; Windows dev environment.

## Third-Party Dependencies

| Dependency | Purpose | License | Cost | Alternative if it fails |
|---|---|---|---|---|
| @groq/groq-sdk | LLM inference | Apache-2.0 | Free | Simulation engine (built-in fallback) |
| reactflow (React Flow) | Node-graph workflow builder | MIT | Free | Hand-rolled SVG graph |
| @vercel/blob | Production mission store | Apache-2.0 | Free tier | Filesystem store (already the dev backend) |
| @vercel/functions | `waitUntil` background handoff | Apache-2.0 | Free | Fire-and-forget promise |
| next / react | Framework | MIT | Free | Vite SPA + API server |
| express | HTTP API | MIT | Free | Fastify / plain node http |
| zod | Validation | MIT | Free | Manual validation |

## Environments

- **Local/dev:** `npm run dev` at root → runs backend (:8080) + frontend (:3000) via concurrently.
- **Staging:** GitHub Actions on `main` runs lint/typecheck/build (deploy target placeholder).
- **Production:** Vercel — a `swarm-web` Next.js project and a `swarm-api` function
  project (`backend/`, built from `src/serverless.ts`) with a Vercel Blob store attached.

## Versioning & Release Strategy

- Semantic versioning: yes (`x.y.z`).
- Release cadence: milestone-based.
- Rollback strategy: git tag + restore previous build artifact.

## Technical Constraints

- Must run entirely on localhost with zero paid services (demo-critical).
- SQLite so a recruiter can demo without installing PostgreSQL.
- Must work without an API key (simulation mode) AND with one (real AI).
- TypeScript strict mode across the codebase.