'use client';

import { useState } from 'react';
import {
  CaretDown,
  CaretUp,
  CheckCircle,
  Copy,
  Cpu,
  FileCode,
  FileText,
  Fingerprint,
  Lightning,
  Pulse,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';

interface StreamEvent {
  agent: string;
  role: string;
  phase: string;
  color: string;
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
    phase: 'Evidence Retrieval',
    color: '#10b981',
    text: 'Cites Node.js libuv threadpool benchmarks: Mutex locks block asynchronous event loop workers under concurrent tensor dispatch.',
    time: '14:22:04.18',
    status: 'Verified',
    latency: '142ms',
    citations: ['libuv Event Loop Spec v1.48', 'Node.js Threadpool Architecture Doc'],
    proofHash: '0x8f4a2b919d701e83f5c71b69f8849c',
  },
  {
    agent: 'Vex',
    role: 'Adversarial Critic',
    phase: 'Red-Team Attack',
    color: '#f59e0b',
    text: 'Identifies lock-convoy race condition: Thread starvation cascades into memory exhaustion at 8,200 concurrent webhook workers.',
    time: '14:22:05.42',
    status: 'Flagged Flaw',
    latency: '158ms',
    citations: ['Concurrency Collapse Benchmark v2.1', 'Deadlock Detection Trace'],
    proofHash: '0xb104ef937a06d214c7719f20e4912a',
  },
  {
    agent: 'Lyra',
    role: 'Quant Analyst',
    phase: 'Bayesian Calibration',
    color: '#6366f1',
    text: 'Recalibrates production risk: P(Service Collapse) elevated to 88.4%. Recommended mitigation: zero-copy ring buffer architecture.',
    time: '14:22:07.09',
    status: 'Calibrated',
    latency: '135ms',
    citations: ['Bayesian Reliability Matrix', 'Queue Saturation Modeling RFC'],
    proofHash: '0x49c8192a8e71b59012f46d819e9921',
  },
  {
    agent: 'Nova',
    role: 'Executive Synthesizer',
    phase: 'Consensus Resolution',
    color: 'var(--ink)',
    text: 'Reconciles peer claims: Mandates zero-copy atomic ring buffer with spin-locks. Preserves minority latency trade-off in audit memo.',
    time: '14:22:08.91',
    status: 'Synthesized',
    latency: '188ms',
    citations: ['EU AI Act Art. 14 Trace Manifest', 'Executive Action Directive v4'],
    proofHash: '0x9e8841a029c7b1149e8310f88214de',
  },
];

