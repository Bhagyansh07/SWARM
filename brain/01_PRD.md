# 01 — Product Requirements Document (PRD)

Status: 🟢 ACTIVE — filled for SWARM.

## Problem Statement

Individual AI assistants are single-minded: ask one question, get one answer, done. Real problems — deep research, product analysis, code review, startup validation — require a *team* of specialized minds working together, challenging each other, and converging on a verified answer. Existing tools (chatbots, single-agent wrappers) are black boxes: you can't see *how* the answer was reached, you can't direct the process, and you can't challenge the logic. SWARM fixes this by turning AI work into a visible, orchestrated, collaborative team effort on a mission-control dashboard.

## Target Audience

- Primary users: Developers, students, researchers, founders, and hiring managers who evaluate portfolio projects.
- Secondary users: Anyone who wants transparent, multi-step AI reasoning.
- Geography / language: India (English UI, Hinglish copy friendly).
- Technical comfort level: Technical — power users comfortable with dashboards and node graphs.

## Core Features (in scope)

1. **Swarm Missions** — Launch pre-built multi-agent workflows ("Deep Research", "Product Analysis", "Code Review", "Startup Validation") with a single click; the orchestrator spins up an agent team and runs the whole pipeline.
2. **Real-time Agent Telemetry** — Live streaming of each agent's reasoning, tool call, phase, and message via WebSockets; every agent state (idle/thinking/working/done/failed) pulses on the mission dashboard.
3. **Workflow Builder** — Drag-and-drop node-graph canvas (React Flow) where the user connects agents into a custom pipeline, then runs it.
4. **Agent Reasoning Whiteboard** — A shared, animated view showing what each agent is doing right now: hypothesis, evidence, confidence, critique.
5. **Knowledge Graph** — Force-directed graph of concepts/entities/facts the agents extracted, with clickable nodes and source tracing.
6. **Mission Analytics** — Token usage, throughput, per-agent effort, estimated cost (Groq is free; we show the "if paid" cost + inference latency), and a mission report.
7. **Run Library** — Saved missions, replay of past mission logs, shareable mission summary.
8. **Agents-as-a-Service** — Clean API: POST /api/missions to launch any mission programmatically.

## Out of Scope (explicitly NOT building)

- Agent memory/persistence across missions (no long-term learning loop in v1).
- Custom fine-tuned LLMs (we use Groq's hosted models only, with offline simulation fallback).
- Multi-tenant billing / real Stripe payments (monetization note only, see `11_MONETIZATION_SPEC.md`).
- Mobile native apps (responsive web only).
- Real web-browsing tool for agents in v1 (we simulate tool calls unless an API key + tooling is added later).

## User Stories

- As a developer, I want to see every agent's reasoning step live, so I can trust and verify the final output.
- As a founder, I want to run a startup-idea validation where a critic agent attacks my idea, so I see the weaknesses before investors do.
- As a candidate, I want a portfolio project that demonstrates system design, real-time architecture, and AI integration — so recruiters shortlist me.
- As a curious user, I want to drag agents into a custom workflow, so I can build my own pipeline.

## Success Metrics

- Time to first agent output under 1.5s (Groq inference is fast; message streaming from launch).
- Mission completion < 60s for standard templates on a single API key.
- Zero crashes on the dashboard across a 15-minute live demo.
- Zero errors running in simulation mode (no API key) — the demo never depends on connectivity.
- Visual wow factor: recruiter demo ready — no console errors, all states polished.

## Constraints

- Budget: ₹0 (free tier: Groq API key, SQLite, localhost).
- Timeline: single high-intensity build session.
- Team size / solo: solo.
- Platform(s): Web (desktop-first, responsive to mobile).
- Must integrate with: Groq API (primary), optional OpenAI/Anthropic adapters, Prisma, Socket.IO.

## Assumptions

- Developer has a stable internet connection for Groq API calls (simulation mode covers offline).
- Recruiters will run `npm run dev` locally — orchestration via a root script is mandatory.
- Groq's free tier rate limits are sufficient for demos (30 req/min, 6 req/s on the free key is plenty).

## Open Questions

- None blocking. Future: real browsing tool, memory, multi-user workspaces.