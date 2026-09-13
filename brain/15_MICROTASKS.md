# 15 — Microtasks

Status: 🟢 LIVE — every task exists here first.

## Active Tasks

### [T-001] Scaffold monorepo + BRAIN files
- Status: DONE
- Description: root package.json (concurrently), brain/ folder fully filled (00–20).
- Files: brain/*, package.json

### [T-002] Backend scaffold (Express + Socket.IO + Prisma + SQLite)
- Status: DONE
- Description: TS server, prisma schema, seed, health + missions REST, socket wiring.
- Files: backend/**

### [T-003] LLM provider layer (Groq + Simulation)
- Status: DONE
- Description: LlmProvider interface, groq adapter, deterministic simulation engine, auto-fallback.
- Files: backend/src/llm/*

### [T-004] Orchestrator + AgentSwarm lifecycle
- Status: DONE
- Description: mission state machine, template registry, agent scheduling (serial + parallel stages), telemetry emission.
- Files: backend/src/orchestrator/*, backend/src/agents/*

### [T-005] Agent personas (Researcher, Analyst, Critic, Synthesizer)
- Status: DONE
- Description: each agent's prompt system, reasoning flows, message generation, knowledge extraction.
- Files: backend/src/agents/*

### [T-006] Frontend scaffold (Next.js + Tailwind + Zusstand)
- Status: DONE
- Description: App Router shell, design system primitives, fonts, globals.
- Files: frontend/**

### [T-007] Landing / Mission Launch screen
- Status: DONE
- Description: hero, template cards, launch button, recent missions.
- Files: frontend/src/app/page.tsx + components

### [T-008] Live Mission Dashboard
- Status: DONE
- Description: socket store, agent orbit, reasoning stream, telemetry panels, knowledge graph.
- Files: frontend/src/components/dashboard/**, hooks, store

### [T-009] Workflow Builder (React Flow)
- Status: DONE
- Description: node palette (agents), canvas, connect, launch custom pipeline (topological turn-order validation via Kahn's algorithm). Live at /builder; E2E verified custom `config.agents` order through the REST proxy.
- Files: frontend/src/app/builder/**

### [T-010] Run Library + replay
- Status: DONE
- Description: saved missions list, detail/replay from history API.
- Files: frontend/src/app/history/**

### [T-011] CI workflow + README + polish
- Status: DONE
- Description: GitHub Actions, README with architecture + demo, final QA.
- Files: .github/**, README.md

## Blocked Tasks

_(none)_

## Archive

### [T-002] Backend scaffold — DONE
### [T-003] LLM provider layer — DONE
### [T-004] Orchestrator + AgentSwarm lifecycle — DONE
### [T-005] Agent personas — DONE

### Archive note (2026-09-13): Backend fully verified — live Groq mission ran end-to-end
(cmtzwo25u0000d54g608h6toh): 4 agents, 7 messages, knowledge graph (7 nodes / 3 edges),
report generated. Groq model switched to qwen/qwen3.8-27b (llama-3.3-70b-versatile
deprecated on this account). fix: seed FK, tsconfig noEmit<->build, fire-and-forget
persistence race (pendingWrites flush), sharedFindings propagation. vitest: 7/7 green.