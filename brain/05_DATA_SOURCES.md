# 05 — Data Sources

Status: 🟢 ACTIVE

## Source Inventory

| # | Source name | Type | URL / endpoint | Auth required? | Update frequency | Owner/contact | License / ToS notes |
|---|---|---|---|---|---|---|---|
| 1 | Groq API | API | https://api.groq.com/openai/v1/chat/completions | Yes (API key) | On-demand per agent step | Groq | Free tier; ToS = no redispersal of outputs as model training data |
| 2 | Simulation engine | Local | `backend/src/llm/simulation.ts` | No | Deterministic per seed | self | n/a — pure local generation |

## Reliability Notes

- **Groq API:** fallback = automatic switch to SimulationEngine when key is missing/invalid or a request fails (per provider.ts). Alert if 3 consecutive failures.
- **Simulation engine:** no dependency, always available, zero rate limits.

## Legal / Compliance Checklist

- [x] Terms of Service allow normal API usage.
- [x] No scraping.
- [x] Attribution not required — we mention "Powered by Groq" in UI footer for good faith.
- [x] No PII involved.

## Data Freshness SLA

- Live telemetry is real-time by design; no staleness window applicable.