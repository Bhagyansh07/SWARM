# 09 — Error Handling Strategy

Status: 🟢 ACTIVE

## Error Taxonomy

| Category | Example | User-facing message style | Logged? | Alerted? |
|---|---|---|---|---|
| Network error | Socket disconnected, Groq timeout | "Connection lost — reconnecting…" | yes | if repeated |
| Validation error | empty prompt / bad template key | inline field message | no | no |
| Provider error | Groq 429 / 401 | "Model busy — switched to simulation for this turn" (badge) | yes | after 3 |
| Server error (5xx) | DB down | generic "something went wrong on the hub" | yes | yes |
| Mission failed | agent crashed | show reason + "Relaunch" button | yes | yes |

## Logging Standard

- Log format: structured JSON to console (`backend/src/lib/logger.ts`).
- Log levels: `debug`, `info`, `warn`, `error` — mapped to Socket.IO `log` event for live console mirror.
- NEVER logged: API keys, full prompts, secrets.
- Where logs go: console (+ optional file `backend/logs/app.log`).

## Retry & Backoff Policy

- LLM call transient failure: 1 retry at 0.5s.
- After 3 consecutive provider failures → permanent simulation fallback for the mission; emit `log` warn.
- Socket reconnect: exponential 1s→2s→4s→… max 10s.

## User-Facing Error Messages

- Never show raw stack traces.
- Every error suggests the next action (retry / check key / relaunch).
- Tone: calm, technical, mission-control ("Swarm line lost — re-establishing link").

## Monitoring & Alerting

- Tool: console + Socket.IO `log` mirror; frontend error banner.
- Alert thresholds: 3 consecutive provider failures → banner + simulation badge.
- Who gets alerted: the single developer (onscreen).