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
- **Run library** — every past mission, searchable, filterable, replayable, deletable
- **Benchmark rig** — six fixed briefs scored single-LLM vs the swarm by a *different* judge
  model; numbers are measured live, losses included (`/eval`)
- **Export anywhere** — branded PDF, Markdown and JSON of any report, plus copy-to-clipboard
- **Share links** — HMAC-signed, read-only snapshots of a finished mission
- **Light & dark** — full token-driven theme with a no-flash bootstrap and system following
- **Command palette** — `Ctrl/⌘ K` to jump anywhere, plus keyboard-first navigation
- **Zero-config fallback** — provider auto-detects Groq key; otherwise runs the simulator

## Stack

| Layer     | Tech |
|-----------|------|
| Backend   | Node 20+, Express, Zod, JSON document store (disk or Vercel Blob) |
| AI        | Groq (`qwen/qwen3.8-27b`), judge model `llama-3.3-70b-versatile`, deterministic simulation fallback |
| Frontend  | Next.js 14 (App Router), Tailwind CSS, Phosphor icons, Zustand, React Flow |
| Design    | OKLCH warm-graphite palette, single signal accent, Archivo / IBM Plex Mono |

## Architecture

Missions are long-running, so the API owns them: a launch request persists a
"queued" mission document and hands the run to the background (`waitUntil` on
Vercel). The orchestrator mutates an in-memory `MissionRecord` and flushes
throttled JSON snapshots to the store every ~200 ms. The browser follows a
mission by **polling** `GET /api/missions/:id` — no socket server, so it deploys
cleanly to serverless.

```
┌──────────────────────────────┐        ┌──────────────────────────────┐
│  frontend (Next.js)          │        │  backend (Express)           │
│  - landing + launcher        │  REST  │  - /api/health, /missions    │
│  - mission dashboard (poll)  │◀──────▶│  - orchestrator state machine│
│  - run library               │        │  - agent runtime (4 lanes)   │
│  - Zustand polling store     │        │  - background mission runner │
└──────────────────────────────┘        └──────────────┬───────────────┘
                                                       │ MissionStore
                                          ┌────────────▼─────────────┐
                                          │  disk (dev) / Vercel Blob │
                                          └───────────────────────────┘
                                          LLM: Groq → auto-fallback → simulation
```

The store is a tiny abstraction with two backends: a folder of JSON files for
local development, and **Vercel Blob** in production (`BLOB_READ_WRITE_TOKEN`).

## Quick start

```bash
npm install              # installs root, backend and frontend
npm run dev              # backend :8080 + frontend :3000
```

Open http://localhost:3000. Pick a template, drop in a subject, hit **Deploy** —
the mission launches in the background and the dashboard polls its live
reasoning stream, telemetry and knowledge graph.

### Using live Groq inference (optional)

Create `backend/.env` (or copy from `backend/.env.example`):

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=qwen/qwen3.8-27b
AI_PROVIDER=auto        # auto | groq | simulation
# SWARM_DATA_DIR=./.swarm-data   # where local mission JSON documents live
```

With no key (or `AI_PROVIDER=simulation`), SWARM runs the deterministic simulator —
same protocol, same UI, zero cost.

## Deploy

Two Vercel projects in one repo:

1. **API** — root directory `backend`, entry `src/serverless.ts` (`vercel.json`
   builds it with `@vercel/node`). Attach a **Blob** store; Vercel injects
   `BLOB_READ_WRITE_TOKEN`. Set `GROQ_API_KEY`, `GROQ_MODEL`, `AI_PROVIDER`,
   `CORS_ORIGIN`.
2. **Web** — root directory `frontend`. Set `BACKEND_URL` to the API project's
   URL; Next rewrites `/api/*` to it, so the browser only ever talks to one origin.

## Benchmark rig

The `/eval` page answers one question with measured numbers instead of adjectives:
*does multi-agent orchestration actually beat a single call to the same model?*

- **Fixed catalogue** — six briefs across strategy, research, review and operations,
  versioned in `backend/src/eval/tasks.ts` and never tuned to favour a winner.
- **Matched comparison** — the baseline is one LLM call; SWARM runs the *same model*
  through its four-agent pipeline. Only orchestration differs.
- **Independent judge** — a stronger, different model (`llama-3.3-70b-versatile`)
  scores both answers blind on accuracy, completeness and actionability (1–5).
- **Honest reporting** — ties and losses are shown, along with latency and token cost.

Results are produced on demand by the deployed API (rate-limited) and cached in the
store. Regenerate the full set locally — needs a Groq key — with:

```bash
GROQ_API_KEY=gsk_... npm run eval --prefix backend   # writes eval-results.json
```

### How to read the numbers

| Metric | Baseline | SWARM |
|--------|----------|-------|
| Quality | judge score / 5 | judge score / 5 |
| Latency | wall-clock for one call | wall-clock for the full pipeline |
| Tokens | single response | all agent turns combined |

Quality above 4.0 for the swarm with a positive mean delta means orchestration is
adding real signal; a near-zero delta would be reported just as plainly.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run setup` | installs backend + frontend deps |
| `npm run dev` | backend + frontend concurrently |
| `npm run build` | type-safe prod build of both packages |
| `npm start` (backend) | serves compiled `dist/server.js` |
| `npm run typecheck` | strict tsc on both packages |
| `npm test` | vitest suite (backend) |
| `npm run eval --prefix backend` | run the benchmark catalogue, write `eval-results.json` |

## API contract (summary)

```
GET    /api/health          → provider, model
GET    /api/templates       → mission templates
GET    /api/agents          → agent roster
POST   /api/missions        → launch { name?, template, prompt, config?{agents?} }
GET    /api/missions        → list (status, tokens, cost)
GET    /api/missions/:id    → full detail + report + graph (poll target)
DELETE /api/missions/:id    → remove mission and its trace
POST   /api/missions/:id/share → mint a share token
GET    /api/shared/:token   → read-only snapshot of a shared mission
GET    /api/eval            → benchmark results + summary
POST   /api/eval/run/:taskId → run one benchmark task (rate-limited)
```

## Design notes

- **No gradients, no glassmorphism, no rounded-card soup, no WebGL.** UI is
  1px-bordered panels, one signal accent, and flat SVG schematics.
- **Dual theme from one token set** — every colour is a semantic CSS variable
  (`--ink`, `--paper`, `--signal`, `--line`, …); light mode re-maps the variables,
  never the markup. The theme is resolved before first paint by a synchronous head
  script, so there is no flash.
- Motion is limited to subtle fades, a blinking caret and a dashes-along-the-bus
  tick, and respects `prefers-reduced-motion`.
- Copy is honest — the landing shows real runtime telemetry (provider/model), and
  the benchmark page reports measured scores, including where the swarm loses.
  Nothing is fabricated.

## Timeline

- **0.1.0** — scaffold + brain spec set
- **0.2.0** — backend complete, live Groq mission verified end-to-end
- **0.3.0** — frontend complete: launcher, live dashboard, run library
- **0.4.0** — serverless port: polling API, Blob-backed mission store, no 3D
- **1.0.0** — dual-theme instrument UI, PDF/Markdown/JSON export, share links,
  command palette, benchmark rig with an independent judge, CI