# 03 — Architecture

Status: 🟢 ACTIVE

## High-Level Overview

SWARM is a monorepo with a **Next.js frontend** and an **Express backend**. The
frontend renders the mission-control dashboard and talks to the backend over
**REST only**. Mission runs are long-lived, so the backend owns them: a launch
request persists a `queued` mission document and hands the actual run to the
background (Vercel `waitUntil`). The **orchestrator** is a state machine that
assembles an *AgentSwarm* (team of specialized agents) and mutates an in-memory
`MissionRecord`, flushing throttled JSON snapshots to a **MissionStore** every
~200 ms. The client follows a mission by **polling** `GET /api/missions/:id`.

Each agent is powered by the **Groq LLM adapter** (real AI) or the
**SimulationEngine** (deterministic offline fallback), selected at runtime in
`src/llm/provider.ts`.

```
[Next.js Frontend] --REST (launch / poll / history)--> [Express :8080]
        ^                                                      |
        |                                                      |
        +-- GET /api/missions/:id (poll ~900ms) --------------->+
                                                               |
                                                      [Orchestrator]
                                                       (background)
                                                               |
                                      +------------------------+------------------------+
                                      |                         |                        |
                                 [Researcher]              [Analyst]              [Critic]
                                      |                         |                        |
                                      +-------------> [Synthesizer] <--------------------+
                                                               |
                                                      [Groq LLM] / [Simulation]
                                                               |
                                                    [MissionStore]
                                          disk (dev)  /  Vercel Blob (prod)
```

The same Express app is served two ways: `src/server.ts` runs it as a normal
long-lived process for local development, and `src/serverless.ts` exports it as
a single Vercel Node function for production. `src/app.ts` is the shared factory.

## Folder Structure

```
SWARM/
├── brain/                     # this folder — specs and rules
├── backend/
│   ├── src/
│   │   ├── app.ts             # createApp() — shared Express factory
│   │   ├── server.ts          # local long-lived server (no sockets)
│   │   ├── serverless.ts      # Vercel function entry (default export)
│   │   ├── orchestrator/
│   │   │   ├── orchestrator.ts  # mission state machine + throttled persistence
│   │   │   ├── swarm.ts         # AgentSwarm (team assembly)
│   │   │   └── templates.ts     # mission templates
│   │   ├── agents/
│   │   │   ├── base.ts          # Agent interface + lifecycle
│   │   │   ├── researcher.ts
│   │   │   ├── analyst.ts
│   │   │   ├── critic.ts
│   │   │   └── synthesizer.ts
│   │   ├── llm/
│   │   │   ├── provider.ts      # Groq vs Simulation switch
│   │   │   ├── groq.ts          # per-request timeout, maxRetries 0
│   │   │   └── simulation.ts    # deterministic fake reasoning
│   │   ├── api/
│   │   │   ├── missions.ts      # REST routes + background launch
│   │   │   ├── history.ts
│   │   │   └── agents.ts        # agent roster metadata
│   │   ├── lib/
│   │   │   ├── store.ts         # MissionStore — File / Vercel Blob backends
│   │   │   ├── background.ts    # runInBackground() via waitUntil
│   │   │   ├── rate-limit.ts    # launch throttling
│   │   │   └── logger.ts
│   │   └── types.ts
│   ├── vercel.json            # @vercel/node build of src/serverless.ts
│   ├── .vercelignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (pages)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Landing / Mission Launch
│   │   │   ├── mission/[id]/page.tsx  # Live mission dashboard (polls)
│   │   │   ├── shared/[token]/page.tsx # Read-only shared mission
│   │   │   ├── builder/page.tsx       # Workflow builder
│   │   │   ├── history/page.tsx       # Run library
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── dashboard/     # bus schematic, stream, graph, report, replay
│   │   │   ├── landing/       # launcher, hero deck, showcase frames
│   │   │   ├── site/          # topbar, footer
│   │   │   └── ui.tsx
│   │   └── lib/
│   │       ├── store.ts       # Zustand polling session store
│   │       ├── api.ts
│   │       └── hooks.tsx
│   ├── tailwind.config.ts
│   ├── next.config.mjs        # /api/* rewrite → BACKEND_URL
│   └── package.json
├── package.json              # root orchestrator script
└── README.md
```

## Module Boundaries

| Module | Responsibility | Depends on |
|---|---|---|
| API layer | REST contracts, validation, launch + background handoff | orchestrator, store, llm providers |
| Orchestrator | Mission lifecycle, agent scheduling, telemetry | agents, store, background |
| Agents | Domain reasoning per persona | llm provider |
| LLM provider | Groq vs simulation selection | external Groq SDK / local sim |
| Store | Persist mission documents (disk or Blob) | Vercel Blob / filesystem |
| Frontend | Dashboard, builder, library, replay | REST (polling) |

Rule: modules depend downward only (UI → orchestrator → agents → LLM). No UI code imports agent internals.

## State Management (frontend)

- Approach: **Zustand** for global mission/telemetry state; local state for forms.
- The session store polls `GET /api/missions/:id` every ~900 ms while a mission
  is running, and stops on `complete` / `failed`.
- Where UI-only state lives: component `useState` — active tab, filters, panel toggles.

## Background Jobs / Scheduled Tasks

- None scheduled. A mission is handed to the background (`runInBackground`) at
  launch time and bounded by `MISSION_BUDGET_MS` (default 45000) plus per-request
  LLM timeouts, so a run always finishes inside the serverless invocation cap.

## Key Design Principles

- **Poll, don't push:** there is no socket server; a mission is a JSON snapshot
  the client re-reads. This keeps deployment to serverless trivial.
- **Provider-agnostic AI:** `LlmProvider` interface means Groq, OpenAI, or simulation are drop-in.
- **Deterministic simulation:** `simulation.ts` produces plausible-but-fake reasoning so the demo shines without a key.
- **Typed end-to-end:** shared DTOs in `backend/src/types.ts` mirrored by `frontend/src/types.ts`.
- **No spectacle:** flat 1px schematics, one signal accent, no WebGL.
