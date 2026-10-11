# 17 — Decisions Log (ADRs)

Status: 🟢 LIVE

## [D-001] Chose Groq (free) over OpenAI/Anthropic for v1 inference
- Date: 2026-09-13
- Status: Accepted
- Context: Demo must run at ₹0 cost; multi-agent missions need many LLM calls.
- Options:
  1. Groq free tier (llama-3.3-70b) — zero cost, very fast streaming, 30 req/min adequate. Limited to Groq models.
  2. OpenAI — better models but paid; no free tier that sustains deep demos.
  3. Anthropic — same cost concern.
- Decision: Groq primary, Simulation fallback, provider interface open to others.
- Consequences: cheap+fast; model choice constrained; faster demos.

## [D-002] Chose SQLite over PostgreSQL for the demo
- Date: 2026-09-13
- Status: Superseded by D-006 (moved to a JSON document store)
- Context: Recruiters must run this with zero infrastructure. Postgres = Docker/install friction.
- Options:
  1. SQLite (Prisma `file:./dev.db`) — zero setup, one file, perfect for demos.
  2. PostgreSQL — production-grade but requires service/Docker.
- Decision: SQLite locally; Prisma schema ports to Postgres with a URL change.
- Consequences: instant demos; trivial production swap later.

## [D-003] Built a deterministic Simulation engine with auto-fallback
- Date: 2026-09-13
- Status: Accepted
- Context: Demo must never depend on network/keys/rate limits; also gives a beautiful offline story.
- Decision: `LlmProvider` interface; `getProvider()` returns Groq when key valid, else Simulation. Provider also falls back mid-mission on repeated failures.
- Consequences: always-demoable; real AI when key present; adds a provider abstraction worth showing.

## [D-004] Single-page dashboard with Socket.IO event model (no polling)
- Date: 2026-09-13
- Status: Superseded by D-006 (removed sockets in favour of polling)
- Context: "Watch them think live" is the wow factor; polling is boring and slower.
- Decision: Express + Socket.IO server broadcasting typed events; frontend Zustand store updates from socket only.
- Consequences: real-time UX; slightly more complex state code — worth it.

## [D-005] TypeScript strict across the monorepo
- Date: 2026-09-13
- Status: Accepted
- Context: Recruiters judge code quality; strict types prove it.
- Decision: strict: true in both packages, shared hand-mirrored types.
- Consequences: fewer runtime bugs; slightly more ceremony.

## [D-006] Ported to a serverless deployment: polling + Blob store
- Date: 2026-10-12
- Status: Accepted (supersedes D-002 and D-004)
- Context: The app had to be deployed **permanently** on free, already-authenticated
  infrastructure (Vercel). A long-lived Socket.IO server and a Prisma/SQLite database
  do not survive a serverless runtime: functions are ephemeral and have no shared disk.
- Options:
  1. Keep sockets + SQLite on a PaaS — rejected: free PaaS trials expire (the user
     explicitly needed an all-time deploy, not a 30-day window).
  2. Move to serverless: background mission run (`waitUntil`) + JSON document store
     (filesystem in dev, Vercel Blob in prod) + client polling.
- Decision: Option 2. Rewrote the store behind a `MissionStore` interface (File /
  Blob backends selected by env), dropped Socket.IO entirely, and rewrote the
  frontend session store to poll `GET /api/missions/:id`. Bounded every LLM call
  (15s) and the whole mission (`MISSION_BUDGET_MS`, 45s) so runs finish inside the
  function cap.
- Consequences: two zero-config Vercel deploys with no server to babysit; the UI is
  900 ms-behind instead of push (imperceptible for agent turns that take ~0.5–1s);
  no DB to provision or migrate.

## Open Questions Awaiting a Decision

- Real web-search tool for Researcher agent? Currently simulated. (Proposed → future)