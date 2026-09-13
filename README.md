# SWARM

**Deploy a swarm. Watch it think.**

SWARM is a mission-control workbench for coordinating AI agent swarms. Four specialist
agents — **Kai** (researcher), **Lyra** (analyst), **Vex** (critic), and **Nova**
(synthesizer) — take turns reasoning about a mission brief, challenging each other's
work, and converging on a final report. Every turn streams live to your browser as a
reasoning stream, telemetry, and a growing knowledge graph.

It runs entirely on the **Groq free tier** (or falls back to a deterministic simulation
engine when no API key is configured — the demo works either way).

```
brief ──▶ researcher ──▶ critic ──▶ analyst ──▶ synthesizer ──▶ verdict
             │            │           │             │
             └────────────┴─── shared findings ─────┘
```

## Features

- **Mission templates** — deep research, product post-mortem, startup validation, code review
- **Live reasoning stream** — every evidence byte, critique and weighted signal in real time
- **Agent orbit** — per-agent status, phase, confidence and token telemetry
- **Knowledge graph** — extracted facts, entities and claims connected as the mission runs
- **Final report** — verdict, key findings, risks, and the dissent that never resolved
- **Run library** — every past mission, replayable and deletable
- **Zero-config fallback** — provider auto-detects Groq key; otherwise runs the simulator

## Stack

| Layer     | Tech |
|-----------|------|
| Backend   | Node 20+, Express, Socket.IO, Prisma + SQLite, Zod |
| AI        | Groq (`qwen/qwen3.8-27b`), deterministic simulation fallback |
| Frontend  | Next.js 14 (App Router), Tailwind CSS, Zustand, React Flow-ready |
| Design    | OKLCH warm-graphite palette, single signal accent, Archivo / IBM Plex Mono |

## Architecture

```
┌──────────────────────────────┐        ┌──────────────────────────────┐
│  frontend :3000 (Next.js)    │        │  backend :8080 (Express)     │
│  - landing + launcher        │  REST  │  - /api/health, /missions    │
│  - mission dashboard (live)  │◀──────▶│  - mission:launch (socket)   │
│  - run library               │  Socket│  - orchestrator state machine│
│  - Zustand socket store      │◀──────▶│  - agent runtime (4 lanes)   │
└──────────────────────────────┘        └──────────────┬───────────────┘
                                                       │ Prisma
                                              ┌────────▼─────────┐
                                              │  SQLite (dev.db) │
                                              └──────────────────┘
                                              LLM: Groq → auto-fallback → simulation
```

## Quick start

```bash
npm install              # installs concurrently in root
npm run db:setup         # prisma generate + db push + seed (agent roster)
npm run dev              # backend :8080 + frontend :3000
```

Open http://localhost:3000. Pick a template, drop in a subject, hit **Deploy** — the
mission launches over the socket and the dashboard streams the swarm's reasoning live.

### Using live Groq inference (optional)

Create `backend/.env` (or copy from `backend/.env.example`):

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=qwen/qwen3.8-27b
AI_PROVIDER=auto        # auto | groq | simulation
DATABASE_URL=file:./dev.db
```

With no key (or `AI_PROVIDER=simulation`), SWARM runs the deterministic simulator —
same protocol, same UI, zero cost.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run setup` | installs backend + frontend deps |
| `npm run dev` | backend + frontend concurrently |
| `npm run db:setup` | prisma generate, db push, seed roster |
| `npm run build` | type-safe prod build of both packages |
| `npm start` (backend) | serves compiled `dist/server.js` |
| `npm run typecheck` | strict tsc on both packages |
| `npm test` | vitest suite (backend) |

## API contract (summary)

```
GET    /api/health          → provider, model, uptime
GET    /api/templates       → mission templates
GET    /api/agents          → agent roster
POST   /api/missions        → launch { name?, template, prompt, config?{agents?} }
GET    /api/missions        → list (status, tokens, cost)
GET    /api/missions/:id    → full detail + report + graph
DELETE /api/missions/:id    → remove mission and its trace
```

Socket.IO (server → client): `mission:created`, `agent:update`, `agent:message`,
`agent:chunk`, `graph:update`, `mission:complete`, `mission:failed`.
Client → server: `mission:launch`.

## Design notes

- **No gradients, no glassmorphism, no rounded-card soup.** UI is 1px-bordered panels,
  a single phosphor-cyan accent, and hand-drawn 1px-stroke SVG glyphs.
- Motion is limited to subtle fades and a blinking caret, and respects
  `prefers-reduced-motion`.
- Copy is honest — the landing shows real runtime telemetry (provider/model), never
  invented metrics.

## Timeline

- **0.1.0** — scaffold + brain spec set
- **0.2.0** — backend complete, live Groq mission verified end-to-end
- **0.3.0** — frontend complete: launcher, live dashboard, run library; socket pipeline E2E verified