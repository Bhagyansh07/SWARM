import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger';
import { AGENT_ROSTER, type AgentRole, type AgentStatus } from '../types';
import { ResearcherAgent } from '../agents/researcher';
import { AnalystAgent } from '../agents/analyst';
import { CriticAgent } from '../agents/critic';
import { SynthesizerAgent } from '../agents/synthesizer';
import { Agent, type AgentRuntime } from '../agents/base';
import { estimateTokenCost } from '../lib/pricing';
import { llmTurn } from '../llm/provider';
import type { MissionRecord, MissionStore } from '../lib/store';

function kindToType(kind: string): 'concept' | 'entity' | 'fact' | 'claim' {
  if (kind === 'entity' || kind === 'fact' || kind === 'claim') return kind;
  return 'concept';
}

const FINDING_TYPES = new Set(['evidence', 'thought', 'finding', 'insight', 'critique', 'synthesis']);
const MIN_SAVE_INTERVAL_MS = 220;

// Serverless functions are capped in wall-clock time. Keep the whole run well
// inside that cap so a mission always converges and persists.
const MISSION_BUDGET_MS = Number(process.env.MISSION_BUDGET_MS ?? 45000);

/**
 * Drives a mission: each executable agent takes a turn, appending messages,
 * telemetry and knowledge-graph nodes to the in-memory {@link MissionRecord}. The
 * record is flushed to the {@link MissionStore} on a throttle so pollers see the
 * mission evolve in near-real time.
 */
export class Orchestrator {
  private readonly record: MissionRecord;
  private readonly store: MissionStore;
  private readonly runSeed: number;
  private readonly startedAtMs: number;
  private sharedFindings: string[] = [];
  private readonly nodeIdByLabel = new Map<string, string>();
  private readonly edgeKeys = new Set<string>();
  private seq = 0;
  private nodeCounter = 0;
  private running = false;

  // Persistence throttle state.
  private saving = false;
  private dirty = false;
  private lastSaveAt = 0;
  private trailing: ReturnType<typeof setTimeout> | null = null;

  constructor(args: { record: MissionRecord; store: MissionStore; runSeed: number }) {
    this.record = args.record;
    this.store = args.store;
    this.runSeed = args.runSeed;
    this.startedAtMs = Date.parse(args.record.startedAt) || Date.now();
    this.seq = this.record.messages.reduce((max, m) => Math.max(max, m.seq), 0);
    for (const node of this.record.nodes) this.nodeIdByLabel.set(node.label, node.id);
    for (const edge of this.record.edges) this.edgeKeys.add(`${edge.sourceId}|${edge.targetId}|${edge.label ?? ''}`);
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    this.record.status = 'running';
    this.record.startedAt = new Date(this.startedAtMs).toISOString();
    await this.persist(true);
    logger.info('mission started', { id: this.record.id, name: this.record.name, order: this.record.order });

    try {
      const deadline = Date.now() + MISSION_BUDGET_MS;
      for (let index = 0; index < this.record.order.length; index += 1) {
        const role = this.record.order[index] as AgentRole;
        if (!(role in AGENT_ROSTER) || role === 'orchestrator') continue;
        if (Date.now() >= deadline) {
          logger.warn('mission budget reached, converging early', { id: this.record.id, remaining: this.record.order.slice(index) });
          break;
        }

        const confidence = await this.runAgent(role);
        if (role === 'critic' && confidence < 0.4) {
          const rebuttalRole = [...this.record.order.slice(0, index)]
            .reverse()
            .find((candidate) => candidate === 'researcher' || candidate === 'analyst') as
            | 'researcher'
            | 'analyst'
            | undefined;
          if (rebuttalRole) await this.runRebuttal(rebuttalRole);
        }
      }

      await this.complete();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('mission failed', { id: this.record.id, error: message });
      this.record.status = 'failed';
      this.record.error = message;
      this.record.completedAt = new Date().toISOString();
      await this.persist(true);
    } finally {
      this.running = false;
    }
  }

  private async runAgent(role: AgentRole): Promise<number> {
    const meta = AGENT_ROSTER[role];
    const agent = {
      id: randomUUID(),
      role,
      name: meta.name,
      avatar: meta.avatar,
      status: 'thinking' as AgentStatus,
      phase: 'initialize',
      confidence: 0,
      iterations: 1,
      tokensUsed: 0,
      estCostUsd: 0,
    };
    this.record.agents.push(agent);
    await this.persist(true);

    const runtime: AgentRuntime = {
      missionId: this.record.id,
      missionName: this.record.name,
      prompt: this.record.prompt,
      template: this.record.template,
      getSharedFindings: () => [...this.sharedFindings],
      runSeed: this.runSeed,
      onUpdate: (patch) => {
        agent.status = patch.status as AgentStatus;
        agent.phase = patch.phase;
        agent.confidence = patch.confidence;
        agent.iterations = patch.iterations;
        const delta = Math.max(0, patch.tokensUsed);
        agent.tokensUsed += delta;
        agent.estCostUsd = estimateTokenCost(agent.tokensUsed);
        this.record.totalTokens += delta;
        void this.persist();
      },
      onMessage: (type, content, metaStr) => this.pushMessage(agent.id, role, type, content, metaStr),
      onChunk: (chunk) => {
        const current = this.record.chunks[agent.id] ?? '';
        this.record.chunks[agent.id] = (current + chunk).slice(-2400);
        void this.persist();
      },
      onGraph: (nodes, edges) => {
        this.mergeGraph(nodes, edges);
        void this.persist(true);
      },
    };

    const impl = this.buildAgent(role, runtime);
    await impl.run();

    agent.status = 'done';
    await this.persist(true);
    return agent.confidence;
  }

