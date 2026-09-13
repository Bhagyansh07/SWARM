import type {
  AgentMessageDto,
  AgentStateDto,
  KnowledgeEdgeDto,
  KnowledgeNodeDto,
  MissionDetailDto,
  MissionSummaryDto,
  TemplateDef,
} from './types';

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => fetch('/api/health').then((r) => j<{ status: string; provider: string; model: string }>(r)),

  templates: () => fetch('/api/templates').then((r) => j<{ data: TemplateDef[] }>(r)),

  listMissions: () => fetch('/api/missions').then((r) => j<{ data: MissionSummaryDto[] }>(r)),

  getMission: (id: string) => fetch(`/api/missions/${id}`).then((r) => j<{ data: MissionDetailDto }>(r)),

  launch: (payload: { name?: string; template: string; prompt: string; config?: { agents: string[] } }) =>
    fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => j<{ data: { id: string; status: string } }>(r)),

  deleteMission: (id: string) =>
    fetch(`/api/missions/${id}`, { method: 'DELETE' }).then((r) => j<{ data: { deleted: boolean } }>(r)),
};

export type { AgentMessageDto, AgentStateDto, KnowledgeEdgeDto, KnowledgeNodeDto, MissionDetailDto, MissionSummaryDto };