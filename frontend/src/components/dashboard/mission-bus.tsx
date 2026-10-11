'use client';

import type { AgentStateDto, KnowledgeEdgeDto, KnowledgeNodeDto } from '@/lib/types';

const ROLE_SHORT: Record<string, string> = {
  researcher: 'RES',
  analyst: 'ANL',
  critic: 'CRT',
  synthesizer: 'SYN',
  orchestrator: 'ORC',
};

const PHASE_LABEL: Record<string, string> = {
  initialize: 'boot',
  gather: 'gather',
  analyze: 'analyze',
  adversarial: 'attack',
  synthesize: 'converge',
  rebuttal: 'rebut',
  'rebuttal:complete': 'closed',
};

function laneColor(status: string): string {
  switch (status) {
    case 'done':
      return 'var(--ok)';
    case 'working':
    case 'thinking':
      return 'var(--signal)';
    case 'failed':
      return 'var(--bad)';
    default:
      return 'var(--faint)';
  }
}

/**
 * A flat, instrument-style schematic of the agent lanes wired to a shared bus.
 * It replaces the old WebGL scene: same information, none of the spectacle.
 */
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
  const W = Math.max(700, count * 210 + 60);
  const H = 138;
  const railY = 112;
  const slot = W / count;
  const blockW = Math.min(168, slot - 30);

  return (
    <section className="panel overflow-hidden">
      <header className="panel-head flex items-center justify-between gap-3 px-4 py-2">
        <h3 className="font-display m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
          <span className="rack-index mr-2 align-middle">BUS.00</span>
          Agent bus
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
          {nodes.length} nodes · {edges.length} links
        </span>
      </header>
      <div className="overflow-x-auto px-3 py-3">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: W, height: H }} role="img" aria-label="Agent bus wiring">
          {/* shared rail */}
          <line x1={18} y1={railY} x2={W - 18} y2={railY} stroke="var(--line-strong)" strokeWidth={1.5} />
          {Array.from({ length: Math.floor((W - 36) / 22) }, (_, i) => (
            <line
              key={i}
              x1={18 + i * 22}
              y1={railY - 3}
              x2={18 + i * 22}
              y2={railY + 3}
              stroke="var(--faint)"
              strokeWidth={0.5}
              opacity={0.45}
            />
          ))}

          {lanes.length === 0 && (
            <text
              x={W / 2}
              y={railY - 34}
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
              fontSize={11}
              letterSpacing="3"
              fill="var(--faint)"
            >
              AWAITING LANES
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
                {/* connector to the rail */}
                <line
                  x1={cx}
                  y1={54}
                  x2={cx}
                  y2={railY}
                  stroke={color}
                  strokeWidth={live ? 1.4 : 1}
                  strokeDasharray={live ? '4 3' : undefined}
                  opacity={live ? 0.95 : 0.5}
                >
                  {live && <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.7s" repeatCount="indefinite" />}
                </line>
                <circle cx={cx} cy={railY} r={3.2} fill={color} opacity={live ? 1 : 0.6} />

                {/* lane block */}
                <rect
                  x={x}
                  y={14}
                  width={blockW}
                  height={40}
                  fill="var(--paper-3)"
                  stroke={live ? color : 'var(--line-strong)'}
                  strokeWidth={live ? 1.4 : 1}
                />
                <rect x={x} y={14} width={4} height={40} fill={color} opacity={live ? 1 : 0.7} />

                <text x={x + 12} y={31} fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing="1.5" fill="var(--ink)">
                  {ROLE_SHORT[agent.role] ?? agent.role.slice(0, 3).toUpperCase()}
                </text>
                <text x={x + 12} y={46} fontFamily="var(--font-mono), monospace" fontSize={8.5} letterSpacing="1.4" fill="var(--faint)">
                  {phase.toUpperCase()} · {agent.status.toUpperCase()}
                </text>

                {/* confidence meter */}
                <rect x={x + 12} y={62} width={blockW - 24} height={3} fill="var(--line)" />
                <rect x={x + 12} y={62} width={(blockW - 24) * Math.min(1, Math.max(0, agent.confidence))} height={3} fill={color} />

                <text x={x + 12} y={82} fontFamily="var(--font-mono), monospace" fontSize={8} letterSpacing="1" fill="var(--dim)">
                  CONF {conf}%
                </text>
                <text x={x + blockW - 12} y={82} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={8} letterSpacing="1" fill="var(--dim)">
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
