# 16 — Changelog

Status: 🟢 LIVE — Keep a Changelog style. Newest on top.

## [0.4.1] - 2026-09-13

### Fixed
- Critic graph edges were silently dropped: edge labels omitted the `risk: ` prefix
  used by node labels, so exact-label matching in `persistAndEmitGraph` found nothing.
  Edges now reuse the prefixed labels, so the critic tier emits its `compounds` edges.
- Run-library replay: opening a completed mission stayed stuck on `connecting` because the
  socket store never received the initial status. `connect()` now seeds agents/messages/graph/
  report/analytics from the detail payload, so replays render fully without live events.
- `complete()` queries messages with `orderBy: { seq: 'asc' }` instead of relying on DB default order.
- `GET /missions?limit=N` now honours the query param (clamped 1–100, default 50).

### Added
- In-memory per-IP sliding-window rate limiter on `POST /api/missions` (12/60s → HTTP 429).
- `log` socket event (server console mirror) emitted on mission started/complete/failed, matching the API contract (`{ level, message, ts, ...meta }`).
- Landing / builder CTA keys: signal glow + press depth + deploying spinner (`animate-spin`).
- Launcher patch-row inactive states raised to `--ink` titles + `--line-strong` borders, active row gets a signal ring glow.

### Docs
- T-009 marked DONE (Workflow Builder shipped and E2E-verified, was DEFERRED).
- TRD/README updated to the real stack (Archivo + IBM Plex Mono, custom primitives, CSS
  animations; `qwen/qwen3.8-27b`), API contract rate limit + `log` event reconciled.

## [0.4.0] - 2026-09-13

### Added
- README (architecture diagram, quick start, API contract, design notes) (T-011)
- CI workflow: backend (typecheck + tests + build) and frontend (typecheck + build) (T-011)

### Changed
- Bar telemetry animates `transform: scaleX` instead of `width` (fixes the single
  impeccable detector hit — layout-transition/thrash)
- backend `tsconfig.build.json` emits CommonJS so `npm start` runs `dist/server.js`
- Impeccable QA pass: **0 anti-patterns** across frontend/src

---
## [0.3.0] - 2026-09-13

### Added
- Frontend complete and verified (T-006, T-007, T-008, T-010)
  - Next.js 14 App Router + Tailwind design system (OKLCH ink-navy + phosphor-cyan accent, Tomorrow/IBM Plex Sans/IBM Plex Mono)
  - Workbench-style landing with live mission launcher (template cards, subject → prompt fill, custom brief)
  - Live Mission Dashboard: agent orbit + status strip, reasoning stream with real-time chunk rendering, elapsed telemetry, radial knowledge graph, mission report w/ findings + risks + est. cost
  - Run Library with polling status, delete, deep-link to detail
  - Socket.IO client store (Zustand) — verified live: agent:update / agent:chunk / agent:message / graph:update / mission:complete
- Production build verified: `node dist/server.js` (backend CJS build) + `next start` (frontend), rewrites proxy /api → :8080
- End-to-end via proxy: deep_research mission complete → 8 msgs, 8 graph nodes, report verdict from Groq

### Changed
- Backend prod build now emits CommonJS (`tsconfig.build.json`) so `npm start` actually runs dist/server.js
- Microtasks: T-009 workflow builder deferred (MVP ships launcher + baked-in agent orders; REST `config.agents` override ready for a future canvas)

---
## [0.2.0] - 2026-09-13

### Added
- Backend fully built and verified live end-to-end (T-002→T-005 DONE)
  - REST: health, templates, agents, missions CRUD (zod-validated launch)
  - Socket.IO: mission:created / agent:update / agent:message / agent:chunk / graph:update / mission:complete / mission:failed
  - Orchestrator state machine + template registry + pendingWrites flush (no lost persistence)
  - sharedFindings propagation across swarm lanes (research → critique → analysis → verdict)
  - vitest unit suite (7/7 green), typecheck clean
- Live Groq smoke test passed: product_review + startup_validation missions produced report + knowledge graph

### Changed
- Groq model: llama-3.3-70b-versatile → qwen/qwen3.8-27b (llama-3.3 was deprecated on this account; model list verified via API)
- prisma/seed.ts: fixed FK violation (dummy `roster` Mission host), dropped non-existent `blurb` field

---
## [0.1.0] - 2026-09-13

### Added
- Initial scaffold and `brain/` documentation set.
- Monorepo root package.json (concurrently), .gitignore.
- Backend scaffold: Express + Socket.IO + Prisma/SQLite.
- LLM provider layer: Groq + deterministic Simulation + auto-fallback.