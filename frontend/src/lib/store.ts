'use client';

import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type { AgentMessageDto, AgentStateDto, KnowledgeEdgeDto, KnowledgeNodeDto, MissionDetailDto } from '@/lib/types';

export interface LiveReport {
  summary: string;
  keyFindings: string[];
  risks: string[];
  verdict: string;
}

export interface LiveAnalytics {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalTokens: number;
  estCostUsd: number;
  messages: number;
  graphNodes: number;
  graphEdges: number;
}

interface SessionState {
  connected: boolean;
  missionId: string | null;
  missionName: string | null;
  status: string;
  provider: string | null;
  model: string | null;
  agents: Record<string, AgentStateDto>;
  messages: AgentMessageDto[];
  nodes: Record<string, KnowledgeNodeDto>;
  edges: KnowledgeEdgeDto[];
  chunks: Record<string, string>;
  report: LiveReport | null;
  analytics: LiveAnalytics | null;
  error: string | null;
  lastAgentId: string | null;

  connect: (missionId: string, initial: MissionDetailDto | null, onTransition: () => void) => void;
  disconnect: () => void;
  reset: () => void;
}

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:8080';

let socket: Socket | null = null;

const seedFrom = (initial: MissionDetailDto) => ({
  agents: Object.fromEntries(initial.agents.map((a) => [a.id, a] as const)),
  messages: [...initial.messages],
  nodes: Object.fromEntries(initial.nodes.map((n) => [n.id, n] as const)),
  edges: [...initial.edges],
  report: initial.report as LiveReport | null,
  analytics: initial.analytics as LiveAnalytics | null,
});

export const useSession = create<SessionState>((set, get) => ({
  connected: false,
  missionId: null,
  missionName: null,
  status: 'connecting',
  provider: null,
  model: null,
  agents: {},
  messages: [],
  nodes: {},
  edges: [],
  chunks: {},
  report: null,
  analytics: null,
  error: null,
  lastAgentId: null,

  reset: () => {
    set({
      missionId: null,
      missionName: null,
      status: 'connecting',
      provider: null,
      model: null,
      agents: {},
      messages: [],
      nodes: {},
      edges: [],
      chunks: {},
      report: null,
      analytics: null,
      error: null,
      lastAgentId: null,
    });
  },

  disconnect: () => {
    socket?.disconnect();
    socket = null;
    set({ connected: false, missionId: null, missionName: null });
  },

  connect: (missionId, initial, onTransition) => {
    if (get().missionId === missionId && socket?.connected) {
      if (initial) {
        const seed = seedFrom(initial);
        set({ missionId, status: initial.status, agents: seed.agents, messages: seed.messages, nodes: seed.nodes, edges: seed.edges, report: seed.report, analytics: seed.analytics, error: null });
      }
      return;
    }

    const seed = initial ?? null;
    const seedData = seed ? seedFrom(seed) : null;
    set({
      missionId,
      status: seed ? seed.status : 'connecting',
      error: null,
      agents: seedData ? seedData.agents : {},
      messages: seedData ? seedData.messages : [],
      nodes: seedData ? seedData.nodes : {},
      edges: seedData ? seedData.edges : [],
      chunks: {},
      report: seedData ? seedData.report : null,
      analytics: seedData ? seedData.analytics : null,
    });

    socket?.disconnect();

    socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      set({ connected: true });
      socket?.emit('mission:join', { missionId });
    });

    socket.on('mission:created', (p: { missionId: string; name: string }) => {
      set({ missionId: p.missionId, missionName: p.name });
      onTransition();
    });

    socket.on('agent:update', (p: { missionId: string; agent: AgentStateDto }) => {
      set((s) => {
        if (s.missionId && p.missionId !== s.missionId) return s;
        const prev = s.agents[p.agent.id];
        if (prev && prev.status === 'done' && p.agent.status === 'working') return s;
        return { agents: { ...s.agents, [p.agent.id]: p.agent }, lastAgentId: p.agent.id };
      });
    });

    socket.on('agent:message', (p: { missionId: string; message: AgentMessageDto }) => {
      set((s) => {
        if (s.missionId && p.missionId !== s.missionId) return s;
        const exists = s.messages.some((m) => m.id === p.message.id);
        if (exists) return s;
        return {
          messages: [...s.messages, p.message].sort((a, b) => a.seq - b.seq).slice(-200),
          chunks: { ...s.chunks, [p.message.agentId]: '' },
        };
      });
    });

    socket.on('agent:chunk', (p: { missionId: string; agentId: string; role: string; chunk: string }) => {
      set((s) => {
        if (s.missionId && p.missionId !== s.missionId) return s;
        const cur = s.chunks[p.agentId] ?? '';
        const next = (cur + p.chunk).slice(-2400);
        return { chunks: { ...s.chunks, [p.agentId]: next } };
      });
    });

    socket.on('graph:update', (p: { missionId: string; nodes: KnowledgeNodeDto[]; edges: KnowledgeEdgeDto[] }) => {
      set((s) => {
        if (s.missionId && p.missionId !== s.missionId) return s;
        const nodes = { ...s.nodes };
        for (const n of p.nodes) nodes[n.id] = n;
        const edges = [...p.edges];
        return { nodes, edges };
      });
    });

    socket.on('mission:complete', (p: { missionId: string; report: LiveReport; analytics: LiveAnalytics }) => {
      set((s) => {
        if (s.missionId && p.missionId !== s.missionId) return s;
        return { status: 'complete', report: p.report, analytics: p.analytics };
      });
    });

    socket.on('mission:failed', (p: { missionId: string; error: string }) => {
      set((s) => {
        if (s.missionId && p.missionId !== s.missionId) return s;
        return { status: 'failed', error: p.error };
      });
    });

    socket.on('mission:error', (p: { message: string }) => {
      set({ error: p.message, status: 'failed' });
    });

    socket.on('disconnect', () => set({ connected: false }));
  },
}));