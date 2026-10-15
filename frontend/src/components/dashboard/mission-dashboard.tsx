'use client';

import { useMemo, useState } from 'react';
import type { MissionDetailDto } from '@/lib/types';
import { AgentStrip, AgentOrbit } from '@/components/dashboard/agent-orbit';
import { MissionBus } from '@/components/dashboard/mission-bus';
import { ReasoningStream } from '@/components/dashboard/reasoning-stream';
import { MissionReplay } from '@/components/dashboard/mission-replay';
import { KnowledgeGraph } from '@/components/dashboard/knowledge-graph';
import { ReportPanel } from '@/components/dashboard/report-panel';
import { MissionToolbar } from '@/components/dashboard/mission-toolbar';
import { Panel, StatusDot, Step } from '@/components/ui';
import { formatClock, formatDuration, statusColor, useNow } from '@/lib/hooks';
import { useSession } from '@/lib/store';
import { toExportInput } from '@/lib/export';
import {
  Brain,
  ChatCircleText,
  Clock,
  Coins,
  Cpu,
  FileText,
  Play,
  ShareNetwork,
  ShieldWarning,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';

const TABS = [
  { key: 'stream', label: 'Reasoning Stream', icon: <ChatCircleText size={14} /> },
  { key: 'report', label: 'Executive Report', icon: <FileText size={14} /> },
  { key: 'replay', label: 'Playback Replay', icon: <Play size={14} /> },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function MissionDashboard({ initial, readOnly = false }: { initial: MissionDetailDto | null; readOnly?: boolean }) {
  const now = useNow(500);
  const [activeTab, setActiveTab] = useState<TabKey>('stream');

  const {
    connected,
    status,
    provider,
    model,
    agents,
    messages,
    nodes,
    edges,
    chunks,
    report,
    analytics,
    error,
  } = useSession();

  // Prefer live session state, fall back to initial snapshot
  const detail = useMemo(() => {
    if (!initial) return null;
    return {
      ...initial,
      status: status === 'connecting' ? initial.status : status,
      provider: provider ?? initial.provider,
      model: model ?? initial.model,
      agents: Object.values(agents).length ? Object.values(agents) : initial.agents,
      messages: messages.length ? messages : initial.messages,
      nodes: Object.values(nodes).length ? Object.values(nodes) : initial.nodes,
      edges: edges.length ? edges : initial.edges,
      totalTokens: Object.values(agents).reduce((s, a) => s + a.tokensUsed, 0) || initial.totalTokens,
      estCostUsd: analytics?.estCostUsd ?? initial.estCostUsd,
      report: report ?? initial.report,
      analytics: analytics ?? initial.analytics,
    };
  }, [initial, status, provider, model, agents, messages, nodes, edges, report, analytics]);

  const activeProvider = detail?.provider ?? 'Groq LPU';
  const activeModel = detail?.model ?? 'qwen/qwen3.8-27b';
  const effectiveStatus = (readOnly ? initial?.status ?? status : detail?.status ?? status) ?? 'connecting';
  const displayAgents = detail?.agents ?? [];
  const displayNodes = detail?.nodes ?? [];
  const displayEdges = detail?.edges ?? [];
  const displayMessages = detail?.messages ?? [];
  const displayNodeMap = Object.fromEntries(displayNodes.map((n) => [n.id, n] as const));
  const startedAt = detail?.startedAt ?? new Date().toISOString();
  const isRunning =
    effectiveStatus === 'running' || effectiveStatus === 'queued' || effectiveStatus === 'connecting' || effectiveStatus === 'thinking';
  const elapsed = isRunning ? now - new Date(startedAt).getTime() : detail?.analytics?.durationMs ?? 0;
  const color = statusColor(effectiveStatus);
  const tokens = displayAgents.reduce((s, a) => s + a.tokensUsed, 0);
  const confidence = displayAgents.length
    ? Math.round((displayAgents.reduce((sum, agent) => sum + agent.confidence, 0) / displayAgents.length) * 100)
    : 0;
  const dissent = displayMessages.filter((message) => message.type === 'critique').length;

  const exportData = detail ? toExportInput(detail) : null;

  return (
    <div className="flex flex-col gap-6 pb-20 pt-4">
      {/* ===================================================================
          MISSION COMMAND DECK HEADER
          =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c101a]/90 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                {readOnly ? 'Shared Read-Only Snapshot' : 'Mission Control Deck'} ·{' '}
                <span style={{ color }}>{effectiveStatus.toUpperCase()}</span>
              </span>
            </div>
            <h1 className="font-display mt-2 text-[26px] font-extrabold text-white sm:text-[32px] tracking-tight">
              {detail?.name ?? 'Untitled Mission'}
            </h1>
            <p className="font-mono mt-1 text-[12px] text-slate-400">
              {activeProvider} · {activeModel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[11.5px] text-slate-300">
              <Clock size={13} className="text-cyan-400" />
              <span>T+{formatDuration(elapsed)}</span>
            </div>

            {exportData && <MissionToolbar d={exportData} />}
          </div>
        </div>

        {/* Executive Metric Cards Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-5 sm:grid-cols-5">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Active Agents</span>
            <p className="font-display m-0 mt-1 text-[18px] font-bold text-white">{displayAgents.length || 4}</p>
            <span className="font-mono text-[10px] text-slate-500">Autonomous Lanes</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Swarm Consensus</span>
            <p className="font-display m-0 mt-1 text-[18px] font-bold text-cyan-400">{confidence}%</p>
            <span className="font-mono text-[10px] text-slate-500">Weighted Average</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Open Dissent</span>
            <p className="font-display m-0 mt-1 text-[18px] font-bold text-amber-400">{dissent}</p>
            <span className="font-mono text-[10px] text-slate-500">Adversarial Critiques</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Knowledge Graph</span>
            <p className="font-display m-0 mt-1 text-[18px] font-bold text-emerald-400">{displayNodes.length} / {displayEdges.length}</p>
            <span className="font-mono text-[10px] text-slate-500">Nodes / Edges</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Token Volume</span>
            <p className="font-display m-0 mt-1 text-[18px] font-bold text-indigo-400">{tokens}</p>
            <span className="font-mono text-[10px] text-slate-500">Tokens Processed</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-400">
          {error}
        </div>
      )}

      {/* ===================================================================
          THREE-COLUMN WORKBENCH
          =================================================================== */}
      <div className="grid gap-6 lg:grid-cols-[310px_1fr_330px]">
        {/* Left Column: Swarm Roster & Radar */}
        <div className="flex flex-col gap-6">
          <Panel
            title="Swarm Orbital Roster"
            right={
              <StatusDot
                color={connected || readOnly ? color : 'var(--bad)'}
                live={(connected || readOnly) && !effectiveStatus.includes('complete')}
              />
            }
          >
            <div className="p-4">
              <AgentOrbit agents={displayAgents} />
            </div>
            <AgentStrip agents={displayAgents} />
          </Panel>

          <Panel title="Execution Telemetry">
            <div className="p-4 space-y-2.5">
              <Step label="Time Elapsed" value={formatDuration(elapsed)} />
              <Step label="Tokens Consumed" value={String(tokens)} />
              <Step label="Signals Streamed" value={`${displayMessages.length} msgs`} />
              <Step label="Knowledge Entities" value={`${displayNodes.length} nodes`} />
              {detail?.analytics && (
                <>
                  <Step label="Estimated Cost" value={`$${detail.analytics.estCostUsd.toFixed(5)}`} />
                  <Step label="Finished" value={formatClock(detail.analytics.completedAt)} />
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* Center Column: Live Stream / Report / Replay */}
        <div>
          <Panel
            title={TABS.find((t) => t.key === activeTab)?.label ?? 'Live Stream'}
            accent
            right={
              <div className="segmented no-print">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.key}
                    onClick={() => setActiveTab(t.key)}
                    className="flex items-center gap-1.5"
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            }
          >
            {activeTab === 'stream' ? (
              <ReasoningStream messages={displayMessages} chunks={chunks} status={effectiveStatus} />
            ) : activeTab === 'report' ? (
              <ReportPanel report={detail?.report ?? null} analytics={detail?.analytics ?? null} exportData={exportData} />
            ) : (
              <MissionReplay messages={displayMessages} />
            )}
          </Panel>
        </div>

        {/* Right Column: Knowledge Graph */}
        <div>
          <Panel
            title="Semantic Knowledge Graph"
            index="GRAPH.03"
            right={<StatusDot color={displayNodes.length > 0 ? '#10b981' : '#64748b'} />}
          >
            <KnowledgeGraph nodes={displayNodeMap} edges={displayEdges} height={420} />
          </Panel>
        </div>
      </div>
    </div>
  );
}