# Contributing to SWARM

Thanks for taking the time to look at SWARM. This project is a solo-maintained
portfolio build, but issues and pull requests are welcome.

## Getting started

```bash
npm install          # installs backend + frontend workspaces
npm run dev          # runs backend (Express) + frontend (Next.js) concurrently
```

The app runs with **zero configuration**: with no API key it uses the
deterministic simulator, and the UI behaves identically. To use live inference,
copy `backend/.env.example` to `backend/.env` and add a Groq key.

## Before you open a pull request

- Run `npm run typecheck` and `npm test` and make sure both pass.
- Keep pull requests small and focused; one concern per PR.
- Match the existing commit style (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Do not commit secrets, `.env` files, build output (`dist/`, `.next/`) or
  local data directories.

## Reporting bugs / requesting features

Open an issue using the templates. Include steps to reproduce, expected vs
actual behaviour, and your OS/Node version.

## Code of conduct

Be respectful and constructive. Harassment or abusive behaviour will not be
tolerated.

## License

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
