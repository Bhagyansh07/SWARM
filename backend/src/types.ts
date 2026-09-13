export type AgentRole = 'researcher' | 'analyst' | 'critic' | 'synthesizer' | 'orchestrator';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'done' | 'failed';

export type AgentPhase = 'initialize' | 'gather' | 'analyze' | 'synthesize' | 'converge' | string;

export type MessageType =
  | 'thought'
  | 'evidence'
  | 'critique'
  | 'synthesis'
  | 'narrative'
  | 'live_chunk'
  | 'system';

export interface AgentMeta {
  role: AgentRole;
  name: string;
  avatar: string;
  blurb: string;
  accent?: string;
}

export interface AgentStateDto {
  id: string;
  role: AgentRole;
  name: string;
  avatar: string;
  status: AgentStatus;
  phase: AgentPhase;
  confidence: number;
  iterations: number;
  tokensUsed: number;
}

export interface AgentMessageDto {
  id: string;
  agentId: string;
  role: AgentRole;
  type: MessageType;
  content: string;
  seq: number;
  meta?: string;
  createdAt?: string;
}

export interface KnowledgeNodeDto {
  id: string;
  label: string;
  kind: 'concept' | 'entity' | 'fact' | 'claim';
  group: number;
  weight: number;
}

export interface KnowledgeEdgeDto {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface AgentTurnInput {
  missionId: string;
  missionName: string;
  prompt: string;
  template: string;
  role: AgentRole;
  name: string;
  avatar: string;
  context: string[];
  previousFindings: string[];
}

export interface AgentTurnResult {
  messages: Array<{ type: MessageType; content: string }>;
  findings: string[];
  confidence: number;
  tokensUsed: number;
  graph?: {
    nodes: Array<{ label: string; kind: KnowledgeNodeDto['kind']; group: number; weight: number }>;
    edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }>;
  };
}

export interface MissionConfig {
  agents: AgentRole[];
}

export interface LaunchMissionInput {
  name?: string;
  template: string;
  prompt: string;
  config?: MissionConfig;
}

export interface MissionAnalytics {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalTokens: number;
  estCostUsd: number;
  messages: number;
  graphNodes: number;
  graphEdges: number;
}

export interface MissionDetailDto {
  id: string;
  name: string;
  template: string;
  prompt: string;
  status: string;
  provider: string;
  model: string;
  startedAt: string;
  completedAt: string | null;
  totalTokens: number;
  estCostUsd: number;
  agents: AgentStateDto[];
  messages: AgentMessageDto[];
  nodes: KnowledgeNodeDto[];
  edges: KnowledgeEdgeDto[];
  report: { summary: string; keyFindings: string[]; risks: string[]; verdict: string } | null;
  analytics: MissionAnalytics | null;
}

export interface TemplateDef {
  key: string;
  title: string;
  tagline: string;
  agents: AgentRole[];
  defaultPrompt: string;
  cta: string;
}

export const AGENT_ROSTER: Record<AgentRole, AgentMeta> = {
  researcher: { role: 'researcher', name: 'Kai', avatar: 'scan', blurb: 'Gathers evidence and maps territory.' },
  analyst: { role: 'analyst', name: 'Lyra', avatar: 'lens', blurb: 'Weighs patterns and quantifies confidence.' },
  critic: { role: 'critic', name: 'Vex', avatar: 'judge', blurb: 'Attacks weak logic. Refuses to be polite.' },
  synthesizer: { role: 'synthesizer', name: 'Nova', avatar: 'core', blurb: 'Converges the swarm into a final report.' },
  orchestrator: { role: 'orchestrator', name: 'Swarm Core', avatar: 'hub', blurb: 'Coordinates turns and keeps telemetry.' },
};

export const TEMPLATES: TemplateDef[] = [
  {
    key: 'deep_research',
    title: 'Deep Research',
    tagline: 'One question, four minds. Primary research, cross-checked, challenged, and synthesised.',
    agents: ['researcher', 'analyst', 'critic', 'synthesizer'],
    defaultPrompt: 'Map the current state of [topic], including key players, open problems, and likely next moves.',
    cta: 'Deploy research swarm',
  },
  {
    key: 'product_review',
    title: 'Product Post-mortem',
    tagline: 'Inspect a product or codebase the way an enraged senior engineer would.',
    agents: ['researcher', 'critic', 'analyst', 'synthesizer'],
    defaultPrompt: 'Evaluate [product]: architecture, failure modes, strengths, and what I would fix first.',
    cta: 'Deploy audit swarm',
  },
  {
    key: 'startup_validation',
    title: 'Startup Validation',
    tagline: 'A brutal adversarial review of an idea before investors get to it.',
    agents: ['researcher', 'critic', 'analyst', 'synthesizer'],
    defaultPrompt: 'Stress-test the idea [idea]. Market, moat, revenue model, and the top three reasons it dies.',
    cta: 'Deploy critic swarm',
  },
  {
    key: 'code_review',
    title: 'Code Review',
    tagline: 'Reason about a code change from correctness, security, and maintainability angles.',
    agents: ['analyst', 'critic', 'synthesizer', 'researcher'],
    defaultPrompt: 'Review this change: [paste diff or describe it]. Flag bugs, risks, and missing tests.',
    cta: 'Deploy review swarm',
  },
];