'use client';

import { useMemo } from 'react';
import type { KnowledgeEdgeDto, KnowledgeNodeDto } from '@/lib/types';

interface Props {
  nodes: Record<string, KnowledgeNodeDto>;
  edges: KnowledgeEdgeDto[];
  height?: number;
}

const KIND_COLOR: Record<string, string> = {
  claim: 'var(--warn)',
  fact: 'var(--signal)',
  entity: 'var(--ok)',
  concept: 'var(--dim)',
};

export function KnowledgeGraph({ nodes, edges, height = 320 }: Props) {
  const layout = useMemo(() => {
    const list = Object.values(nodes);
    if (list.length === 0) return { spots: [] as Array<{ x: number; y: number }>, lines: [] as Array<{ d: string }> };

    const W = 300;
    const H = 300;
    const cx = W / 2;
    const cy = H / 2;

    const groups = [...new Set(list.map((n) => n.group))].sort();
    const byGroup = new Map<number, typeof list>();
    for (const g of groups) byGroup.set(g, list.filter((n) => n.group === g));

    const spots = list.map((n) => {
      const gList = byGroup.get(n.group) ?? [];
      const idx = gList.indexOf(n);
      const count = gList.length;
      const radius = 46 + n.group * 26;
      const angle = (idx / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2 + n.weight * 0.25;
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });

    const lines = edges
      .map((e) => {
        const s = spots[list.findIndex((n) => n.id === e.sourceId)];
        const t = spots[list.findIndex((n) => n.id === e.targetId)];
        if (!s || !t) return null;
        return {
          d: `M ${s.x} ${s.y} C ${(s.x + t.x) / 2} ${Math.min(s.y, t.y) - 18}, ${(s.x + t.x) / 2} ${Math.max(s.y, t.y) + 18}, ${t.x} ${t.y}`,
        };
      })
      .filter((l): l is { d: string } => Boolean(l));

    return { spots, lines };
  }, [nodes, edges]);

  if (Object.keys(nodes).length === 0) {
    return (
      <p className="font-mono m-0 px-4 py-10 text-center text-[12px] uppercase tracking-[0.16em] text-[var(--faint)]">
        awaiting extraction…
      </p>
    );
  }

  const list = Object.values(nodes);

  return (
    <div className="px-3 py-3">
      <svg viewBox="0 0 300 300" style={{ width: '100%', height }} role="img" aria-label="Mission knowledge graph">
        {layout.lines.map((l, i) => (
          <path key={i} d={l.d} fill="none" stroke="var(--line-strong)" strokeWidth={0.75} opacity={0.7} />
        ))}
        {list.map((n, i) => (
          <g key={n.id}>
            <circle
              cx={layout.spots[i]?.x}
              cy={layout.spots[i]?.y}
              r={Math.max(10, Math.min(22, n.weight * 26))}
              fill="var(--paper-3)"
              stroke={KIND_COLOR[n.kind] ?? 'var(--dim)'}
              strokeWidth={1}
              opacity={0.92}
            />
            <title>{n.label}</title>
            <text
              x={layout.spots[i]?.x}
              y={layout.spots[i]?.y + 3}
              textAnchor="middle"
              fontSize={Math.max(n.label.length > 24 ? 3 : 4, 3.2)}
              fontFamily="var(--font-mono), monospace"
              fill="var(--ink)"
            >
              {n.label.length > 26 ? `${n.label.slice(0, 25)}…` : n.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="font-mono m-0 px-1 pt-1 text-right text-[10px] uppercase tracking-wider text-[var(--faint)]">
        {list.length} nodes · {edges.length} edges
      </p>
    </div>
  );
}