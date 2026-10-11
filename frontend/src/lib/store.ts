'use client';

import { create } from 'zustand';
import type {
  AgentMessageDto,
  AgentStateDto,
  KnowledgeEdgeDto,
  KnowledgeNodeDto,
  MissionDetailDto,
} from '@/lib/types';

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

// Missions run in the background on the API; the client follows one by polling
// its JSON snapshot. 900ms keeps the stream feeling live without hammering the
// (serverless) API.
const POLL_MS = 900;

let timer: ReturnType<typeof setInterval> | null = null;

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function snapshot(detail: MissionDetailDto) {
  return {
    connected: true,
    missionId: detail.id,
    missionName: detail.name,
    status: detail.status,
    provider: detail.provider,
    model: detail.model,
    agents: Object.fromEntries(detail.agents.map((a) => [a.id, a] as const)),
    messages: [...detail.messages].sort((a, b) => a.seq - b.seq).slice(-200),
    nodes: Object.fromEntries(detail.nodes.map((n) => [n.id, n] as const)),
    edges: [...detail.edges],
    chunks: detail.chunks ?? {},
    report: (detail.report as LiveReport | null) ?? null,
    analytics: (detail.analytics as LiveAnalytics | null) ?? null,
    error: detail.error ?? null,
    lastAgentId: detail.agents[detail.agents.length - 1]?.id ?? null,
  };
}

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
    stopPolling();
    set({
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
    });
  },

  disconnect: () => {
    stopPolling();
    set({ connected: false, missionId: null, missionName: null });
  },

  connect: (missionId, initial, onTransition) => {
    if (get().missionId === missionId && timer) {
      if (initial) set(snapshot(initial));
      return;
    }

    stopPolling();
    if (initial) set(snapshot(initial));
    else set({ missionId, status: 'connecting', error: null });

    let alive = true;
    let failures = 0;

    const tick = async () => {
      if (!alive) return;
      try {
        const res = await fetch(`/api/missions/${missionId}`, { cache: 'no-store' });
        if (res.status === 404) {
          alive = false;
          stopPolling();
          set({ status: 'failed', error: 'Mission not found.' });
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { data: MissionDetailDto };
        if (!alive) return;
        failures = 0;
        set(snapshot(body.data));
        if (body.data.status === 'complete' || body.data.status === 'failed') {
          alive = false;
          stopPolling();
          onTransition();
        }
      } catch {
        failures += 1;
        if (failures >= 6 && alive) set({ connected: false });
      }
    };

    void tick();
    timer = setInterval(tick, POLL_MS);
  },
}));
