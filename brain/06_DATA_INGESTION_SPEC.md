# 06 — Data Ingestion Spec

Status: 🟢 ACTIVE (minimal — no scraping in v1)

## Per-Source Ingestion Plan

### Source: Groq API (LLM streaming)

- **Method:** HTTP streaming via `@groq/sdk` `chat.completions.stream()`
- **Target endpoint(s):** `https://api.groq.com/openai/v1/chat/completions`
- **Schedule:** on-demand (per agent reasoning step inside a mission)
- **Rate limiting:** Groq free tier = 30 req/min, 6 req/s, 14.4k tokens/min. Orchestrator serializes agent turns and inserts a ~300ms gap to stay well under limits.
- **Failure handling:** 1 retry with backoff (0.5s) → on 2nd failure, fall back to SimulationEngine for that turn; count provider_fallback in telemetry.

## Compliance Guardrails

- [x] Respect rate limits — serialized turns + throttle gap.
- [x] No scraping of gated content.
- [x] No PII stored beyond user-provided mission prompt.
- [x] Raw request/response snapshots not persisted (only extracted messages).

## Data Validation on Ingest

- Message content must be non-empty string; truncate to 4000 chars for storage.
- Reject malformed provider payloads with a warn + simulation fallback.

## Storage of Ingested Data

- Raw layer: none persisted.
- Normalized/clean layer: `AgentMessage` rows in SQLite (see `04_DATA_MODEL.md`).