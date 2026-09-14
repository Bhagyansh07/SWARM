import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { AGENT_ROSTER, type AgentRole } from '../types';
import { ResearcherAgent } from '../agents/researcher';
import { AnalystAgent } from '../agents/analyst';
import { CriticAgent } from '../agents/critic';
import { SynthesizerAgent } from '../agents/synthesizer';
import { Agent, type AgentRuntime } from '../agents/base';
import { estimateTokenCost } from '../lib/pricing';
import { llmTurn } from '../llm/provider';

export interface OrchestratorEmit {
  agentUpdate: (payload: Record<string, unknown>) => void;
  agentMessage: (payload: Record<string, unknown>) => void;
  agentChunk: (payload: Record<string, unknown>) => void;
  graphUpdate: (payload: Record<string, unknown>) => void;
  missionComplete: (payload: Record<string, unknown>) => void;
  missionFailed: (payload: Record<string, unknown>) => void;
  log: (level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) => void;
}

function kindToType(kind: string): 'concept' | 'entity' | 'fact' | 'claim' {
  if (kind === 'entity' || kind === 'fact' || kind === 'claim') return kind;
  return 'concept';
}

export class Orchestrator {
  private missionId: string;
  private name: string;
  private templateKey: string;
  private prompt: string;
  private order: string[];
  private runSeed: number;
  private emit: OrchestratorEmit;
  private sharedFindings: string[] = [];
  private running = false;
  private providerName = 'simulation';
  private agentNamesById = new Map<string, { role: AgentRole; name: string }>();
  private totalTokens = 0;
  private startedAt = new Date();
  private pendingWrites: Promise<unknown>[] = [];

