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

const TABS = [
  { key: 'stream', label: 'Live stream', index: 'STR.02' },
  { key: 'report', label: 'Report', index: 'RPT.04' },
  { key: 'replay', label: 'Replay', index: 'RPL.05' },
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

  // Prefer live session state, fall back to the initial snapshot.
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

  const activeProvider = detail?.provider ?? 'simulation';
  const activeModel = detail?.model ?? 'deterministic-sim';
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
    <div className="flex flex-col gap-4 pb-16">
      <div className="mission-hero flex flex-col gap-5 border-b border-[var(--line)] pb-6 pt-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="no-print min-w-0 flex-1">
          <p className="font-mono m-0 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[var(--faint)]">
            <StatusDot color={color} live={isRunning} />
            {readOnly ? 'shared read-only deck' : 'command deck'} / {effectiveStatus === 'complete' ? 'mission complete' : effectiveStatus === 'failed' ? 'mission failed' : 'mission in flight'}
          </p>
          <h1 className="font-display m-0 mt-3 max-w-[24ch] break-words text-[26px] font-black uppercase leading-tight tracking-[0.02em] text-[var(--ink)] sm:text-[32px]">
            {detail?.name ?? 'Untitled mission'}
          </h1>
          <p className="font-mono m-0 mt-2 text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
            {activeProvider} / {activeModel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="font-mono flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] no-print">
            <span className="border border-[var(--line-strong)] px-2.5 py-1.5" style={{ color }}>
              {effectiveStatus}
            </span>
            <span className="border border-[var(--line)] px-2.5 py-1.5">t+{formatDuration(elapsed)}</span>
          </div>
          {exportData && <MissionToolbar d={exportData} />}
        </div>
      </div>

      <div className="no-print grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-5" role="list" aria-label="Mission metrics">
        {[
          ['agents', `${displayAgents.length || '—'}`, 'active lanes'],
          ['confidence', `${confidence}%`, 'swarm average'],
          ['dissent', `${dissent}`, 'open attacks'],
          ['graph', `${displayNodes.length} / ${displayEdges.length}`, 'nodes / edges'],
          ['tokens', `${tokens}`, 'consumed'],
        ].map(([label, value, note]) => (
          <div key={label} role="listitem" className="metric-cell bg-[var(--paper-2)] px-3 py-3">
            <span className="rack-index block">{label}</span>
            <span className="font-mono mt-1 block text-[16px] text-[var(--ink)]">{value}</span>
            <span className="font-mono mt-1 block text-[9px] uppercase tracking-[0.1em] text-[var(--faint)]">{note}</span>
          </div>
        ))}
      </div>

      <div className="no-print">
        <MissionBus agents={displayAgents} nodes={displayNodes} edges={displayEdges} />
      </div>

      {error && (
        <p className="font-mono m-0 border border-[var(--bad)] bg-[color-mix(in_oklch,var(--bad)_10%,transparent)] px-4 py-2 text-[12px] text-[var(--bad)]" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[300px_1fr_340px]">
        {/* left: roster + telemetry */}
        <div className="no-print flex flex-col gap-4">
          <Panel title="Swarm roster" index="ACT.00" right={<StatusDot color={connected || readOnly ? color : 'var(--bad)'} live={(connected || readOnly) && !effectiveStatus.includes('complete')} />}>
            <div className="px-4 pt-4">
              <AgentOrbit agents={displayAgents} />
            </div>
            <div className="mt-2">
              <AgentStrip agents={displayAgents} />
            </div>
          </Panel>
          <Panel title="Elapsed telemetry" index="TEL.01">
            <div className="space-y-2 px-4 py-3">
              <Step label="elapsed" value={formatDuration(elapsed)} />
              <Step label="tokens" value={String(tokens)} />
              <Step label="stream" value={`${displayMessages.length} msgs`} />
              <Step label="graph" value={`${displayNodes.length} n / ${displayEdges.length} e`} />
              {detail?.report && detail?.analytics && (
                <>
                  <Step label="est. cost" value={`$${detail.analytics.estCostUsd.toFixed(5)}`} />
                  <Step label="finished" value={formatClock(detail.analytics.completedAt)} />
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* center: stream / report / replay */}
        <div className="column">
          <Panel
            title={TABS.find((t) => t.key === activeTab)?.label ?? 'Live stream'}
            index={TABS.find((t) => t.key === activeTab)?.index ?? 'STR.02'}
            accent
            right={
              <div className="segmented no-print" role="tablist" aria-label="Mission deck views">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={activeTab === t.key}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
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

        {/* right: graph */}
        <Panel title="Knowledge graph" index="GRP.03" right={<StatusDot color={displayNodes.length > 0 ? 'var(--ok)' : 'var(--faint)'} />}>
          <KnowledgeGraph nodes={displayNodeMap} edges={displayEdges} />
        </Panel>
      </div>
    </div>
  );
}