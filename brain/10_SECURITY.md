# 10 — Security Spec

Status: 🟢 ACTIVE

## Authentication & Authorization

- Auth method: none for localhost demo (frictionless). Loosely session-based; if a single demo key is set via `DEMO_KEY`, the backend requires `X-Demo-Key` on REST writes.
- Session/token type: not applicable in v1.
- Role/permission model: single-user demo.

## Secrets Management

- All secrets in `.env` (git-ignored). `GROQ_API_KEY` lives ONLY there.
- `.env.example` committed with placeholder.
- Production plan: hosting secret manager.
- Key rotation: documented in README.

## Input Validation

- Validate all input server-side with zod: prompt (1–2000 chars), template key in roster, config.agent list subset of roster.
- No raw SQL concatenation — Prisma parameterized queries only.
- File uploads: none in v1.

## Data Privacy

- Data collected: mission prompts + generated content only. No emails, no passwords, no PII from users.
- Stored locally in SQLite.
- Regulations: DPDP (India) — data minimization honored; no cross-border transfer of personal data exists since none is collected.
- User rights supported: delete a mission (DELETE endpoint) + reset DB.

## Dependency & Infrastructure Security

- [x] `npm audit` performed at scaffold; Dependabot recommended on GitHub.
- [x] HTTPS in production hosts (Vercel/Railway defaults). Localhost = http.
- [x] CORS restricted to `http://localhost:3000` in dev.
- [x] Rate limit on mission launches (token bucket, `/api/missions`).
- [x] Admin routes: none public.

## Basic Threat Checklist

- [x] Injection — Prisma parameterized queries; no eval.
- [x] XSS — React escapes output by default; LLM content rendered as text/markdown-sanitized (no raw HTML).
- [x] CSRF — no cookies/state-changing GET; mutations are JSON fetch with CORS-restricted origin.
- [x] Broken access control — single-user demo; DELETEs scoped by mission id.
- [x] Sensitive data exposure — key never leaves backend env; client never receives key.

## Incident Response

- Local single-user: if issue found, fix + rotate key; documented in README security section.