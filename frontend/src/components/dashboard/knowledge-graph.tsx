'use client';

import { useMemo } from 'react';
import type { KnowledgeEdgeDto, KnowledgeNodeDto } from '@/lib/types';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr';

interface Props {
  nodes: Record<string, KnowledgeNodeDto>;
  edges: KnowledgeEdgeDto[];
  height?: number;
}

const KIND_COLOR: Record<string, string> = {
  claim: '#f59e0b',
  fact: '#10b981',
  entity: '#818cf8',
  concept: '#00d2ff',
};

export function KnowledgeGraph({ nodes, edges, height = 340 }: Props) {
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
      const radius = 48 + n.group * 28;
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
      <div className="py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--faint)]">
          Awaiting semantic entity extraction...
        </p>
      </div>
    );
  }

  const list = Object.values(nodes);

  const exportMermaid = () => {
    const nodeId = new Map(list.map((node, index) => [node.id, `N${index + 1}`]));
    const quote = (value: string) => value.replace(/"/g, "'").replace(/\n/g, ' ');
    const lines = ['graph TD'];
    for (const node of list) lines.push(`  ${nodeId.get(node.id)}["${quote(node.label)}"]`);
    for (const edge of edges) {
      const source = nodeId.get(edge.sourceId);
      const target = nodeId.get(edge.targetId);
      if (source && target) lines.push(`  ${source} -->|${quote(edge.label ?? 'relates')}| ${target}`);
    }
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'swarm-knowledge-graph.mmd';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Concept
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Fact
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Claim
          </span>
        </div>

        <button
          type="button"
          onClick={exportMermaid}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
        >
          <DownloadSimple size={11} />
          <span>Mermaid</span>
        </button>
      </div>

      <div className="relative pt-2">
        <svg viewBox="0 0 300 300" style={{ width: '100%', height }} role="img" aria-label="Mission knowledge graph">
          {layout.lines.map((l, i) => (
            <path key={i} d={l.d} fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth={0.8} />
          ))}
          {list.map((n, i) => {
            const color = KIND_COLOR[n.kind] ?? '#94a3b8';
            return (
              <g key={n.id}>
                <circle
                  cx={layout.spots[i]?.x}
                  cy={layout.spots[i]?.y}
                  r={Math.max(10, Math.min(22, n.weight * 26))}
                  fill="#0c101a"
                  stroke={color}
                  strokeWidth={1.2}
                />
                <circle
                  cx={layout.spots[i]?.x}
                  cy={layout.spots[i]?.y}
                  r={Math.max(10, Math.min(22, n.weight * 26)) - 3}
                  fill={color}
                  opacity={0.15}
                />
                <title>{n.label}</title>
                <text
                  x={layout.spots[i]?.x}
                  y={layout.spots[i]?.y + 3}
                  textAnchor="middle"
                  fontSize={Math.max(n.label.length > 24 ? 3 : 4, 3.2)}
                  fontWeight="600"
                  fontFamily="var(--font-mono), monospace"
                  fill="#ffffff"
                >
                  {n.label.length > 26 ? `${n.label.slice(0, 25)}…` : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-2 border-t border-white/[0.05] flex justify-between font-mono text-[10px] text-slate-400">
        <span>Force Directed Simulation</span>
        <span>{list.length} Nodes · {edges.length} Edges</span>
      </div>
    </div>
  );
}