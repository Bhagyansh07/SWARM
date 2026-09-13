# 03 — Architecture

Status: 🟢 ACTIVE

## High-Level Overview

SWARM is a client-server monorepo. The **Next.js frontend** (App Router SPA) renders the mission-control dashboard and connects to the **Express backend** over two channels: REST (launch mission, fetch history) and Socket.IO (live telemetry stream). The backend runs an **orchestrator** — a state machine that spins up an *AgentSwarm* (team of specialized agents). Each agent is powered by the **Groq LLM adapter** (real AI) or the **SimulationEngine** (deterministic offline fallback) selected at runtime in `src/llm/provider.ts`. Agent messages/state/telemetry are persisted via **Prisma + SQLite** and broadcast to all connected clients in real time.

```
[Next.js Frontend] --REST (fetch history/missions)--> [Express :8080]
        |                                                      |
        +-- Socket.IO (live telemetry) ----------------------->+
                                                               |
                                                      [Orchestrator]
                                                               |
                                      +------------------------+------------------------+
                                      |                         |                        |
                                 [Researcher]              [Analyst]              [Critic]
                                      |                         |                        |
                                      +-------------> [Synthesizer] <--------------------+
                                                               |
                                                      [Groq LLM] / [Simulation]
                                                               |
                                                           [Prisma + SQLite]
```

## Folder Structure

```
SWARM/
├── brain/                     # this folder — specs and rules
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express + Socket.IO bootstrap
│   │   ├── orchestrator/
│   │   │   ├── orchestrator.ts  # mission state machine
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
│   │   │   ├── groq.ts
│   │   │   └── simulation.ts    # deterministic fake reasoning
│   │   ├── sockets/
│   │   │   └── handlers.ts      # Socket.IO event wiring
│   │   ├── api/
│   │   │   ├── missions.ts      # REST routes
│   │   │   ├── history.ts
│   │   │   └── agents.ts        # agent roster metadata
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   └── logger.ts
│   │   └── types.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (pages)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Landing / Mission Launch
│   │   │   ├── mission/[id]/page.tsx  # Live mission dashboard
│   │   │   ├── builder/page.tsx       # Workflow builder
│   │   │   ├── history/page.tsx       # Run library
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── agents/
│   │   │   ├── graph/
│   │   │   ├── charts/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   ├── socket.ts
│   │   │   ├── api.ts
│   │   │   └── format.ts
│   │   ├── hooks/
│   │   ├── store/             # Zustand stores
│   │   └── types.ts
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── package.json
├── package.json              # root orchestrator script
├── .env.example
└── README.md
```

## Module Boundaries

| Module | Responsibility | Depends on |
|---|---|---|
| API layer | REST contracts, validation | db, llm providers |
| Orchestrator | Mission lifecycle, agent scheduling, telemetry | agents, sockets, db |
| Agents | Domain reasoning per persona | llm provider |
| LLM provider | Groq vs simulation selection | external Groq SDK / local sim |
| Socket layer | Real-time broadcast | orchestrator events |
| Frontend | Dashboard, builder, charts, replay | socket client, REST |

Rule: modules depend downward only (UI → orchestrator → agents → LLM). No UI code imports agent internals.

## State Management (frontend)

- Approach: **Zustand** for global mission/telemetry state; local state for forms.
- Where server state is cached: `missionStore` (live mission), `historyStore` (past missions).
- Where UI-only state lives: component `useState` — canvas zoom, panel open/close, toggles.

## Background Jobs / Scheduled Tasks

- None in v1 (missions run on-demand). A prisma seed script populates demo agent roster + templates.

## Key Design Principles

- **Always-live UI:** every agent update is a Socket.IO event; UI never polls.
- **Provider-agnostic AI:** `LlmProvider` interface means Groq, OpenAI, or simulation are drop-in.
- **Deterministic simulation:** `simulation.ts` produces plausible-but-fake reasoning so the demo shines without a key.
- **Typed end-to-end:** shared event/state types in `backend/src/types.ts` mirrored by `frontend/src/types.ts`.