  constructor(args: {
    missionId: string;
    name: string;
    templateKey: string;
    prompt: string;
    order: string[];
    runSeed: number;
    emit: OrchestratorEmit;
    providerName: string;
  }) {
    this.missionId = args.missionId;
    this.name = args.name;
    this.templateKey = args.templateKey;
    this.prompt = args.prompt;
    this.order = args.order;
    this.runSeed = args.runSeed;
    this.emit = args.emit;
    this.providerName = args.providerName;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      const mission = await prisma.mission.update({
        where: { id: this.missionId },
        data: { status: 'running', provider: this.providerName, startedAt: this.startedAt },
      });
      logger.info('mission started', { id: mission.id, name: this.name, order: this.order });
      this.emit.log('info', 'mission started', { id: mission.id, name: this.name, order: this.order });

      for (let index = 0; index < this.order.length; index += 1) {
        const role = this.order[index];
        if (role === 'orchestrator' || role === 'researcher' || role === 'analyst' || role === 'critic' || role === 'synthesizer') {
          const confidence = await this.runAgent(role);
          if (role === 'critic' && confidence < 0.4) {
            const rebuttalRole = [...this.order.slice(0, index)].reverse().find((candidate) => candidate === 'researcher' || candidate === 'analyst');
            if (rebuttalRole) await this.runRebuttal(rebuttalRole);
          }
        }
      }

      await this.complete();
    } catch (err) {
      logger.error('mission failed', { id: this.missionId, error: err instanceof Error ? err.message : String(err) });
      await prisma.mission.update({ where: { id: this.missionId }, data: { status: 'failed' } });
      this.emit.missionFailed({ missionId: this.missionId, error: err instanceof Error ? err.message : String(err) });
      this.emit.log('error', 'mission failed', { id: this.missionId, error: err instanceof Error ? err.message : String(err) });
    } finally {
      this.running = false;
    }
  }

  private async runAgent(role: AgentRole): Promise<number> {
    const meta = AGENT_ROSTER[role];
    const dbAgent = await prisma.agent.create({
      data: {
        missionId: this.missionId,
        role,
        name: meta.name,
        avatar: meta.avatar,
        status: 'thinking',
        phase: 'initialize',
        startedAt: new Date(),
      },
    });
    this.agentNamesById.set(dbAgent.id, { role, name: meta.name });

    let agentTokens = 0;
    const patchTs = (patch: { status: string; phase: string; confidence: number; iterations: number; tokensUsed: number }) => {
      agentTokens += Math.max(0, patch.tokensUsed);
      this.totalTokens += Math.max(0, patch.tokensUsed);
      this.pendingWrites.push(
        prisma.agent.update({
          where: { id: dbAgent.id },
          data: {
            status: patch.status,
            phase: patch.phase,
            confidence: patch.confidence,
            iterations: patch.iterations,
            tokensUsed: agentTokens,
          },
        }).catch((err) => logger.warn('agent update failed', { error: err instanceof Error ? err.message : String(err) })),
      );
      this.emit.agentUpdate({
        missionId: this.missionId,
        agent: {
          id: dbAgent.id,
          role,
          name: meta.name,
          avatar: meta.avatar,
          status: patch.status,
          phase: patch.phase,
          confidence: patch.confidence,
          iterations: patch.iterations,
          tokensUsed: agentTokens,
          estCostUsd: estimateTokenCost(agentTokens),
        },
      });
    };

    let seq = await prisma.agentMessage.count({ where: { agent: { missionId: this.missionId } } });

    const pushMessage = (type: string, content: string, metaStr?: string) => {
      seq += 1;
      if (content.trim().length > 16 && (type === 'evidence' || type === 'thought' || type === 'finding' || type === 'insight' || type === 'critique' || type === 'synthesis')) {
        this.sharedFindings.push(content.trim());
      }
      if (this.sharedFindings.length > 14) this.sharedFindings.splice(0, this.sharedFindings.length - 14);
      this.pendingWrites.push(
        prisma.agentMessage
          .create({
            data: { agentId: dbAgent.id, seq, type, content, meta: metaStr },
          })
          .catch((err) => logger.warn('message persist failed', { error: err instanceof Error ? err.message : String(err) })),
      );
      this.emit.agentMessage({
        missionId: this.missionId,
        message: { id: `${dbAgent.id}-${seq}`, agentId: dbAgent.id, role, type, content, seq },
      });
    };

    const emitChunk = (chunk: string) => {
      this.emit.agentChunk({ missionId: this.missionId, agentId: dbAgent.id, role, chunk });
    };

    const emitGraph = (
      nodes: Array<{ label: string; kind: string; group: number; weight: number }>,
      edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }>,
    ) => {
      this.pendingWrites.push(
        this.persistAndEmitGraph(nodes, edges).catch((err) =>
          logger.warn('graph persist failed', { error: err instanceof Error ? err.message : String(err) }),
        ),
      );
    };

    const runtime: AgentRuntime = {
      missionId: this.missionId,
      missionName: this.name,
      prompt: this.prompt,
      template: this.templateKey,
      getSharedFindings: () => [...this.sharedFindings],
      runSeed: this.runSeed,
      onUpdate: patchTs,
      onMessage: pushMessage,
      onChunk: emitChunk,
      onGraph: emitGraph,
    };

    const agent = this.buildAgent(role, runtime);
    await agent.run();

    const flush = this.pendingWrites.splice(0);
    await Promise.all(flush);

    await prisma.agent.update({
      where: { id: dbAgent.id },
      data: { status: 'done', finishedAt: new Date() },
    });
    return Number((await prisma.agent.findUnique({ where: { id: dbAgent.id }, select: { confidence: true } }))?.confidence ?? 0);
  }

  private async runRebuttal(role: 'researcher' | 'analyst'): Promise<void> {
    const meta = AGENT_ROSTER[role];
    const dbAgent = await prisma.agent.create({
      data: { missionId: this.missionId, role, name: meta.name, avatar: meta.avatar, status: 'working', phase: 'rebuttal', startedAt: new Date() },
    });
    let seq = await prisma.agentMessage.count({ where: { agent: { missionId: this.missionId } } });
    const prior = this.sharedFindings;
    const result = await llmTurn({
      role,
      prompt: `Mission objective: ${this.prompt}\n\nThe critic has challenged the current direction. As the ${role.toUpperCase()}, write a concise REBUTTAL: answer the strongest criticism with evidence, revise any weak claim, and state what remains uncertain. Label it as a rebuttal.`,
      name: meta.name,
      missionName: this.name,
      template: this.templateKey,
      previousFindings: prior,
      systemPrompt: `You are ${meta.name}, providing a focused rebuttal after an adversarial review. Be specific and honest.`,
      runSeed: this.runSeed + 1,
      onChunk: (chunk) => this.emit.agentChunk({ missionId: this.missionId, agentId: dbAgent.id, role, chunk }),
    });
    const content = result.content.trim() || 'Rebuttal produced no additional evidence.';
    seq += 1;
    await prisma.agentMessage.create({ data: { agentId: dbAgent.id, seq, type: 'rebuttal', content } });
    this.sharedFindings.push(content);
    this.emit.agentMessage({ missionId: this.missionId, message: { id: `${dbAgent.id}-${seq}`, agentId: dbAgent.id, role, type: 'rebuttal', content, seq } });
    this.totalTokens += result.tokensUsed;
    await prisma.agent.update({ where: { id: dbAgent.id }, data: { status: 'done', phase: 'rebuttal:complete', confidence: 0.55, iterations: 1, tokensUsed: result.tokensUsed, finishedAt: new Date() } });
  }

  private buildAgent(role: AgentRole, runtime: AgentRuntime): Agent {
    switch (role) {
      case 'researcher':
        return new ResearcherAgent('researcher', runtime);
      case 'analyst':
        return new AnalystAgent('analyst', runtime);
      case 'critic':
        return new CriticAgent('critic', runtime);
      case 'synthesizer':
        return new SynthesizerAgent('synthesizer', runtime);
      default:
        throw new Error(`no agent implementation for ${role}`);
    }
  }

  private async persistAndEmitGraph(
    nodes: Array<{ label: string; kind: string; group: number; weight: number }>,
    edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }>,
  ): Promise<void> {
    const labelToId = new Map<string, string>();
    const persisted = [];

    for (const n of nodes) {
      if (labelToId.has(n.label)) continue;
      const existing = await prisma.knowledgeNode.findFirst({
        where: { missionId: this.missionId, label: n.label },
      });
      let node = existing;
      if (!node) {
        node = await prisma.knowledgeNode.create({
          data: { missionId: this.missionId, label: n.label, kind: kindToType(n.kind), group: n.group, weight: n.weight },
        });
      }
      labelToId.set(n.label, node.id);
      persisted.push({ id: node.id, label: node.label, kind: node.kind, group: node.group, weight: node.weight });
    }

    for (const e of edges) {
      let sId = labelToId.get(e.sourceLabel);
      let tId = labelToId.get(e.targetLabel);
      if (!sId) sId = (await prisma.knowledgeNode.findFirst({ where: { missionId: this.missionId, label: e.sourceLabel } }))?.id;
      if (!tId) tId = (await prisma.knowledgeNode.findFirst({ where: { missionId: this.missionId, label: e.targetLabel } }))?.id;
      if (sId) labelToId.set(e.sourceLabel, sId);
      if (tId) labelToId.set(e.targetLabel, tId);
      if (!sId || !tId) continue;
      const dup = await prisma.knowledgeEdge.findFirst({
        where: { missionId: this.missionId, sourceId: sId, targetId: tId, label: e.label ?? null },
      });
      if (dup) continue;
      await prisma.knowledgeEdge.create({
        data: { missionId: this.missionId, sourceId: sId, targetId: tId, label: e.label ?? null },
      });
    }

    const allNodes = await prisma.knowledgeNode.findMany({ where: { missionId: this.missionId } });
    const allEdges = await prisma.knowledgeEdge.findMany({ where: { missionId: this.missionId } });
    this.emit.graphUpdate({
      missionId: this.missionId,
      nodes: allNodes.map((n) => ({ id: n.id, label: n.label, kind: n.kind, group: n.group, weight: n.weight })),
      edges: allEdges.map((e) => ({ id: e.id, sourceId: e.sourceId, targetId: e.targetId, label: e.label ?? undefined })),
    });
  }

  private async complete(): Promise<void> {
    const [messages, nodes, edges, report] = await Promise.all([
      prisma.agentMessage.findMany({
        where: { agent: { missionId: this.missionId } },
        include: { agent: { select: { role: true } } },
        orderBy: { seq: 'asc' },
      }),
      prisma.knowledgeNode.findMany({ where: { missionId: this.missionId } }),
      prisma.knowledgeEdge.findMany({ where: { missionId: this.missionId } }),
      prisma.mission.findUnique({
        where: { id: this.missionId },
        include: { _count: { select: { agents: true } } },
      }),
    ]);

    const findings = messages.map((m) => m.content).slice(0, 14);
    const summary = this.synthesizeReport(findings);

    const representation = await prisma.missionReport.create({
      data: {
        missionId: this.missionId,
        summary,
        keyFindings: JSON.stringify(findings.slice(0, 5)),
        risks: JSON.stringify(findings.slice(5, 8)),
        verdict: summary.split('\n')[0],
      },
    });

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - this.startedAt.getTime();
    const estCostUsd = this.estimateCost(this.totalTokens);

    const mission = await prisma.mission.update({
      where: { id: this.missionId },
      data: {
        status: 'complete',
        completedAt,
        totalTokens: this.totalTokens,
        estCostUsd,
      },
    });

    const analytics = {
      startedAt: this.startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs,
      totalTokens: this.totalTokens,
      estCostUsd,
      messages: messages.length,
      graphNodes: nodes.length,
      graphEdges: edges.length,
    };

    this.emit.missionComplete({
      missionId: this.missionId,
      report: {
        summary: representation.summary,
        keyFindings: JSON.parse(representation.keyFindings ?? '[]'),
        risks: JSON.parse(representation.risks ?? '[]'),
        verdict: representation.verdict,
      },
      analytics,
    });

    logger.info('mission complete', { id: this.missionId, durationMs, tokens: this.totalTokens, nodes: nodes.length, edges: edges.length });
    this.emit.log('info', 'mission complete', { id: this.missionId, durationMs, tokens: this.totalTokens, nodes: nodes.length, edges: edges.length });
  }

  private synthesizeReport(findings: string[]): string {
    const verdict = findings[findings.length - 1] ?? 'Swarm converged without a dissenting verdict.';
    const key = findings.slice(0, 3);
    const risk = findings.slice(3, 5);
    const lines = [
      `VERDICT — ${verdict.slice(0, 180)}`,
      '',
      'KEY FINDINGS',
      ...key.map((k) => `- ${k.slice(0, 140)}`),
      '',
      'RISKS',
      ...(risk.length ? risk.map((r) => `- ${r.slice(0, 140)}`) : ['- No residual risks logged by the critic lane.']),
      '',
      `Swarm assembled by SWARM Orchestrator on ${new Date().toUTCString()}.`,
    ];
    return lines.join('\n');
  }

  private estimateCost(tokens: number): number {
    return estimateTokenCost(tokens);
  }
}