  private async runRebuttal(role: 'researcher' | 'analyst'): Promise<void> {
    const meta = AGENT_ROSTER[role];
    const agent = {
      id: randomUUID(),
      role,
      name: meta.name,
      avatar: meta.avatar,
      status: 'working' as AgentStatus,
      phase: 'rebuttal',
      confidence: 0.55,
      iterations: 1,
      tokensUsed: 0,
      estCostUsd: 0,
    };
    this.record.agents.push(agent);
    await this.persist(true);

    const result = await llmTurn({
      role,
      prompt: `Mission objective: ${this.record.prompt}\n\nThe critic has challenged the current direction. As the ${role.toUpperCase()}, write a concise REBUTTAL: answer the strongest criticism with evidence, revise any weak claim, and state what remains uncertain. Label it as a rebuttal.`,
      name: meta.name,
      missionName: this.record.name,
      template: this.record.template,
      previousFindings: [...this.sharedFindings],
      systemPrompt: `You are ${meta.name}, providing a focused rebuttal after an adversarial review. Be specific and honest.`,
      runSeed: this.runSeed + 1,
      onChunk: (chunk) => {
        const current = this.record.chunks[agent.id] ?? '';
        this.record.chunks[agent.id] = (current + chunk).slice(-2400);
        void this.persist();
      },
    });

    const content = result.content.trim() || 'Rebuttal produced no additional evidence.';
    this.pushMessage(agent.id, role, 'rebuttal', content);
    agent.tokensUsed = result.tokensUsed;
    agent.estCostUsd = estimateTokenCost(result.tokensUsed);
    this.record.totalTokens += result.tokensUsed;
    agent.status = 'done';
    agent.phase = 'rebuttal:complete';
    await this.persist(true);
  }

  private pushMessage(agentId: string, role: AgentRole, type: string, content: string, metaStr?: string): void {
    this.seq += 1;
    const trimmed = content.trim();
    if (trimmed.length > 16 && FINDING_TYPES.has(type)) {
      this.sharedFindings.push(trimmed);
      if (this.sharedFindings.length > 14) this.sharedFindings.splice(0, this.sharedFindings.length - 14);
    }
    this.record.messages.push({
      id: `${agentId}-${this.seq}`,
      agentId,
      role,
      type: type as MissionRecord['messages'][number]['type'],
      content,
      seq: this.seq,
      meta: metaStr,
      createdAt: new Date().toISOString(),
    });
    this.record.chunks[agentId] = '';
    void this.persist(true);
  }

  private mergeGraph(
    nodes: Array<{ label: string; kind: string; group: number; weight: number }>,
    edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }>,
  ): void {
    for (const incoming of nodes) {
      if (this.nodeIdByLabel.has(incoming.label)) continue;
      this.nodeCounter += 1;
      const id = `n${this.nodeCounter}`;
      this.nodeIdByLabel.set(incoming.label, id);
      this.record.nodes.push({
        id,
        label: incoming.label,
        kind: kindToType(incoming.kind),
        group: incoming.group,
        weight: incoming.weight,
      });
    }

    for (const edge of edges) {
      const sourceId = this.nodeIdByLabel.get(edge.sourceLabel);
      const targetId = this.nodeIdByLabel.get(edge.targetLabel);
      if (!sourceId || !targetId) continue;
      const key = `${sourceId}|${targetId}|${edge.label ?? ''}`;
      if (this.edgeKeys.has(key)) continue;
      this.edgeKeys.add(key);
      this.record.edges.push({ id: randomUUID(), sourceId, targetId, label: edge.label });
    }
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

  private async complete(): Promise<void> {
    const findings = this.record.messages.map((m) => m.content).slice(0, 14);
    const summary = this.synthesizeReport(findings);

    this.record.report = {
      summary,
      keyFindings: findings.slice(0, 5),
      risks: findings.slice(5, 8),
      verdict: summary.split('\n')[0],
    };

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - this.startedAtMs;
    this.record.status = 'complete';
    this.record.completedAt = completedAt.toISOString();
    this.record.estCostUsd = estimateTokenCost(this.record.totalTokens);
    this.record.analytics = {
      startedAt: this.record.startedAt,
      completedAt: completedAt.toISOString(),
      durationMs,
      totalTokens: this.record.totalTokens,
      estCostUsd: this.record.estCostUsd,
      messages: this.record.messages.length,
      graphNodes: this.record.nodes.length,
      graphEdges: this.record.edges.length,
    };

    await this.persist(true);
    logger.info('mission complete', {
      id: this.record.id,
      durationMs,
      tokens: this.record.totalTokens,
      nodes: this.record.nodes.length,
      edges: this.record.edges.length,
    });
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

  /** Throttled, serialised snapshot writes: newest state always wins. */
  private async persist(force = false): Promise<void> {
    this.dirty = true;

    if (this.trailing) {
      clearTimeout(this.trailing);
      this.trailing = null;
    }
    if (this.saving) return;

    const elapsed = Date.now() - this.lastSaveAt;
    if (!force && elapsed < MIN_SAVE_INTERVAL_MS) {
      this.trailing = setTimeout(() => {
        this.trailing = null;
        void this.persist();
      }, MIN_SAVE_INTERVAL_MS - elapsed);
      return;
    }

    this.saving = true;
    try {
      do {
        this.dirty = false;
        this.lastSaveAt = Date.now();
        try {
          await this.store.save(this.record);
        } catch (err) {
          logger.warn('mission persist failed', {
            id: this.record.id,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } while (this.dirty);
    } finally {
      this.saving = false;
    }
  }
}
