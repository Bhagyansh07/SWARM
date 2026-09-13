import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { Orchestrator, type OrchestratorEmit } from '../orchestrator/orchestrator';
import { getTemplate, resolveConfiguration, validateAgentOrder } from '../orchestrator/templates';
import { AGENT_ROSTER, TEMPLATES, type AgentRole, type LaunchMissionInput, type MissionDetailDto } from '../types';
import { resolveProvider, currentModel } from '../llm/provider';

export interface EmitFn {
  (event: string, payload: Record<string, unknown>): void;
}

const launchSchema = z.object({
  name: z.string().max(80).optional(),
  template: z.string().min(1).max(40),
  prompt: z.string().min(3).max(2000),
  config: z.object({ agents: z.array(z.string()).max(8).optional() }).optional(),
});

const RATE_LIMIT = { windowMs: 60_000, max: 12 };
const launchHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = (launchHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  launchHits.set(ip, bucket);
  return bucket.length >= RATE_LIMIT.max;
}

function recordLaunch(ip: string): void {
  const prev = launchHits.get(ip) ?? [];
  prev.push(Date.now());
  launchHits.set(ip, prev);
}

function toDetailDto(data: {
  mission: NonNullable<Awaited<ReturnType<typeof loadMissionCore>>>;
  agents: Array<{ id: string; role: string; name: string; avatar: string; status: string; phase: string | null; confidence: number; iterations: number; tokensUsed: number }>;
  messages: Array<{ id: string; agentId: string; type: string; content: string; seq: number; meta: string | null; createdAt: Date } & { agent: { role: string } }>;
  nodes: Array<{ id: string; label: string; kind: string; group: number; weight: number }>;
  edges: Array<{ id: string; sourceId: string; targetId: string; label: string | null }>;
  report: { summary: string; keyFindings: string | null; risks: string | null; verdict: string | null } | null;
}): MissionDetailDto {
  const m = data.mission;
  const completedAt = m.completedAt;
  const analytics =
    m.status === 'complete' && completedAt
      ? {
          startedAt: m.startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          durationMs: new Date(completedAt).getTime() - new Date(m.startedAt).getTime(),
          totalTokens: m.totalTokens,
          estCostUsd: m.estCostUsd,
          messages: data.messages.length,
          graphNodes: data.nodes.length,
          graphEdges: data.edges.length,
        }
      : null;

  return {
    id: m.id,
    name: m.name,
    template: m.template,
    prompt: m.prompt,
    status: m.status,
    provider: m.provider,
    model: m.model,
    startedAt: m.startedAt.toISOString(),
    completedAt: completedAt ? completedAt.toISOString() : null,
    totalTokens: m.totalTokens,
    estCostUsd: m.estCostUsd,
    agents: data.agents.map((a) => ({
      id: a.id,
      role: a.role as AgentRole,
      name: a.name,
      avatar: a.avatar,
      status: a.status as 'idle' | 'thinking' | 'working' | 'done' | 'failed',
      phase: a.phase ?? 'idle',
      confidence: a.confidence,
      iterations: a.iterations,
      tokensUsed: a.tokensUsed,
    })),
    messages: data.messages.map((msg) => ({
      id: msg.id,
      agentId: msg.agentId,
      role: msg.agent.role as AgentRole,
      type: msg.type as MissionDetailDto['messages'][number]['type'],
      content: msg.content,
      seq: msg.seq,
      meta: msg.meta ?? undefined,
      createdAt: msg.createdAt.toISOString(),
    })),
    nodes: data.nodes.map((n) => ({ id: n.id, label: n.label, kind: n.kind as 'concept' | 'entity' | 'fact' | 'claim', group: n.group, weight: n.weight })),
    edges: data.edges.map((e) => ({ id: e.id, sourceId: e.sourceId, targetId: e.targetId, label: e.label ?? undefined })),
    report: data.report
      ? {
          summary: data.report.summary,
          keyFindings: JSON.parse(data.report.keyFindings ?? '[]'),
          risks: JSON.parse(data.report.risks ?? '[]'),
          verdict: data.report.verdict ?? '',
        }
      : null,
    analytics,
  };
}

async function loadMissionCore(id: string) {
  return prisma.mission.findUnique({ where: { id } });
}

