import type { AgentRole } from '../types';
import { AGENT_ROSTER } from '../types';

export interface AgentRuntime {
  missionId: string;
  missionName: string;
  prompt: string;
  template: string;
  getSharedFindings: () => string[];
  runSeed: number;
  onUpdate: (patch: {
    status: string;
    phase: string;
    confidence: number;
    iterations: number;
    tokensUsed: number;
  }) => void;
  onMessage: (type: string, content: string, meta?: string) => void;
  onChunk: (chunk: string) => void;
  onGraph: (nodes: Array<{ label: string; kind: string; group: number; weight: number }>, edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }>) => void;
}

export abstract class Agent {
  readonly role: AgentRole;
  protected ctx: AgentRuntime;

  constructor(role: AgentRole, ctx: AgentRuntime) {
    this.role = role;
    this.ctx = ctx;
  }

  abstract run(): Promise<void>;

  protected meta() {
    return AGENT_ROSTER[this.role];
  }

  protected systemPrompt(): string {
    return `You are ${this.meta().name}, the ${this.role} agent in the SWARM orchestration system. Speak plainly, technically, and specifically. Never say "I'm ready to help". Do the work: produce concrete findings, evidence, critiques, or a synthesis. Keep responses to 4-8 crisp sentences.`;
  }
}