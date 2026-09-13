# 20 — Environment Setup

Status: 🟢 ACTIVE

## Prerequisites

- Node.js 20+ (recommended LTS 20.x or 22.x)
- npm 10+
- No database install needed (SQLite bundled with Prisma)
- Optional: Groq API key from https://console.groq.com (free)

## First-Time Setup

```bash
# 1. Navigate to project
cd "RANDOM PROJECT/SWARM"

# 2. Install all dependencies (root script installs backend + frontend)
npm run setup

# 3. Copy backends env template and add your Groq key (optional; sim runs without it)
copy backend/.env.example backend/.env

# 4. Create database + seed roster/templates
npm run db:setup

# 5. Run the whole stack (frontend :3000 + backend :8080)
npm run dev
```

## `.env` Template (backend/.env.example)

```
# Backend
PORT=8080
CORS_ORIGIN=http://localhost:3000

# AI Provider - Groq free tier (https://console.groq.com)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
AI_PROVIDER=auto

# Database (SQLite via Prisma)
DATABASE_URL=file:./dev.db
```

## Common Commands (root)

| Task | Command |
|---|---|
| Install everything | `npm run setup` |
| Run dev (both) | `npm run dev` |
| Run backend only | `npm run dev:backend` |
| Run frontend only | `npm run dev:frontend` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Tests | `npm run test` |

## Troubleshooting

- **Port 8080 in use:** change `PORT` in backend/.env, update `NEXT_PUBLIC_API_URL` in frontend/.env if custom.
- **No Groq key:** delete or leave `GROQ_API_KEY` empty → simulation mode badge shows; everything still works.
- **Prisma issues:** delete `backend/prisma/dev.db`, rerun `npm run db:setup`.
- **Frontend can't connect:** ensure backend is on :8080; check `frontend/.env.local` `NEXT_PUBLIC_API_URL`.
- **Windows EPERM node_modules:** run `npm cache clean --force` then retry; or `cmd /c rd /s node_modules` in the failing package.