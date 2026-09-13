# 13 — Testing Strategy

Status: 🟢 ACTIVE — this is where I keep the test plan and targets.

## Testing Pyramid for this Project

- **Unit tests (most):** orchestration state machine transitions, simulation determinism, cost/telemetry math, zod validation.
- **Integration tests:** `/api/missions` happy path (simulation provider), mission persistence mapping.
- **E2E (manual demo):** launch → see telemetry → complete → report + graph. Manual QA checklist below.

## Coverage Targets

- Overall minimum: 70%.
- Orchestrator + provider logic: 85%+.

## What Must Always Be Tested

- [x] Every REST endpoint — happy path + at least one error path (supertest).
- [x] Zod validation rules in the API layer.
- [x] Simulation determinism: same seed → same sequence of messages.
- [x] Provider fallback: mock Groq failure → automatically uses simulation.

## Test Data

- Source: in-memory SQLite (`:memory:`) via Prisma; fixtures for agent roster + templates.
- Rule: tests never hit live Groq — provider is injected/mocked.

## Manual QA Checklist (pre-demo)

- [x] Visual check at 1280px and 640px widths.
- [x] Slow/offline behavior → simulation badge + banner.
- [x] Empty state on run library.
- [x] Launch, live telemetry, completion, report rendering.

## Regression Policy

- Every bug fix ships with a test that would have caught it.