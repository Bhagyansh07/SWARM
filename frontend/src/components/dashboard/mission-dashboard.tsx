'use client';

import { useState } from 'react';
import { AgentStrip, AgentOrbit } from '@/components/dashboard/agent-orbit';
import { ReasoningStream } from '@/components/dashboard/reasoning-stream';
import { MissionReplay } from '@/components/dashboard/mission-replay';
import { KnowledgeGraph } from '@/components/dashboard/knowledge-graph';
import { ReportPanel } from '@/components/dashboard/report-panel';
import { Panel, StatusDot, Step } from '@/components/ui';
import { formatClock, formatDuration, statusColor, useNow } from '@/lib/hooks';
import { useSession } from '@/lib/store';

export function MissionDashboard({ initial, readOnly = false }: { initial: { name?: string; status: string; provider: string; model: string; startedAt: string; completedAt: string | null } | null; readOnly?: boolean }) {
  const now = useNow(500);
  const [activeTab, setActiveTab] = useState<'stream' | 'report' | 'replay'>('stream');

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

  const startedAt = initial?.startedAt ?? new Date().toISOString();
  const isRunning = status === 'running' || status === 'queued' || status === 'connecting' || status === 'thinking';
  const elapsed = isRunning ? now - new Date(startedAt).getTime() : analytics?.durationMs ?? 0;
  const color = statusColor(status);
  const tokens = Object.values(agents).reduce((s, a) => s + a.tokensUsed, 0);
  const confidence = Object.values(agents).length
    ? Math.round((Object.values(agents).reduce((sum, agent) => sum + agent.confidence, 0) / Object.values(agents).length) * 100)
    : 0;
  const dissent = messages.filter((message) => message.type === 'critique').length;

  return (
    <div className="flex flex-col gap-4 pb-16">
      <div className="mission-hero flex flex-col gap-5 border-b border-[var(--line)] pb-6 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono m-0 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[var(--faint)]">
            <StatusDot color={color} live={isRunning} />
            {readOnly ? 'shared read-only deck' : 'command deck'} / mission {status === 'complete' ? 'complete' : status === 'failed' ? 'failed' : 'in flight'}
          </p>
          <h1 className="font-display m-0 mt-3 max-w-[24ch] text-[28px] font-black uppercase tracking-[0.02em] text-[var(--ink)] sm:text-[34px]">
            {initial?.name ?? 'Untitled mission'}
          </h1>
          <p className="font-mono m-0 mt-2 text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
            {provider ?? '—'} / {model ?? '—'}
          </p>
        </div>
        <div className="font-mono flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-[var(--dim)] sm:justify-end">
          <span className="border border-[var(--line-strong)] px-2.5 py-1.5" style={{ color }}>
            {status}
          </span>
          <span className="border border-[var(--line)] px-2.5 py-1.5">t+{formatDuration(elapsed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-5">
        {[
          ['agents', `${Object.keys(agents).length || 4}`, 'active lanes'],
          ['confidence', `${confidence}%`, 'swarm average'],
          ['dissent', `${dissent}`, 'open attacks'],
          ['graph', `${Object.keys(nodes).length} / ${edges.length}`, 'nodes / edges'],
          ['tokens', `${tokens}`, 'consumed'],
        ].map(([label, value, note]) => (
          <div key={label} className="metric-cell bg-[var(--paper-2)] px-3 py-3">
            <span className="rack-index block">{label}</span>
            <span className="font-mono mt-1 block text-[16px] text-[var(--ink)]">{value}</span>
            <span className="font-mono mt-1 block text-[9px] uppercase tracking-[0.1em] text-[var(--faint)]">{note}</span>
          </div>
        ))}
      </div>

      {error && (
        <p className="font-mono m-0 border border-[var(--bad)] bg-[color-mix(in_oklch,var(--bad)_10%,transparent)] px-4 py-2 text-[12px] text-[var(--bad)]">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[300px_1fr_340px]">
        {/* left: roster + orbit */}
        <div className="flex flex-col gap-4">
          <Panel title="Swarm roster" index="ACT.00" right={<StatusDot color={connected ? color : 'var(--bad)'} live={connected && !status.includes('complete')} />}>
            <div className="px-4 pt-4">
              <AgentOrbit agents={Object.values(agents)} />
            </div>
            <div className="mt-2">
              <AgentStrip agents={Object.values(agents)} />
            </div>
          </Panel>
          <Panel title="Elapsed telemetry" index="TEL.01">
            <div className="space-y-2 px-4 py-3">
              <Step label="elapsed" value={formatDuration(elapsed)} />
              <Step label="tokens" value={String(tokens)} />
              <Step label="stream" value={`${messages.length} msgs`} />
              <Step label="graph" value={`${Object.keys(nodes).length} n / ${edges.length} e`} />
              {report && analytics && (
                <>
                  <Step label="est. cost" value={`$${analytics.estCostUsd.toFixed(5)}`} />
                  <Step label="finished" value={formatClock(analytics.completedAt)} />
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* center: stream or report */}
        <div className="column">
          <Panel
            title={activeTab === 'stream' ? 'Reasoning stream' : activeTab === 'report' ? 'Mission report' : 'Mission replay'}
            index={activeTab === 'stream' ? 'STR.02' : activeTab === 'report' ? 'RPT.04' : 'RPL.05'}
            accent
            right={
              <div className="flex gap-px border border-[var(--line)]">
                <button
                  onClick={() => setActiveTab('stream')}
                  className={`font-mono cursor-pointer px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${activeTab === 'stream' ? 'bg-[var(--signal-dim)] text-[var(--signal)]' : 'bg-transparent text-[var(--faint)] hover:text-[var(--dim)]'}`}
                >
                  live
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={`font-mono cursor-pointer px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${activeTab === 'report' ? 'bg-[var(--signal-dim)] text-[var(--signal)]' : 'bg-transparent text-[var(--faint)] hover:text-[var(--dim)]'}`}
                >
                  report
                </button>
                <button
                  onClick={() => setActiveTab('replay')}
                  className={`font-mono cursor-pointer px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${activeTab === 'replay' ? 'bg-[var(--signal-dim)] text-[var(--signal)]' : 'bg-transparent text-[var(--faint)] hover:text-[var(--dim)]'}`}
                >
                  replay
                </button>
              </div>
            }
          >
            {activeTab === 'stream' ? <ReasoningStream messages={messages} chunks={chunks} status={status} /> : activeTab === 'report' ? <ReportPanel report={report} analytics={analytics} /> : <MissionReplay messages={messages} />}
          </Panel>
        </div>

        {/* right: graph */}
        <Panel title="Knowledge graph" index="GRP.03" right={<StatusDot color={Object.keys(nodes).length > 0 ? 'var(--ok)' : 'var(--faint)'} />}>
          <KnowledgeGraph nodes={nodes} edges={edges} />
        </Panel>
      </div>
    </div>
  );
}