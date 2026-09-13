# 04 — Data Model

Status: 🟢 ACTIVE

## Entity List

| Entity | Description |
|---|---|
| Mission | A launched orchestration run (template + config) |
| Agent | A deployed agent instance within a mission |
| AgentMessage | A message/reasoning step produced by an agent |
| KnowledgeNode | A concept/entity/fact extracted during a mission (graph node) |
| KnowledgeEdge | A relationship between two knowledge nodes (graph edge) |
| MissionReport | The final synthesized output + analytics |

## Entity Details

### Entity: Mission

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (cuid) | yes | primary key |
| name | string | yes | user-facing title |
| template | string | yes | template key e.g. "deep_research" |
| prompt | string | yes | user's objective |
| status | string | yes | queued/running/complete/failed |
| provider | string | yes | "groq" \| "simulation" |
| model | string | yes | model id used |
| startedAt | datetime | yes | |
| completedAt | datetime | no | |
| totalTokens | int | no | accrued during run |
| estCostUsd | float | no | computed cost |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |

**Relationships:** has many Agents, has many KnowledgeNodes, has one MissionReport
**Indexes:** `status`, `createdAt`

### Entity: Agent

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (cuid) | yes | primary key |
| missionId | string | yes | FK → Mission |
| role | string | yes | researcher/analyst/critic/synthesizer/orchestrator |
| name | string | yes | display name |
| avatar | string | yes | icon key |
| status | string | yes | idle/thinking/working/done/failed |
| phase | string | no | current sub-task label |
| confidence | float | no | 0..1 self-assessed confidence |
| iterations | int | yes | reasoning steps completed (default 0) |
| tokensUsed | int | yes | |
| startedAt | datetime | no | |
| finishedAt | datetime | no | |

**Relationships:** belongs to Mission; has many AgentMessages
**Indexes:** `missionId`

### Entity: AgentMessage

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (cuid) | yes | primary key |
| agentId | string | yes | FK → Agent |
| type | string | yes | thought/evidence/critique/synthesis/narrative/live_chunk |
| content | string | yes | |
| meta | string | no | JSON extras |
| seq | int | yes | per-mission ordering |
| createdAt | datetime | yes | |

**Indexes:** `agentId`, `seq`

### Entity: KnowledgeNode

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (cuid) | yes | primary key |
| missionId | string | yes | FK |
| label | string | yes | concept name |
| kind | string | yes | concept/entity/fact/claim |
| group | int | yes | visual cluster color group |
| weight | float | yes | importance |
| createdAt | datetime | yes | |

### Entity: KnowledgeEdge

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (cuid) | yes | primary key |
| missionId | string | yes | FK |
| sourceId | string | yes | FK → KnowledgeNode |
| targetId | string | yes | FK → KnowledgeNode |
| label | string | no | relationship type |
| createdAt | datetime | yes | |

### Entity: MissionReport

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (cuid) | yes | primary key |
| missionId | string | yes | FK (unique) |
| summary | string | yes | markdown final synthesis |
| keyFindings | string | no | JSON array of findings |
| risks | string | no | JSON array of risks/critic output |
| verdict | string | no | synthesized verdict |
| createdAt | datetime | yes | |

## Relationships Diagram (text form)

```
Mission (1) --- (many) Agent
Mission (1) --- (many) KnowledgeNode --- (many) KnowledgeEdge
Mission (1) --- (1) MissionReport
Agent (1) --- (many) AgentMessage
```

## Migration Strategy

- Tool: Prisma Migrate (`prisma migrate dev`), schema at `backend/prisma/schema.prisma`.
- Rule: never edit a migration that has run — always add a new one.
- Where migrations live: `backend/prisma/migrations/`.

## Data Retention & Deletion

- Missions kept indefinitely in local SQLite (demo).
- Soft-delete unused: a `DELETE` route clears a mission + cascades.
- No PII collected; optional reset by deleting `backend/prisma/dev.db`.