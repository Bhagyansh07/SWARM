<!--
What a reviewer needs from a template is a short list of the things that are
easy to forget, not a form to fill in before saying anything.
-->

## What this changes

<!-- The problem, not the implementation. If the motivation does not fit here,
     the change is probably premature. -->

## Why this way

<!-- The alternative you rejected, and what stopped you choosing it. Omit this
     section when the change is obvious. -->

## Checklist

- [ ] `npm run typecheck` passes for backend and frontend.
- [ ] `npm test` passes (backend vitest suite).
- [ ] `npm run build` succeeds for both packages.

- [ ] No secrets, tokens, or `.env` values added.
- [ ] README / `docs/` updated if behaviour or a command changed.