export function createMissionRouter(emit: EmitFn): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', provider: resolveProvider(), model: currentModel(), uptime: process.uptime() });
  });

  router.get('/templates', (_req: Request, res: Response) => {
    res.json({ data: TEMPLATES });
  });

  router.get('/agents', (_req: Request, res: Response) => {
    res.json({ data: Object.values(AGENT_ROSTER) });
  });

  router.get('/missions', async (req: Request, res: Response) => {
    try {
      const raw = Number(req.query.limit);
      const limit = Number.isFinite(raw) ? Math.min(100, Math.max(1, Math.floor(raw))) : 50;
      const missions = await prisma.mission.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          template: true,
          prompt: true,
          status: true,
          provider: true,
          model: true,
          startedAt: true,
          completedAt: true,
          totalTokens: true,
          estCostUsd: true,
          createdAt: true,
        },
      });
      res.json({ data: missions });
    } catch (err) {
      logger.error('list missions failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to load missions.', details: {} } });
    }
  });

  router.post('/missions', async (req: Request, res: Response) => {
    if (rateLimited(req.ip ?? 'unknown')) {
      res.status(429).json({ error: { code: 'RATE_LIMITED', message: `Too many launches. Chill for ${Math.ceil(RATE_LIMIT.windowMs / 1000)}s.`, details: {} } });
      return;
    }

    const parsed = launchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: { code: 'VALIDATION', message: parsed.error.issues[0]?.message ?? 'Invalid mission payload.', details: {} } });
      return;
    }

    const input = parsed.data as LaunchMissionInput;
    try {
      getTemplate(input.template); // throws if unknown
    } catch {
      res.status(400).json({ error: { code: 'UNKNOWN_TEMPLATE', message: `Unknown template "${input.template}".`, details: {} } });
      return;
    }

    let order: string[];
    try {
      ({ order } = resolveConfiguration(input.template, input.config));
    } catch {
      res.status(400).json({ error: { code: 'INVALID_AGENTS', message: 'Agent list must be non-empty and contain only known roles.', details: {} } });
      return;
    }
    if (!validateAgentOrder(order)) {
      res.status(400).json({ error: { code: 'INVALID_AGENTS', message: 'Agent list must be non-empty and contain only executable roles.', details: {} } });
      return;
    }

    try {
      const mission = await prisma.mission.create({
        data: {
          name: input.name?.trim() || `${getTemplate(input.template).title} · ${new Date().toLocaleTimeString()}`,
          template: input.template,
          prompt: input.prompt.trim(),
          status: 'queued',
          provider: resolveProvider(),
          model: currentModel(),
        },
      });

      const orchestratorEmit: OrchestratorEmit = {
        agentUpdate: (payload) => emit('agent:update', payload),
        agentMessage: (payload) => emit('agent:message', payload),
        agentChunk: (payload) => emit('agent:chunk', payload),
        graphUpdate: (payload) => emit('graph:update', payload),
        missionComplete: (payload) => emit('mission:complete', payload),
        missionFailed: (payload) => emit('mission:failed', payload),
        log: (level, message, meta) => emit('log', { level, message, ts: new Date().toISOString(), ...meta }),
      };

      const orchestrator = new Orchestrator({
        missionId: mission.id,
        name: mission.name,
        templateKey: input.template,
        prompt: mission.prompt,
        order,
        runSeed: Date.now() % 100000,
        emit: orchestratorEmit,
        providerName: resolveProvider(),
      });

      emit('mission:created', { missionId: mission.id, name: mission.name, startedAt: mission.startedAt.toISOString() });

      void orchestrator.start();
      recordLaunch(req.ip ?? 'unknown');

      res.status(201).json({ data: { id: mission.id, status: 'running' } });
    } catch (err) {
      logger.error('launch mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to launch mission.', details: {} } });
    }
  });

  router.get('/missions/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const mission = await loadMissionCore(id);
      if (!mission) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mission not found.', details: {} } });
        return;
      }
      const [agents, messages, nodes, edges, report] = await Promise.all([
        prisma.agent.findMany({ where: { missionId: id }, orderBy: { startedAt: 'asc' } }),
        prisma.agentMessage.findMany({
          where: { agent: { missionId: id } },
          orderBy: { seq: 'asc' },
          include: { agent: { select: { role: true } } },
        }),
        prisma.knowledgeNode.findMany({ where: { missionId: id } }),
        prisma.knowledgeEdge.findMany({ where: { missionId: id } }),
        prisma.missionReport.findUnique({ where: { missionId: id } }),
      ]);
      res.json({ data: toDetailDto({ mission, agents, messages, nodes, edges, report }) });
    } catch (err) {
      logger.error('get mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to load mission.', details: {} } });
    }
  });

  router.delete('/missions/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const existing = await loadMissionCore(id);
      if (!existing) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mission not found.', details: {} } });
        return;
      }
      await prisma.mission.delete({ where: { id } });
      res.json({ data: { deleted: true } });
    } catch (err) {
      logger.error('delete mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to delete mission.', details: {} } });
    }
  });

  return router;
}