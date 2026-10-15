'use client';

import type { AgentStateDto, KnowledgeEdgeDto, KnowledgeNodeDto } from '@/lib/types';

const ROLE_SHORT: Record<string, string> = {
  researcher: 'KAI · RESEARCH',
  analyst: 'LYRA · ANALYST',
  critic: 'VEX · CRITIC',
  synthesizer: 'NOVA · SYNTHESIZER',
  orchestrator: 'ORCHESTRATOR',
};

const PHASE_LABEL: Record<string, string> = {
  initialize: 'Initializing',
  gather: 'Gathering Evidence',
  analyze: 'Quantitative Analysis',
  adversarial: 'Adversarial Attack',
  synthesize: 'Convergence',
  rebuttal: 'Rebuttal Defense',
  'rebuttal:complete': 'Resolved',
};

function laneColor(status: string): string {
  switch (status) {
    case 'done':
      return '#10b981';
    case 'working':
    case 'thinking':
      return '#00d2ff';
    case 'failed':
      return '#ef4444';
    default:
      return 'var(--faint)';
  }
}

export function MissionBus({
  agents,
  nodes,
  edges,
}: {
  agents: AgentStateDto[];
  nodes: KnowledgeNodeDto[];
  edges: KnowledgeEdgeDto[];
}) {
  const lanes = agents;
  const count = Math.max(1, lanes.length);
  const W = Math.max(760, count * 220 + 80);
  const H = 160;
  const railY = 130;
  const slot = W / count;
  const blockW = Math.min(180, slot - 30);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-2)]/80 shadow-[var(--shadow)] backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-[var(--line)] bg-white/[0.015] px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-cyan-400">
            Real-Time Neural Highway
          </span>
          <span className="text-white/20">|</span>
          <span className="font-display text-[13px] font-semibold text-white">
            Shared Multi-Agent Consensus Bus
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          {nodes.length} Semantic Nodes · {edges.length} Cross-Entity Links
        </span>
      </header>

      <div className="overflow-x-auto px-4 py-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', minWidth: W, height: H }}
          role="img"
          aria-label="Agent consensus bus wiring"
        >
          {/* Main Shared Consensus Rail */}
          <line x1={20} y1={railY} x2={W - 20} y2={railY} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
          {/* Tick markers */}
          {Array.from({ length: Math.floor((W - 40) / 24) }, (_, i) => (
            <line
              key={i}
              x1={20 + i * 24}
              y1={railY - 4}
              x2={20 + i * 24}
              y2={railY + 4}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={0.7}
            />
          ))}

          {lanes.length === 0 && (
            <text
              x={W / 2}
              y={railY - 40}
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
              fontSize={12}
              letterSpacing="2"
              fill="var(--faint)"
            >
              INITIALIZING AGENT LANES...
            </text>
          )}

          {lanes.map((agent, i) => {
            const cx = slot * (i + 0.5);
            const x = cx - blockW / 2;
            const color = laneColor(agent.status);
            const live = agent.status === 'working' || agent.status === 'thinking';
            const phase = PHASE_LABEL[agent.phase] ?? agent.phase;
            const conf = Math.round(agent.confidence * 100);

            return (
              <g key={agent.id}>
                {/* Connector Line down to the central bus */}
                <line
                  x1={cx}
                  y1={86}
                  x2={cx}
                  y2={railY}
                  stroke={color}
                  strokeWidth={live ? 2 : 1.2}
                  strokeDasharray={live ? '4 3' : undefined}
                  opacity={live ? 1 : 0.6}
                >
                  {live && <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.6s" repeatCount="indefinite" />}
                </line>
                <circle cx={cx} cy={railY} r={live ? 4.5 : 3.5} fill={color} />

                {/* Outer Agent Lane Card */}
                <rect
                  x={x}
                  y={12}
                  width={blockW}
                  height={74}
                  rx={10}
                  fill="#0c101a"
                  stroke={live ? color : 'rgba(255,255,255,0.1)'}
                  strokeWidth={live ? 1.5 : 1}
                />
                {/* Left accent border */}
                <rect x={x} y={12} width={4} height={74} rx={2} fill={color} />

                <text x={x + 14} y={32} fontFamily="var(--font-display), sans-serif" fontWeight="700" fontSize={11.5} letterSpacing="0.5" fill="#ffffff">
                  {ROLE_SHORT[agent.role] ?? agent.role.toUpperCase()}
                </text>
                <text x={x + 14} y={48} fontFamily="var(--font-mono), monospace" fontSize={9.5} letterSpacing="0.5" fill="var(--faint)">
                  {phase}
                </text>

                {/* Confidence Bar */}
                <rect x={x + 14} y={56} width={blockW - 28} height={4} rx={2} fill="rgba(255,255,255,0.08)" />
                <rect
                  x={x + 14}
                  y={56}
                  width={(blockW - 28) * Math.min(1, Math.max(0, agent.confidence))}
                  height={4}
                  rx={2}
                  fill={color}
                />

                <text x={x + 14} y={74} fontFamily="var(--font-mono), monospace" fontSize={9} fontWeight="600" fill={color}>
                  {conf}% CONF
                </text>
                <text x={x + blockW - 14} y={74} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={8.5} fill="var(--faint)">
                  {agent.tokensUsed} TOK
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
