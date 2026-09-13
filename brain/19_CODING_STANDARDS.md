# 19 — Coding Standards

Status: 🟢 ACTIVE

## Naming Conventions

- Files: `kebab-case` for folders/files; React components `PascalCase.tsx`.
- Variables/functions: `camelCase`.
- Classes/Components: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Booleans read like questions: `isLive`, `hasError`, `canLaunch`.

## Formatting & Linting

- Formatter: Prettier — config `.prettierrc` at root (singleQuote, semi, printWidth 100, trailingComma all).
- Linter: ESLint (next/core-web-vitals for frontend; @typescript-eslint for backend).
- Rule: code must pass `npm run lint` + `npx prettier --check` before done (enforced in CI).

## File & Folder Organization

- One module/component per file, matching `03_ARCHITECTURE.md`.
- Keep files under ~400 lines; split when they grow past.
- Co-locate tests: `*.test.ts` next to source.

## Comments & Documentation

- Comment the *why*, not the *what*.
- Public functions get a short docstring (purpose, params, return).
- No commented-out dead code in commits.

## Commit Message Convention

Conventional Commits:
```
feat: add live agent orbit to dashboard (T-008)
fix: correct groq fallback logic (T-003)
chore: bump dependencies
docs: update API contract (T-002)
```

## PR Size

- Prefer PRs < 400 changed lines; one PR = one task.
- PR description references task ID + relevant brain files.

## Error Handling in Code

- Never silently swallow — log or handle explicitly.
- Fail fast in dev; fail gracefully in prod (see `09_ERROR_HANDLING.md`).

## Dependency Hygiene

- New dependency → update `02_TRD.md` dependency table with reason + license.
- Prefer well-maintained, widely-used libraries.