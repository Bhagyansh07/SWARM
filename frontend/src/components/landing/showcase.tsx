'use client';

import { useState } from 'react';
import { Panel } from '../ui';
import {
  CaretDown,
  CaretUp,
  CheckCircle,
  FileText,
  Pulse,
  ShieldCheck,
  ShieldWarning,
} from '@phosphor-icons/react/dist/ssr';

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
    <div
      className={`pointer-events-none absolute ${
        align === 'left' ? 'right-full' : 'left-full'
      } top-1/2 hidden w-[210px] -translate-y-1/2 lg:block ${
        align === 'left' ? 'mr-5 text-right' : 'ml-5'
      } ${className}`}
    >
      <p className="font-mono m-0 text-[11px] leading-relaxed text-[var(--dim)]">{label}</p>
      <svg
        viewBox="0 0 40 24"
        className="mt-1 inline-block h-6 w-10 text-[var(--dim)]"
        style={{ transform: align === 'left' ? 'scaleX(-1)' : undefined }}
      >
        <path d="M2 12h30" stroke="currentColor" fill="none" strokeWidth="1.5" />
        <path d="m24 5 9 7-9 7" stroke="currentColor" fill="none" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

interface StreamEvent {
  agent: string;
  role: string;
  phase: string;
  text: string;
  time: string;
  status: string;
  latency: string;
  citations: string[];
  proofHash: string;
}

const STREAM_ITEMS: StreamEvent[] = [
  {
    agent: 'Kai',
    role: 'Researcher',
    phase: 'Empirical Evidence',
    text: 'Cites Node.js libuv threadpool benchmarks: Mutex locks block asynchronous event loop workers under concurrent tensor dispatch.',
    time: '14:22:04.18',
    status: 'Verified',
    latency: '142ms on Groq LPU',
    citations: ['libuv Event Loop Spec v1.48', 'Node.js Threadpool Architecture Doc'],
    proofHash: '0x8f4a2b919d701e83f5c71b69f8849c',
  },
  {
    agent: 'Vex',
    role: 'Adversarial Critic',
    phase: 'Stress-Test Attack',
    text: 'Identifies lock-convoy race condition: Thread starvation cascades into memory exhaustion at 8,200 concurrent webhook workers.',
    time: '14:22:05.42',
    status: 'Flagged',
    latency: '158ms on Groq LPU',
    citations: ['Concurrency Collapse Benchmark v2.1', 'Deadlock Detection Trace'],
    proofHash: '0xb104ef937a06d214c7719f20e4912a',
  },
  {
    agent: 'Lyra',
    role: 'Quantitative Analyst',
    phase: 'Bayesian Calibration',
    text: 'Recalibrates production risk: P(Service Collapse) elevated to 88.4%. Recommended mitigation: zero-copy ring buffer architecture.',
    time: '14:22:07.09',
    status: 'Calibrated',
    latency: '135ms on Groq LPU',
    citations: ['Bayesian Reliability Matrix', 'Queue Saturation Modeling RFC'],
    proofHash: '0x49c8192a8e71b59012f46d819e9921',
  },
  {
    agent: 'Nova',
    role: 'Executive Synthesizer',
    phase: 'Consensus Resolution',
    text: 'Reconciles peer claims: Mandates zero-copy atomic ring buffer with spin-locks. Preserves minority latency trade-off in audit memo.',
    time: '14:22:08.91',
    status: 'Resolved',
    latency: '188ms on Groq LPU',
    citations: ['EU AI Act Art. 14 Trace Manifest', 'Executive Action Directive v4'],
    proofHash: '0x9e8841a029c7b1149e8310f88214de',
  },
];