export function EnterpriseObservability() {
  const [filter, setFilter] = useState<'all' | 'Kai' | 'Vex' | 'Lyra' | 'Nova'>('all');
  const [expanded, setExpanded] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  const filtered = filter === 'all' ? STREAM_ITEMS : STREAM_ITEMS.filter((it) => it.agent === filter);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lanes = [
    { name: 'Kai', role: 'Empirical Research', score: '94%', count: '14 Sources', status: 'Converged', bar: 94 },
    { name: 'Vex', role: 'Adversarial Critic', score: '78%', count: '2 Flaws Found', status: 'Defended', bar: 78 },
    { name: 'Lyra', role: 'Quant Calibration', score: '89%', count: '98.2% Confidence', status: 'Calibrated', bar: 89 },
    { name: 'Nova', role: 'Executive Synthesis', score: '97%', count: '1 Action Memo', status: 'Signed', bar: 97 },
  ];

  return (
    <div className="relative">
      {/* Volumetric Underglow */}
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-[var(--backlight-core)] to-transparent opacity-60 blur-3xl pointer-events-none" />

      <div className="relative glass-bezel-outer shadow-2xl">
        <div className="glass-bezel-inner p-5 sm:p-8">
          {/* Top Control Bar: Enterprise Telemetry Status */}
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full glass-pill px-3 py-1 font-mono text-[11px] font-bold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE DELIBERATION STREAM
              </span>
              <span className="font-mono text-[11px] text-[var(--faint)]">
                4 Nodes Active · 142ms Avg Latency
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full glass-pill px-3 py-1 font-mono text-[11px] text-[var(--dim)]">
                <Fingerprint size={13} className="text-emerald-500" />
                <span>SHA-256 AUDIT VERIFIED</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full glass-pill px-3 py-1 font-mono text-[11px] font-medium text-[var(--dim)] transition-all hover:text-[var(--ink)] cursor-pointer"
              >
                <Copy size={12} />
                <span>{copied ? 'Copied!' : 'Export Trace'}</span>
              </button>
            </div>
          </div>

          {/* Lane Filter Switcher */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {(['all', 'Kai', 'Vex', 'Lyra', 'Nova'] as const).map((agentKey) => {
              const isSelected = filter === agentKey;
              return (
                <button
                  key={agentKey}
                  type="button"
                  onClick={() => setFilter(agentKey)}
                  className={`rounded-full px-3.5 py-1 font-mono text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--ink)] text-[var(--paper)] font-bold shadow-xs'
                      : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
                  }`}
                >
                  {agentKey === 'all' ? 'All Lanes (4)' : `${agentKey}`}
                </button>
              );
            })}
          </div>

          {/* Main 2-Column Telemetry Dashboard */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            {/* Left Track: Real-Time Deliberation Feed */}
            <div className="rounded-2xl glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--faint)]">
                  Sequential Audit Log
                </span>
                <span className="font-mono text-[10.5px] text-[var(--faint)]">
                  {filtered.length} Events Logged
                </span>
              </div>

              <div className="space-y-3">
                {filtered.map((item, idx) => {
                  const isExp = expanded === idx;
                  return (
                    <div
                      key={item.agent + idx}
                      onClick={() => setExpanded(isExp ? null : idx)}
                      className="group rounded-xl glass-pill p-3.5 transition-all hover:bg-white/[0.04] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: item.color === 'var(--ink)' ? '#3b82f6' : item.color }}
                          >
                            {item.agent[0]}
                          </span>
                          <div>
                            <span className="font-display text-[13px] font-bold text-[var(--ink)]">
                              {item.agent}
                            </span>
                            <span className="font-mono text-[10.5px] text-[var(--faint)] ml-2">
                              {item.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full glass-pill px-2 py-0.5 font-mono text-[10px] text-[var(--dim)]">
                            {item.phase}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--faint)]">
                            {item.time}
                          </span>
                          {isExp ? <CaretUp size={12} /> : <CaretDown size={12} />}
                        </div>
                      </div>

                      <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--dim)] group-hover:text-[var(--ink)] transition-colors">
                        {item.text}
                      </p>

                      {/* Expandable Cryptographic Telemetry Drawer */}
                      {isExp && (
                        <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--paper-3)]/60 p-3 text-[11px] font-mono space-y-1.5 animate-in fade-in-up duration-200">
                          <div className="flex items-center justify-between text-[var(--dim)]">
                            <span>Inference Turn:</span>
                            <span className="font-bold text-[var(--ink)]">{item.latency} execution</span>
                          </div>
                          <div className="flex items-center justify-between text-[var(--dim)]">
                            <span>Proof Hash:</span>
                            <span className="font-mono text-[var(--faint)] truncate max-w-[200px]">{item.proofHash}</span>
                          </div>
                          <div className="pt-1.5 border-t border-[var(--line)]">
                            <span className="text-[var(--faint)] block mb-1">Citations & Standards:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.citations.map((c) => (
                                <span key={c} className="rounded-md glass-pill px-2 py-0.5 text-[10px] text-[var(--ink)] font-medium">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Track: Convergence Matrix & Governance */}
            <div className="flex flex-col gap-5">
              {/* Convergence Scores */}
              <div className="rounded-2xl glass-card p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--faint)]">
                    Consensus Convergence
                  </span>
                  <span className="font-mono text-[10.5px] font-semibold text-emerald-500">
                    Audit Grade · 100%
                  </span>
                </div>

                <div className="space-y-3">
                  {lanes.map((lane) => (
                    <div key={lane.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-[var(--ink)]">{lane.name}</span>
                          <span className="font-mono text-[10.5px] text-[var(--faint)]">({lane.role})</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[var(--ink)]">{lane.score}</span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                        <div
                          className="h-full rounded-full bg-[var(--ink)] transition-all duration-700"
                          style={{ width: `${lane.bar}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--faint)]">
                        <span>{lane.count}</span>
                        <span className="text-emerald-500 font-medium">✓ {lane.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immutable Governance & Dissent Guarantee */}
              <div className="rounded-2xl glass-card p-4 sm:p-5">
                <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3 mb-3">
                  <ShieldCheck size={16} weight="bold" className="text-emerald-500" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                    Immutable Governance Guarantee
                  </span>
                </div>

                <p className="text-[12px] leading-relaxed text-[var(--dim)] m-0">
                  Minority dissents and adversarial stress-tests are never averaged out or suppressed. Every dissenting opinion is cryptographically signed and archived directly in the verdict manifest for legal and audit compliance.
                </p>

                <div className="mt-4 flex items-center justify-between rounded-xl glass-pill px-3 py-2 font-mono text-[10.5px]">
                  <span className="text-[var(--faint)]">Regulatory Standard</span>
                  <span className="font-bold text-[var(--ink)]">EU AI Act Art. 14 Oversight</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
