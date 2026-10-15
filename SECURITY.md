# Security Policy

## Supported versions

This is a portfolio project maintained on a best-effort basis. The `main`
branch is the only supported version.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Instead, report privately using GitHub's
[Security Advisories](../../security/advisories/new) for this repository, or
email the maintainer. Include:

- a description of the issue and its impact,
- steps to reproduce,
- any suggested fix.

You can expect an acknowledgement within a few days.

## Secrets

SWARM reads all credentials from environment variables (`GROQ_API_KEY`,
`OPENAI_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `SHARE_SECRET`). Never commit real
values; use `backend/.env.example` as the template. If you believe a secret was
committed, rotate it immediately and report it privately.
