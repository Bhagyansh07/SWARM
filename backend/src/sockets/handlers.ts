import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { z } from 'zod';
import { logger } from '../lib/logger';
import { getTemplate, resolveConfiguration } from '../orchestrator/templates';
import { Orchestrator, type OrchestratorEmit } from '../orchestrator/orchestrator';
import prisma from '../lib/prisma';
import { resolveProvider, currentModel } from '../llm/provider';
import type { AgentRole } from '../types';

const roomFor = (missionId: string) => `mission:${missionId}`;

const emitToMission = (io: Server) => (event: string, payload: Record<string, unknown>) => {
  const missionId = typeof payload.missionId === 'string' ? payload.missionId : null;
  if (missionId) io.to(roomFor(missionId)).emit(event, payload);
};

const launchSchema = z.object({
  name: z.string().max(80).optional(),
  template: z.string().min(1).max(40),
  prompt: z.string().min(3).max(2000),
  config: z.object({ agents: z.array(z.string()).max(8).optional() }).optional(),
});

const joinSchema = z.object({ missionId: z.string().min(1).max(80) });
const launchHits = new Map<string, number[]>();
const SOCKET_RATE_LIMIT = { windowMs: 60_000, max: 12 };

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (launchHits.get(key) ?? []).filter((timestamp) => now - timestamp < SOCKET_RATE_LIMIT.windowMs);
  launchHits.set(key, hits);
  return hits.length >= SOCKET_RATE_LIMIT.max;
}

function recordLaunch(key: string): void {
  launchHits.set(key, [...(launchHits.get(key) ?? []), Date.now()]);
}

export function wireSockets(io: Server, _server: HttpServer): void {
  io.on('connection', (socket) => {
    const rateLimitKey = socket.handshake.address || socket.id;

    socket.on('mission:join', async (payload: unknown) => {
      const parsed = joinSchema.safeParse(payload);
      if (!parsed.success) return;
      const mission = await prisma.mission.findUnique({ where: { id: parsed.data.missionId }, select: { id: true } });
      if (mission) socket.join(roomFor(mission.id));
    });

    socket.on('mission:launch', async (payload: unknown) => {
      if (isRateLimited(rateLimitKey)) {
        socket.emit('mission:error', { message: `Too many launches. Chill for ${Math.ceil(SOCKET_RATE_LIMIT.windowMs / 1000)}s.` });
        return;
      }
      const parsed = launchSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit('mission:error', { message: parsed.error.issues[0]?.message ?? 'Invalid mission payload.' });
        return;
      }
      const input = parsed.data as { name?: string; template: string; prompt: string; config?: { agents?: string[] } };

      let order: string[];
      try {
        const cfg = input.config ? { agents: input.config.agents as AgentRole[] } : undefined;
        ({ order } = resolveConfiguration(input.template, cfg));
      } catch (err) {
        socket.emit('mission:error', { message: err instanceof Error && err.message.includes('invalid agent') ? 'Invalid agent configuration.' : `Unknown template "${input.template}".` });
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

        socket.join(roomFor(mission.id));
        recordLaunch(rateLimitKey);
        const emit = emitToMission(io);
        const evt: OrchestratorEmit = {
          agentUpdate: (p) => emit('agent:update', p),
          agentMessage: (p) => emit('agent:message', p),
          agentChunk: (p) => emit('agent:chunk', p),
          graphUpdate: (p) => emit('graph:update', p),
          missionComplete: (p) => emit('mission:complete', p),
          missionFailed: (p) => emit('mission:failed', p),
          log: (level, message, meta) => emit('log', { level, message, ts: new Date().toISOString(), ...meta }),
        };

        socket.emit('mission:created', { missionId: mission.id, name: mission.name, startedAt: mission.startedAt.toISOString() });

        const orchestrator = new Orchestrator({
          missionId: mission.id,
          name: mission.name,
          templateKey: input.template,
          prompt: mission.prompt,
          order,
          runSeed: Date.now() % 100000,
          emit: evt,
          providerName: resolveProvider(),
        });

        void orchestrator.start();
      } catch (err) {
        logger.error('socket launch failed', { error: err instanceof Error ? err.message : String(err) });
        socket.emit('mission:error', { message: 'Failed to launch mission.' });
      }
    });

    socket.on('disconnect', () => {
      logger.debug('client disconnected', { id: socket.id });
    });
  });
}