'use client';

import { AgentAvatar, Bar, StatusDot } from '@/components/ui';
import type { AgentStateDto } from '@/lib/types';
import { confidenceColor } from '@/lib/hooks';

export function AgentOrbit({ agents }: { agents: AgentStateDto[] }) {
  const n = Math.min(agents.length, 6);
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <div className="relative mx-auto aspect-square w-[210px] max-w-full">
      <div className="absolute inset-0 rounded-full bg-cyan-950/10 blur-xl pointer-events-none" />
      <svg viewBox="-100 -100 200 200" className="h-full w-full">
        {/* Radar Ticks */}
        {ticks.map((a) => {
          const rad = (a * Math.PI) / 180;
          const major = a % 45 === 0;
          const r1 = 94;
          const r2 = major ? 86 : 90;
          return (
            <line
              key={a}
              x1={Math.cos(rad) * r2}
              y1={Math.sin(rad) * r2}
              x2={Math.cos(rad) * r1}
              y2={Math.sin(rad) * r1}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={major ? 1 : 0.5}
            />
          );
        })}

        {/* Concentric rings */}
        <circle r="64" fill="none" stroke="rgba(0, 210, 255, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
        <circle r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Dynamic Sweep Beam */}
        <line x1="0" y1="0" x2="64" y2="-40" stroke="rgba(0,210,255,0.4)" strokeWidth="1.2" />

        {/* Agent Orbital Nodes */}
        {agents.slice(0, 6).map((a, i) => {
          const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * 64;
          const y = Math.sin(angle) * 64;
          const active = a.status === 'working' || a.status === 'thinking';
          const done = a.status === 'done';
          const color = done ? '#10b981' : active ? '#00d2ff' : '#64748b';
          return (
            <g key={a.id}>
              <line
                x1={x}
                y1={y}
                x2="0"
                y2="0"
                stroke={active ? 'rgba(0,210,255,0.4)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="1"
                strokeDasharray={active ? '3 3' : undefined}
              />
              <circle cx={x} cy={y} r="8" fill={color} opacity="0.2" />
              <circle cx={x} cy={y} r="4.5" fill={color} />
              <text
                x={x}
                y={y > 0 ? y + 15 : y - 10}
                textAnchor="middle"
                fontSize="6"
                fontWeight="700"
                fill="#f8fafc"
                fontFamily="var(--font-mono, monospace)"
              >
                {a.name}
              </text>
            </g>
          );
        })}

        {/* Center Nexus Core */}
        <circle cx="0" cy="0" r="12" fill="rgba(0, 210, 255, 0.1)" stroke="#00d2ff" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill="#00d2ff" />
      </svg>
    </div>
  );
}

export function AgentStrip({ agents }: { agents: AgentStateDto[] }) {
  return (
    <ul className="m-0 list-none divide-y divide-white/[0.05]">
      {agents.map((a, i) => {
        const active = a.status === 'working' || a.status === 'thinking';
        const done = a.status === 'done';
        const color = done ? '#10b981' : active ? '#00d2ff' : 'var(--faint)';
        return (
          <li key={a.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]">
            <AgentAvatar role={a.role} glyph={a.avatar} size={30} dim={!active && !done} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[13px] font-bold text-[var(--ink)]">
                  {a.name}
                </span>
                <span
                  className="rounded-full px-2 py-0.2 font-mono text-[9px] uppercase tracking-wider font-semibold"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {done ? 'Complete' : active ? a.phase : 'Standby'}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1">
                  <Bar
                    value={a.confidence}
                    color={active ? 'var(--signal)' : done ? 'var(--ok)' : 'var(--line-strong)'}
                    height={3.5}
                  />
                </div>
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: confidenceColor(a.confidence) }}
                >
                  {Math.round(a.confidence * 100)}%
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}