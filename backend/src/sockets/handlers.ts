import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { z } from 'zod';
import { logger } from '../lib/logger';
import { getTemplate, resolveConfiguration } from '../orchestrator/templates';
import { Orchestrator, type OrchestratorEmit } from '../orchestrator/orchestrator';
import prisma from '../lib/prisma';
import { resolveProvider, currentModel } from '../llm/provider';
import type { AgentRole } from '../types';

const emitAll = (io: Server) => (event: string, payload: Record<string, unknown>) => {
  io.emit(event, payload);
};

const launchSchema = z.object({
  name: z.string().max(80).optional(),
  template: z.string().min(1).max(40),
  prompt: z.string().min(3).max(2000),
  config: z.object({ agents: z.array(z.string()).max(8).optional() }).optional(),
});

export function wireSockets(io: Server, _server: HttpServer): void {
  io.on('connection', (socket) => {
    socket.on('mission:launch', async (payload: unknown) => {
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
      } catch {
        socket.emit('mission:error', { message: `Unknown template "${input.template}".` });
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

        const emit = emitAll(io);
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