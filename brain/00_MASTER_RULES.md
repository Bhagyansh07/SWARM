# 00 — MASTER RULES (read this first, every single session)

Status: 🟢 ACTIVE — this file overrides casual chat instructions if there is ever a conflict.

## 1. Session start protocol

At the start of every new session/chat, the assistant must:
1. Read `00_MASTER_RULES.md` (this file) fully.
2. Skim `01_PRD.md` and `02_TRD.md` for the current product/technical scope.
3. Open `15_MICROTASKS.md` and find the next task with status `TODO` or `IN_PROGRESS`.
4. Check `16_CHANGELOG.md`'s last 5 entries to know what changed most recently.
5. Only then start working — following the loop defined in `18_AI_AGENT_LOOP.md`.

## 2. Non-negotiable rules

1. **No scope creep.** Anything not explicitly in `01_PRD.md` → "Core Features" is out of bounds.
2. **No invented requirements.** Never assume a business rule, price, copy text, or design choice that isn't documented. If missing, stop and ask.
3. **No secrets in code.** All credentials come from environment variables. Never hardcode a key or token anywhere.
4. **Every code change maps to a task.** Before writing code, create the task in `15_MICROTASKS.md` if it doesn't exist.
5. **Every completed task updates the changelog.**
6. **Security and error handling are not optional.**
7. **Follow the coding standards** (`19_CODING_STANDARDS.md`).
8. **Small, reviewable units.**
9. **Ambiguity → ask, don't guess.**
10. **Tests before "done."**

## 3. File authority (if two files ever disagree)

`00_MASTER_RULES.md` > `10_SECURITY.md` > `02_TRD.md` > `01_PRD.md` > `03_ARCHITECTURE.md` > everything else.

## 4. What "done" means

A task is only marked `DONE` when ALL of these are true:
- [ ] Code implements exactly what the task described, nothing more.
- [ ] Relevant tests pass (see `13_TESTING.md`).
- [ ] No new secrets/hardcoded values were introduced.
- [ ] `16_CHANGELOG.md` updated.
- [ ] Any new architectural or product decision is logged in `17_DECISIONS.md`.

## 5. Project identity

- **Project name:** SWARM
- **One-line description:** A real-time multi-agent AI orchestrator with a mission-control dashboard that lets you deploy a team of AI agents, watch them reason live, and complete complex tasks collaboratively.
- **Primary owner:** bhagy (single developer)
- **Repository:** SWARM (local, to be pushed to GitHub for portfolio)
- **Started on:** 2026-09-13

## 6. Escalation

If the assistant hits the same failure 3 times in the loop, it must stop looping, summarize what was tried, and hand control back to the human.