'use client';

import { AgentAvatar, Bar, StatusDot } from '@/components/ui';
import type { AgentStateDto } from '@/lib/types';
import { confidenceColor } from '@/lib/hooks';

export function AgentOrbit({ agents }: { agents: AgentStateDto[] }) {
  const n = Math.min(agents.length, 6);
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <div className="relative mx-auto aspect-square w-[200px] max-w-full">
      <svg viewBox="-100 -100 200 200" className="h-full w-full">
        {ticks.map((a) => {
          const rad = (a * Math.PI) / 180;
          const major = a % 45 === 0;
          const r1 = 96;
          const r2 = major ? 89 : 92;
          return (
            <line
              key={a}
              x1={Math.cos(rad) * r2}
              y1={Math.sin(rad) * r2}
              x2={Math.cos(rad) * r1}
              y2={Math.sin(rad) * r1}
              stroke="var(--faint)"
              strokeWidth={major ? 1 : 0.5}
              opacity={major ? 0.9 : 0.45}
            />
          );
        })}
        <circle r="62" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 4" />
        <circle r="30" fill="none" stroke="var(--line)" strokeWidth="1" />
        {agents.slice(0, 6).map((a, i) => {
          const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * 62;
          const y = Math.sin(angle) * 62;
          const active = a.status === 'working' || a.status === 'thinking';
          const done = a.status === 'done';
          const color = done ? 'var(--ok)' : active ? 'var(--signal)' : 'var(--paper-3)';
          return (
            <g key={a.id}>
              <line x1={x} y1={y} x2="0" y2="0" stroke={active ? 'var(--signal)' : 'var(--line)'} strokeWidth="1" strokeDasharray={active ? '2 3' : '1 0'} opacity={active ? 0.8 : 0.6} />
              <rect x={x - 3} y={y - 3} width="6" height="6" fill={color} stroke={done ? 'var(--ok)' : 'var(--line-strong)'} strokeWidth="0.8" />
            </g>
          );
        })}
        <g stroke="var(--signal)" strokeWidth="1" transform="translate(-10 -10)">
          <circle cx="10" cy="10" r="9" fill="var(--paper-2)" />
          <circle cx="10" cy="10" r="3" fill="var(--signal)" />
          <path d="M10 1v5M10 15v4M1 10h5M15 10h4M3.8 3.8l3.5 3.5M12.7 12.7l3.5 3.5M16.2 3.8l-3.5 3.5M7.3 12.7l-3.5 3.5" />
        </g>
      </svg>
    </div>
  );
}

export function AgentStrip({ agents }: { agents: AgentStateDto[] }) {
  return (
    <ul className="m-0 list-none">
      {agents.map((a, i) => {
        const active = a.status === 'working' || a.status === 'thinking';
        const done = a.status === 'done';
        const color = done ? 'var(--ok)' : active ? 'var(--signal)' : 'var(--faint)';
        return (
          <li key={a.id} className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-2 last:border-0">
            <span className="rack-index w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <AgentAvatar role={a.role} glyph={a.avatar} size={26} dim={!active && !done} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink)]">{a.name}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ color }}>
                  {done ? 'done' : active ? a.phase : 'idle'}
                </span>
              </div>
              <Bar value={a.confidence} color={active ? 'var(--signal)' : done ? 'var(--ok)' : 'var(--line-strong)'} height={3} />
            </div>
            <span className="font-mono w-11 text-right text-[11px]" style={{ color: confidenceColor(a.confidence) }}>
              {Math.round(a.confidence * 100)}%
            </span>
            <span className="font-mono hidden w-16 text-right text-[9px] text-[var(--faint)] sm:block">${a.estCostUsd.toFixed(5)}</span>
          </li>
        );
      })}
    </ul>
  );
}