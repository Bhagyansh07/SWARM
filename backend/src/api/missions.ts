import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { logger } from '../lib/logger';
import { Orchestrator } from '../orchestrator/orchestrator';
import { getTemplate, resolveConfiguration, validateAgentOrder } from '../orchestrator/templates';
import { AGENT_ROSTER, TEMPLATES, type LaunchMissionInput, type MissionDetailDto } from '../types';
import { resolveProvider, currentModel } from '../llm/provider';
import { missionLaunchRateLimit, createRateLimiter } from '../lib/rate-limit';
import { runInBackground } from '../lib/background';
import { getStore, type MissionRecord } from '../lib/store';

const launchSchema = z.object({
  name: z.string().max(80).optional(),
  template: z.string().min(1).max(40),
  prompt: z.string().min(3).max(2000),
  config: z.object({ agents: z.array(z.string()).max(8).optional() }).optional(),
});

const launchLimiter = createRateLimiter(missionLaunchRateLimit);

function toDetailDto(record: MissionRecord): MissionDetailDto & { chunks: Record<string, string>; error: string | null } {
  return {
    id: record.id,
    name: record.name,
    template: record.template,
    prompt: record.prompt,
    status: record.status,
    provider: record.provider,
    model: record.model,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    totalTokens: record.totalTokens,
    estCostUsd: record.estCostUsd,
    agents: record.agents,
    messages: record.messages,
    nodes: record.nodes,
    edges: record.edges,
    chunks: record.chunks ?? {},
    report: record.report,
    analytics: record.analytics,
    error: record.error ?? null,
  };
}

export function createMissionRouter(): Router {
  const router = Router();
  const store = getStore();

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', provider: resolveProvider(), model: currentModel() });
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
      res.json({ data: await store.list(limit) });
    } catch (err) {
      logger.error('list missions failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to load missions.', details: {} } });
    }
  });

  router.post('/missions', async (req: Request, res: Response) => {
    if (launchLimiter.limited(req.ip ?? 'unknown')) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: `Too many launches. Chill for ${Math.ceil(missionLaunchRateLimit.windowMs / 1000)}s.`,
          details: {},
        },
      });
      return;
    }

    const parsed = launchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: { code: 'VALIDATION', message: parsed.error.issues[0]?.message ?? 'Invalid mission payload.', details: {} } });
      return;
    }

    const input = parsed.data as LaunchMissionInput;
    try {
      getTemplate(input.template);
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
      const now = new Date();
      const stamp = now.toISOString().slice(11, 16);
      const record: MissionRecord = {
        id: randomUUID(),
        name: input.name?.trim() || `${getTemplate(input.template).title} · ${stamp}`,
        template: input.template,
        prompt: input.prompt.trim(),
        order,
        status: 'queued',
        provider: resolveProvider(),
        model: currentModel(),
        startedAt: now.toISOString(),
        completedAt: null,
        createdAt: now.toISOString(),
        totalTokens: 0,
        estCostUsd: 0,
        shareToken: null,
        error: null,
        agents: [],
        messages: [],
        nodes: [],
        edges: [],
        chunks: {},
        report: null,
        analytics: null,
      };

      // Persist the queued mission *before* responding so the client can poll it
      // immediately, then hand the run to the background.
      await store.create(record);
      const orchestrator = new Orchestrator({ record, store, runSeed: Date.now() % 100000 });
      runInBackground(orchestrator.start(), `mission:${record.id}`);
      launchLimiter.record(req.ip ?? 'unknown');

      res.status(201).json({ data: { id: record.id, status: 'queued' } });
    } catch (err) {
      logger.error('launch mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to launch mission.', details: {} } });
    }
  });

  router.post('/missions/:id/share', async (req: Request, res: Response) => {
    try {
      const record = await store.get(req.params.id);
      if (!record) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mission not found.', details: {} } });
        return;
      }
      const token = record.shareToken ?? randomUUID();
      if (!record.shareToken) {
        record.shareToken = token;
        await store.setShareToken(record.id, token);
        await store.save(record);
      }
      res.json({ data: { token } });
    } catch (err) {
      logger.error('share mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to create share link.', details: {} } });
    }
  });

  router.get('/shared/:token', async (req: Request, res: Response) => {
    try {
      const record = await store.findByShareToken(req.params.token);
      if (!record) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Shared mission not found.', details: {} } });
        return;
      }
      res.json({ data: toDetailDto(record) });
    } catch (err) {
      logger.error('get shared mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to load shared mission.', details: {} } });
    }
  });

  router.get('/missions/:id', async (req: Request, res: Response) => {
    try {
      const record = await store.get(req.params.id);
      if (!record) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mission not found.', details: {} } });
        return;
      }
      res.json({ data: toDetailDto(record) });
    } catch (err) {
      logger.error('get mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to load mission.', details: {} } });
    }
  });

  router.delete('/missions/:id', async (req: Request, res: Response) => {
    try {
      const record = await store.get(req.params.id);
      if (!record) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mission not found.', details: {} } });
        return;
      }
      await store.remove(req.params.id);
      res.json({ data: { deleted: true } });
    } catch (err) {
      logger.error('delete mission failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to delete mission.', details: {} } });
    }
  });

  return router;
}
