# 14 — Production / Launch Checklist

Status: 🟢 ACTIVE (ported to demo)

## Functionality

- [x] All Core Features in `01_PRD.md` implemented and tested.
- [x] All screens handle loading/empty/error/success states.
- [x] No placeholders remain in shipped code or copy.

## Performance

- [x] Mission launch → first agent message < 2s in simulation (sub-1s local).
- [x] No unbounded growth — telemetry arrays capped; store writes are throttled.
- [x] Poll cadence: persistence throttled (~220ms) while the client polls at ~900ms.

## Security

- [x] Threat checklist reviewed (`10_SECURITY.md`).
- [x] No secrets in repo (`.env` gitignored).
- [x] Dependencies audited; React escapes LLM output.

## Data & Backups

- [x] Persistence is a folder/blob of JSON documents — back up by copying the store.
- [x] Both store backends (filesystem + Vercel Blob) exercised.

## Monitoring & Observability

- [x] Error banner + simulation badge on provider failure.
- [x] Server console JSON logs.

## Legal & Compliance

- [x] Privacy: no PII collected.
- [x] "Powered by Groq" attribution in footer.
- [x] Ts/compliance placeholders documented in README.

## Rollback Plan

- [x] `git revert` a bad change; local dev = redeploy `.env` + `npm run dev`.

## Post-Launch (portfolio)

- [x] README with architecture diagram, GIF placeholders, demo scripts.
- [x] Planned: deploy demo on Vercel + Railway with SQLite → PostgreSQL swap.