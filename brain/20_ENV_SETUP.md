# 20 — Environment Setup

Status: 🟢 ACTIVE

## Prerequisites

- Node.js 20+ (recommended LTS 20.x or 22.x)
- npm 10+
- No database install needed — persistence is JSON documents on disk
- Optional: Groq API key from https://console.groq.com (free)

## First-Time Setup

```bash
# 1. Navigate to project
cd "RANDOM PROJECT/SWARM"

# 2. Install all dependencies (root script installs backend + frontend)
npm run setup

# 3. Copy backend env template and add your Groq key (optional; sim runs without it)
copy backend/.env.example backend/.env

# 4. Run the whole stack (frontend :3000 + backend :8080)
npm run dev
```

## `.env` Template (backend/.env.example)

```
# Backend
PORT=8080
CORS_ORIGIN=http://localhost:3000

# AI Provider - Groq free tier (https://console.groq.com)
GROQ_API_KEY=
GROQ_MODEL=qwen/qwen3.8-27b
AI_PROVIDER=auto

# Mission store — JSON documents on disk (default). Set a Blob token to use Vercel Blob.
SWARM_DATA_DIR=./.swarm-data
# BLOB_READ_WRITE_TOKEN=
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

- **Port 8080 in use:** change `PORT` in backend/.env.
- **No Groq key:** delete or leave `GROQ_API_KEY` empty → simulation mode badge shows; everything still works.
- **Store issues:** the local store is just JSON — delete `backend/.swarm-data` to reset.
- **Frontend can't connect:** the frontend proxies `/api/*` to `BACKEND_URL` (default `http://localhost:8080`). Ensure the backend is up; set `BACKEND_URL` at build time for a custom host.
- **Windows EPERM node_modules:** run `npm cache clean --force` then retry; or `cmd /c rd /s node_modules` in the failing package.