export function ReasoningStreamFrame() {
  const [filter, setFilter] = useState<'all' | 'Kai' | 'Vex' | 'Lyra' | 'Nova'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = filter === 'all' ? STREAM_ITEMS : STREAM_ITEMS.filter((it) => it.agent === filter);

  return (
    <Panel
      title="Audit Trail & Deliberation Trace"
      right={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          4 Events Logged · 0 Dropped
        </span>
      }
    >
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--line)] p-3 bg-white/[0.015] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[var(--ink)] text-[var(--paper)] font-semibold shadow-xs'
              : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
          }`}
        >
          All Lanes ({STREAM_ITEMS.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('Kai')}
          className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all cursor-pointer ${
            filter === 'Kai'
              ? 'bg-[var(--ink)] text-[var(--paper)] font-semibold shadow-xs'
              : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
          }`}
        >
          Kai (Research)
        </button>
        <button
          type="button"
          onClick={() => setFilter('Vex')}
          className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all cursor-pointer ${
            filter === 'Vex'
              ? 'bg-[var(--ink)] text-[var(--paper)] font-semibold shadow-xs'
              : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
          }`}
        >
          Vex (Critic)
        </button>
        <button
          type="button"
          onClick={() => setFilter('Lyra')}
          className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all cursor-pointer ${
            filter === 'Lyra'
              ? 'bg-[var(--ink)] text-[var(--paper)] font-semibold shadow-xs'
              : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
          }`}
        >
          Lyra (Analyst)
        </button>
        <button
          type="button"
          onClick={() => setFilter('Nova')}
          className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all cursor-pointer ${
            filter === 'Nova'
              ? 'bg-[var(--ink)] text-[var(--paper)] font-semibold shadow-xs'
              : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
          }`}
        >
          Nova (Synthesizer)
        </button>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {filtered.map((it, i) => {
          const isExp = expanded === i;
          return (
            <div
              key={i}
              onClick={() => setExpanded(isExp ? null : i)}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[13px] font-bold text-[var(--ink)]">
                    {it.agent}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--faint)]">
                    ({it.role})
                  </span>
                  <span className="glass-pill rounded-full px-2 py-0.5 font-mono text-[10px] text-[var(--dim)]">
                    {it.phase}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] text-[var(--faint)]">
                    {it.time}
                  </span>
                  {isExp ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </div>
              </div>

              <p className="m-0 text-[13px] leading-relaxed text-[var(--dim)]">
                {it.text}
              </p>

              {/* Expandable Cryptographic Telemetry Drawer */}
              {isExp && (
                <div className="mt-2.5 rounded-xl glass-card p-3.5 space-y-2 text-[11.5px] font-mono animate-in fade-in-up duration-200">
                  <div className="flex items-center justify-between text-[var(--dim)]">
                    <span>Inference Execution</span>
                    <span className="text-[var(--ink)] font-bold">{it.latency}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--dim)]">
                    <span>Cryptographic Hash</span>
                    <span className="text-[var(--faint)] truncate max-w-[220px]">{it.proofHash}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--line)]">
                    <span className="text-[var(--faint)] block mb-1">Empirical Citations:</span>
                    <ul className="list-disc list-inside text-[var(--ink)] space-y-0.5 m-0 p-0">
                      {it.citations.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function OrbitFrame() {
  const lanes = [
    { name: 'Kai', role: 'Empirical Evidence', metric: '14 Sources', status: 'Converged', pct: 94 },
    { name: 'Vex', role: 'Adversarial Red-Team', metric: '2 Flaws Intercepted', status: 'Defended', pct: 78 },
    { name: 'Lyra', role: 'Bayesian Probability', metric: '98.2% Confidence', status: 'Calibrated', pct: 89 },
    { name: 'Nova', role: 'Executive Synthesis', metric: '1 Action Memo', status: 'Finalized', pct: 97 },
  ];

  return (
    <Panel
      title="Consensus Health & Convergence"
      right={
        <span className="font-mono text-[11px] font-medium text-[var(--faint)]">
          Audit Grade · 100%
        </span>
      }
    >
      <div className="divide-y divide-[var(--line)]">
        {lanes.map((lane) => (
          <div key={lane.name} className="flex flex-col gap-1.5 p-3.5 px-4.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-[13px] font-bold text-[var(--ink)]">
                  {lane.name}
                </span>
                <span className="text-[12px] text-[var(--dim)]">
                  {lane.role}
                </span>
              </div>
              <span className="glass-pill rounded-full px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--dim)]">
                {lane.status}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-[var(--faint)]">
              <span>{lane.metric}</span>
              <span>{lane.pct}% calibrated</span>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--ink)] transition-all duration-500"
                style={{ width: `${lane.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function GraphFrame() {
  return (
    <Panel
      title="Governance & Dissent Logging"
      right={
        <span className="font-mono text-[11px] font-medium text-[var(--faint)]">
          EU AI Act Art. 14 Compliant
        </span>
      }
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3 rounded-xl glass-card p-3.5">
          <ShieldCheck size={18} weight="bold" className="text-[var(--ink)] shrink-0 mt-0.5" />
          <div className="text-[12.5px] leading-relaxed">
            <span className="font-semibold text-[var(--ink)] block">
              Immutable Minority Dissent Retention
            </span>
            <span className="text-[var(--dim)]">
              Disagreements and dissenting risk evaluations are never averaged out or silenced. They are cryptographically logged in the verdict manifest.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl glass-card p-3.5">
          <FileText size={18} weight="bold" className="text-[var(--ink)] shrink-0 mt-0.5" />
          <div className="text-[12.5px] leading-relaxed">
            <span className="font-semibold text-[var(--ink)] block">
              Sub-Second Parallel Execution
            </span>
            <span className="text-[var(--dim)]">
              Four models deliberate concurrently in sub-second inference passes with 100% auditable citation traces.
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}