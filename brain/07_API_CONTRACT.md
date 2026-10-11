# 07 — API Contract

Status: 🟢 ACTIVE

## Conventions

- Base URL: `http://localhost:8080` (backend); the frontend proxies `/api/*` to
  `BACKEND_URL` via a Next.js rewrite, so the browser only ever talks to one origin.
- Format: JSON. Live telemetry is pulled by **polling** — there are no Socket.IO events.
- Auth: none (open demo).
- Standard success shape: `{ "data": ... }`; standard error shape:
```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```

## REST Endpoints

### `GET /api/health`
- **Description:** liveness + provider status (groq/simulation)
- **Success (200):** `{ "status": "ok", "provider": "groq|simulation", "model": "qwen/qwen3.8-27b" }`

### `GET /api/templates`
- **Description:** mission template definitions (key, title, tagline, prompt scaffold)
- **Success (200):** `{ "data": [ { "key": "deep_research", "title": "...", "tagline": "..." } ] }`

### `GET /api/agents`
- **Description:** static agent roster metadata (role, name, blurb)
- **Success (200):**
```json
{ "data": [ { "role": "researcher", "name": "Kai", "blurb": "..." } ] }
```

### `GET /api/missions`
- **Description:** list saved missions (newest first)
- **Query params:** `limit=N` (default 50, max 100)
- **Success (200):**
```json
{ "data": [ { "id": "uuid", "name": "...", "template": "...", "status": "complete", "createdAt": "ISO", "totalTokens": 1560, "estCostUsd": 0.0009 } ] }
```

### `POST /api/missions`
- **Description:** create a mission, persist it as `queued`, and hand the run to
  the background. Returns immediately; the client then polls the detail endpoint.
- **Body:**
```json
{ "name": "optional", "template": "deep_research", "prompt": "Research X", "config": { "agents": ["researcher","analyst","critic","synthesizer"] } }
```
- **Success (201):**
```json
{ "data": { "id": "uuid", "status": "queued" } }
```
- **Errors:** `400` invalid template/prompt, `422` validation, `429` rate limited, `500` internal

### `GET /api/missions/:id`
- **Description:** full mission detail — the poll target. Returns agents, messages,
  in-flight `chunks`, knowledge graph `nodes`/`edges`, `report`, `analytics`,
  and `error`; `status` moves `queued → running → complete|failed`.
- **Success (200):** full payload described in `types.ts`
- **Errors:** `404` not found

### `DELETE /api/missions/:id`
- **Description:** delete a mission and its trace
- **Success (200):** `{ "data": { "deleted": true } }`

### `POST /api/missions/:id/share`
- **Description:** mint a share token. The token is a signed encoding of the
  mission id, so it is derived (not stored) and resolves instantly.
- **Success (200):** `{ "data": { "token": "<base64url(id)>.<hmac>" } }`

### `GET /api/shared/:token`
- **Description:** read a shared mission snapshot (same shape as mission detail)
- **Errors:** `404` invalid signature or unknown mission

## Live Telemetry (polling)

The client polls `GET /api/missions/:id` at ~900 ms and replaces its session state
with the returned snapshot. Polling stops once `status` is `complete` or `failed`.
The detail payload is deliberately self-contained so the client needs no event
stream and no delta logic.

## Rate Limiting

- 12 mission launches / 60s / IP on `POST /api/missions` (in-memory sliding
  window). Excess → `429 { error: { code: 'RATE_LIMITED' } }`. Read endpoints
  (detail, list, share) are not rate limited.

## Pagination Standard

- `GET /api/missions?limit=N`; default 50, max 100.
