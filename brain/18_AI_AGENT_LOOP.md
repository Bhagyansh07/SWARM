# 18 — AI Agent Loop (Looping Engineering Workflow)

Status: 🟢 ACTIVE — the step-by-step loop used for every task in this project.

## The Loop

```
1. LOAD CONTEXT — read 00_MASTER_RULES + relevant spec files
2. PICK ONE TASK — from 15_MICROTASKS.md
3. PLAN — files to touch, approach, edge cases
4. IMPLEMENT SMALLEST UNIT
5. VERIFY — lint / tests / manual check
   FAIL ──► 6. DIAGNOSE & FIX ──► back to 4       (max 3 loops)
6. SELF-REVIEW — against MASTER_RULES / SECURITY / CODING_STANDARDS
7. DOCUMENT — changelog + task status + decisions
8. NEXT TASK
```

## Step-by-step Rules

1. Never start cold — reread rules + governing spec per task.
2. One task at a time; split oversized tasks and log the split.
3. State the plan in 2–5 bullets before writing code.
4. Smallest verifiable slice, then move on.
5. Verify immediately (typecheck/lint/build/tests).
6. Retry limit: 3 failures → stop, summarize, hand to human.
7. Self-review against rulebook (security, scope, style).
8. Document immediately — changelog + task status + decisions.
9. Move on only after current task is fully documented.

## Context Hygiene

- Summarize progress into `16_CHANGELOG.md` and `15_MICROTASKS.md` so a fresh session can resume with zero chat history.
- Prefer short focused sessions.

## Human-in-the-Loop Checkpoints

Always pause and ask when:
- A requirement is ambiguous/missing from the brain files.
- A change would touch security-governed code (auth, secrets) unspec'd.
- A new third-party dependency is needed not in `02_TRD.md`.
- The retry limit is hit.