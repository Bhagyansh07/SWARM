# 07 — API Contract

Status: 🟢 ACTIVE

## Conventions

- Base URL: `http://localhost:8080` (backend)
- Format: JSON; Socket.IO events for telemetry
- Auth: Schema-optional demo token via `X-Demo-Key` header (default: none, localhost demo)
- Versioning: `/v1/...`
- Standard error shape:
```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```

## REST Endpoints

### `GET /api/health`
- **Description:** liveness + provider status (groq/simulation)
- **Success (200):** `{ "status": "ok", "provider": "groq|simulation", "uptime": seconds }`

### `GET /api/agents`
- **Description:** static agent roster metadata (role, name, avatar, blurb)
- **Success (200):**
```json
{ "data": [ { "role": "researcher", "name": "Orion", "avatar": "telescope", "blurb": "..." } ] }
```

### `GET /api/missions`
- **Description:** list saved missions (latest first)
- **Query params:** `limit=20`
- **Success (200):**
```json
{ "data": [ { "id": "cuid", "name": "...", "template": "...", "status": "complete", "createdAt": "ISO" } ] }
```

### `POST /api/missions`
- **Description:** launch a mission (real-time events follow over Socket.IO)
- **Body:**
```json
{ "name": "optional", "template": "deep_research", "prompt": "Research X", "config": { "agents": ["researcher","analyst","critic","synthesizer"] } }
```
- **Success (201):**
```json
{ "data": { "id": "cuid", "status": "running" } }
```
- **Errors:** `400` invalid template/prompt, `422` validation, `500` internal

### `GET /api/missions/:id`
- **Description:** full mission detail (agents, messages, knowledge graph, report)
- **Success (200):** full payload described in `types.ts`
- **Errors:** `404` not found

### `DELETE /api/missions/:id`
- **Description:** delete a mission
- **Success (200):** `{ "data": { "deleted": true } }`

## Socket.IO Events

| Event (client→server) | Payload | Purpose |
|---|---|---|
| `mission:launch` | `{ template, prompt, name?, config? }` | launches mission, returns missionId |

| Event (server→client) | Payload |
|---|---|
| `mission:created` | `{ missionId, name, startedAt }` |
| `agent:update` | `{ missionId, agent: { id, role, status, phase, confidence, iterations, tokensUsed } }` |
| `agent:message` | `{ missionId, message: { id, agentId, role, type, content, seq } }` |
| `graph:update` | `{ missionId, nodes: KnowledgeNode[], edges: KnowledgeEdge[] }` |
| `mission:complete` | `{ missionId, report, analytics }` |
| `mission:failed` | `{ missionId, error }` |
| `log` | `{ level, message, ts, ...meta }` (server console mirror — emitted on mission started/complete/failed) |

## Rate Limiting

- 12 mission launches / 60s / IP on `POST /api/missions` (in-memory sliding window). Excess → `429 { error: { code: 'RATE_LIMITED' } }`.

## Pagination Standard

- `GET /missions?limit=N`; default 50, max 100.