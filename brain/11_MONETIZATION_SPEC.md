# 11 — Monetization Spec

Status: 🟢 ACTIVE (informational)

## Model

- Type: Freemium (post-demo). SWARM is a portfolio/demo product now; this file documents the intended model for a real SaaS launch so recruiters see product thinking.

## Subscriptions / In-App Purchases (post-demo plan)

| Tier | Price | What's included |
|---|---|---|
| Free | $0 | Simulation mode + 10 Groq missions/day, 3 agents max |
| Pro | $9/mo | Unlimited missions, all agents, workflow builder export, custom models |
| Team | $24/mo | Multi-user workspaces, shared run library, API access |

- Billing provider: Stripe (future).
- Trial: 7-day Pro trial.

## Guardrails

- [x] Monetization never compromises the demo experience — everything demoable is free locally.
- [x] No dark patterns.
- [x] Keys managed per `20_ENV_SETUP.md`.