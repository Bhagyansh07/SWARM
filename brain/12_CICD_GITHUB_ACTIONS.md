# 12 — CI/CD & GitHub Actions

Status: 🟢 ACTIVE

## Branch Strategy

- Main branch: `main` (always deployable).
- Working branches: `feature/[task-id]-short-name`.
- Merge strategy: squash merge.
- Rule: no direct pushes to `main`.

## Pipeline Stages

1. **Lint + Typecheck** (both packages) — fail build on errors.
2. **Backend Unit Tests** — orchestrator + simulation determinism (Vitest).
3. **Frontend Build** — `next build` succeeds.
4. **Deploy** — placeholder jobs (Vercel preview on PR; document only in v1).

## Example Workflow Skeleton (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build:frontend
```

## Secrets in CI

- `.env` never in repo; `GROQ_API_KEY` if ever needed in CI tests → GitHub Encrypted Secrets, never in workflow.

## Required Checks Before Merge

- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] No secrets in diff