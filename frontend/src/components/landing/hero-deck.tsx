const LANES = [
  { code: 'RES', name: 'KAI', phase: 'gather', conf: 0.38 },
  { code: 'ANL', name: 'LYRA', phase: 'analyze', conf: 0.72 },
  { code: 'CRT', name: 'VEX', phase: 'attack', conf: 0.21 },
  { code: 'SYN', name: 'NOVA', phase: 'converge', conf: 0.66 },
];

function tone(conf: number): string {
  if (conf >= 0.6) return 'var(--ok)';
  if (conf >= 0.35) return 'var(--signal)';
  return 'var(--warn)';
}

/**
 * Static read-out of a mission in flight: four agent lanes wired onto a shared
 * bus that resolves to a single verdict. Drawn flat and to scale — it is a
 * schematic, not a scene.
 */
export function HeroDeck() {
  const laneY = (i: number) => 30 + i * 62;

  return (
    <section className="panel overflow-hidden">
      <header className="panel-head flex items-center justify-between gap-3 px-4 py-2">
        <h3 className="font-display m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
          <span className="rack-index mr-2 align-middle">BUS.00</span>
          Signal routing
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">live schematic</span>
      </header>

      <div className="px-4 pb-2 pt-4">
        <svg viewBox="0 0 520 252" className="h-auto w-full" role="img" aria-label="Agent lanes routed to a converged verdict">
          {/* shared bus */}
          <line x1={268} y1={22} x2={268} y2={224} stroke="var(--line-strong)" strokeWidth={1.5} />
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={264} y1={28 + i * 14} x2={272} y2={28 + i * 14} stroke="var(--faint)" strokeWidth={0.5} opacity={0.45} />
          ))}

          {LANES.map((lane, i) => {
            const y = laneY(i);
            const color = tone(lane.conf);
            return (
              <g key={lane.code}>
                <rect x={6} y={y - 22} width={148} height={44} fill="var(--paper-3)" stroke="var(--line-strong)" strokeWidth={1} />
                <rect x={6} y={y - 22} width={4} height={44} fill={color} />
                <text x={18} y={y - 4} fontFamily="var(--font-mono), monospace" fontSize={11} letterSpacing="1.5" fill="var(--ink)">
                  {lane.code} · {lane.name}
                </text>
                <text x={18} y={y + 11} fontFamily="var(--font-mono), monospace" fontSize={8.5} letterSpacing="1.4" fill="var(--faint)">
                  {lane.phase.toUpperCase()}
                </text>
                <text x={146} y={y + 11} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={9} letterSpacing="1" fill={color}>
                  {Math.round(lane.conf * 100)}%
                </text>

                {/* lane → bus */}
                <line x1={154} y1={y} x2={268} y2={y} stroke={color} strokeWidth={1.2} opacity={0.85} />
                <circle cx={268} cy={y} r={3.2} fill={color} />
              </g>
            );
          })}

          {/* bus → verdict */}
          <line x1={268} y1={123} x2={330} y2={123} stroke="var(--signal)" strokeWidth={1.4} />
          <path d="M338 115 l10 8 -10 8" fill="none" stroke="var(--signal)" strokeWidth={1.4} />

          <rect x={330} y={92} width={182} height={62} fill="var(--signal-dim)" stroke="var(--signal)" strokeWidth={1.2} />
          <text x={344} y={114} fontFamily="var(--font-display), sans-serif" fontWeight={700} fontSize={12} letterSpacing="1.5" fill="var(--ink)">
            CONVERGED VERDICT
          </text>
          <rect x={344} y={124} width={154} height={4} fill="var(--line)" />
          <rect x={344} y={124} width={154 * 0.66} height={4} fill="var(--signal)" />
          <text x={344} y={143} fontFamily="var(--font-mono), monospace" fontSize={8.5} letterSpacing="1.2" fill="var(--dim)">
            4 LANES · 1 DISSENT UNRESOLVED
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-[var(--line)] bg-[var(--line)]">
        {[
          ['runtime', 'groq · live'],
          ['turn latency', '0.6–1.0s'],
          ['tokens / run', '~1.9k'],
        ].map(([label, value]) => (
          <div key={label} className="bg-[var(--paper-2)] px-4 py-3">
            <span className="readout-label block">{label}</span>
            <span className="font-mono mt-1 block text-[12.5px] text-[var(--dim)]">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
