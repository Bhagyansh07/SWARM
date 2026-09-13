import { Panel } from '../ui';
import { GlyphCore } from '../glyphs';

export function ArrowNote({
  label,
  align = 'left',
  className = '',
}: {
  label: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute ${align === 'left' ? 'right-full' : 'left-full'} top-1/2 hidden w-[210px] -translate-y-1/2 lg:block ${align === 'left' ? 'mr-5 text-right' : 'ml-5'} ${className}`}>
      <p className="font-mono m-0 text-[11px] leading-relaxed text-[var(--dim)]">{label}</p>
      <svg viewBox="0 0 40 24" className="glyph mt-1 inline-block h-6 w-10" style={{ transform: align === 'left' ? 'scaleX(-1)' : undefined }}>
        <path d="M2 12h30" />
        <path d="m24 5 9 7-9 7" />
      </svg>
    </div>
  );
}

const GEN: Record<string, { tag: string; color: string }> = {
  evidence: { tag: 'EVIDENCE', color: 'var(--signal)' },
  critique: { tag: 'ATTACK', color: 'var(--warn)' },
  thought: { tag: 'SIGNAL', color: 'var(--ok)' },
  synthesis: { tag: 'VERDICT', color: 'var(--signal)' },
};

export function ReasoningStreamFrame() {
  const items = [
    { agent: 'AGT-01/KAI', kind: 'evidence', text: 'Claim: the retail layer is consolidating faster than the logistics that serve it.' },
    { agent: 'AGT-03/VEX', kind: 'critique', text: 'Attack: that assumes inventory data is shareable — it is the moat, not the seam.' },
    { agent: 'AGT-02/LYRA', kind: 'thought', text: 'Signal weighted at 71%. Secondary source, single geography, still directional.' },
    { agent: 'AGT-04/NOVA', kind: 'synthesis', text: 'Verdict: real but mispriced — the swarm converges with one dissent unresolved.' },
  ];
  return (
    <Panel title="Reasoning stream" index="SAC.01" right={<span className="led led-live" aria-hidden style={{ background: 'var(--ok)', boxShadow: '0 0 6px var(--ok)' }} />}>
      <ol className="m-0 list-none">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 border-b border-[var(--line)] px-4 py-2.5 last:border-0">
            <span className="font-mono pt-0.5 text-[10px] text-[var(--faint)]">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0">
              <p className="font-mono m-0 text-[10px] uppercase tracking-[0.12em]" style={{ color: it.agent === 'AGT-04/NOVA' ? 'var(--dim)' : 'var(--faint)' }}>
                <span style={{ color: GEN[it.kind].color }}>{GEN[it.kind].tag}</span>
                <span className="mx-2 opacity-40">/</span>
                {it.agent}
              </p>
              <p className="m-0 pt-0.5 text-[13px] leading-snug text-[var(--ink)]">{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function OrbitFrame() {
  const agents = [
    { code: 'AGT-02', role: 'ANALYST', conf: 0.72 },
    { code: 'AGT-01', role: 'RESEARCHER', conf: 0.38 },
    { code: 'AGT-03', role: 'CRITIC', conf: 0.21 },
    { code: 'AGT-04', role: 'SYNTHESIZER', conf: 0.66 },
  ];
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <Panel title="Active agents" index="ATC.02" accent right={<span className="led led-live" aria-hidden style={{ background: 'var(--signal)', boxShadow: '0 0 6px var(--signal)' }} />}>
      <div className="flex items-center gap-5 px-4 py-4">
        <div className="relative mx-auto aspect-square w-[190px] shrink-0">
          <svg viewBox="-100 -100 200 200" className="h-full w-full">
            {ticks.map((a) => {
              const rad = (a * Math.PI) / 180;
              const major = a % 45 === 0;
              const r1 = 88;
              const r2 = major ? 82 : 85;
              return <line key={a} x1={Math.cos(rad) * r2} y1={Math.sin(rad) * r2} x2={Math.cos(rad) * r1} y2={Math.sin(rad) * r1} stroke="var(--faint)" strokeWidth={major ? 1 : 0.6} opacity={major ? 0.9 : 0.5} />;
            })}
            <circle r="60" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 4" />
            <circle r="24" fill="none" stroke="var(--line)" strokeWidth="1" />
            {agents.map((g, i) => {
              const rad = (i * 90 - 90) * (Math.PI / 180);
              const x = Math.cos(rad) * 60;
              const y = Math.sin(rad) * 60;
              const cx = Math.cos(rad) * 98;
              const cy = Math.sin(rad) * 98;
              return (
                <g key={g.code}>
                  <line x1={x} y1={y} x2={0} y2={0} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
                  <rect x={x - 3} y={y - 3} width="6" height="6" fill={g.conf > 0.6 ? 'var(--ok)' : g.conf > 0.35 ? 'var(--signal)' : 'var(--warn)'} />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    fontSize="5.2"
                    fill="var(--dim)"
                    fontFamily="var(--font-mono, monospace)"
                    letterSpacing="0.06em"
                  >
                    {g.role}
                  </text>
                </g>
              );
            })}
            <g stroke="var(--signal)" strokeWidth="1" transform="translate(-11 -11)">
              <GlyphCore width={22} height={22} />
            </g>
          </svg>
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          {agents.map((g) => (
            <div key={g.code} className="readout">
              <span className="readout-label">
                {g.code} · {g.role}
              </span>
              <span className="readout-value" style={{ color: g.conf > 0.6 ? 'var(--ok)' : g.conf > 0.35 ? 'var(--signal)' : 'var(--warn)' }}>
                {Math.round(g.conf * 100)}%
              </span>
            </div>
          ))}
          <div className="readout border-t border-[var(--line)] pt-2">
            <span className="readout-label">model</span>
            <span className="readout-value">qwen/qwen3.8-27b</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function GraphFrame() {
  const nodes = [
    { x: 20, y: 40, r: 9, label: 'market structure', kind: 'concept' },
    { x: 72, y: 18, r: 7, label: 'liquidity', kind: 'fact' },
    { x: 74, y: 64, r: 7, label: 'live inventory', kind: 'claim' },
    { x: 40, y: 86, r: 8, label: 'attrition', kind: 'entity' },
  ];
  const kindColor: Record<string, string> = {
    concept: 'var(--faint)',
    fact: 'var(--ok)',
    claim: 'var(--warn)',
    entity: 'var(--signal)',
  };
  return (
    <Panel title="Knowledge graph" index="KGC.03" right={
      <span className="rack-index">4 nodes · 5 edges</span>
    }>
      <div className="relative mx-auto h-[220px] w-[300px] max-w-full pb-5 pt-2">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <g stroke="var(--line-strong)" strokeWidth="0.4" opacity="0.8">
            <path d="M20 40 C 45 26 60 22 72 18" />
            <path d="M20 40 C 42 60 60 60 74 64" />
            <path d="M20 40 C 30 70 36 82 40 86" />
            <path d="M72 18 C 76 42 74 54 74 64" />
            <path d="M74 64 C 60 78 50 82 40 86" />
          </g>
          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r} fill={i === 0 ? 'var(--paper-3)' : 'var(--paper-2)'} stroke={kindColor[n.kind]} strokeWidth="0.6" />
              <text x={n.x} y={n.y + n.r + 4} textAnchor="middle" fontSize={i === 0 ? 2.4 : 2.2} fill="var(--dim)" fontFamily="var(--font-mono, monospace)">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Panel>
  );
}