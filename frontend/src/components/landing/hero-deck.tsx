'use client';

import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  CheckCircle,
  Lightning,
  Play,
  ShieldWarning,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';

interface AgentLane {
  code: string;
  name: string;
  role: string;
  focus: string;
  simulatedQuote: string;
  conf: number;
  color: string;
  glow: string;
  badge: string;
}

const LANES: AgentLane[] = [
  {
    code: 'RES-01',
    name: 'Kai',
    role: 'Deep Researcher',
    focus: 'Empirical Evidence & Primary Sources',
    simulatedQuote: 'Verified: TSMC N3P CoWoS-L packaging achieves 78.4% yield under active heat-sink constraints.',
    conf: 0.94,
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.3)',
    badge: 'Evidence Verified',
  },
  {
    code: 'CRT-02',
    name: 'Vex',
    role: 'Adversarial Critic',
    focus: 'Red-Teaming & Logic Vulnerabilities',
    simulatedQuote: 'Adversarial counter-thesis: Peak tensor burst spikes exceed 380W TDP ceiling, risking thermal throttling.',
    conf: 0.78,
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
    badge: 'Counter-Thesis Flagged',
  },
  {
    code: 'ANL-03',
    name: 'Lyra',
    role: 'Quant Analyst',
    focus: 'Bayesian Weights & Probability',
    simulatedQuote: 'Calibrated: Bayesian probability distribution adjusted to 89.2% with microchannel vapor chamber cooling.',
    conf: 0.89,
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.3)',
    badge: 'Signal Calibrated',
  },
  {
    code: 'SYN-04',
    name: 'Nova',
    role: 'Executive Synthesizer',
    focus: 'Converged Action Plan & Dissent Audit',
    simulatedQuote: 'Defensible consensus locked: Mandate hybrid 2.5D chiplet interconnect with dual-redundancy interposers.',
    conf: 0.97,
    color: '#00d2ff',
    glow: 'rgba(0, 210, 255, 0.3)',
    badge: 'Consensus Converged',
  },
];

export function HeroDeck() {
  const [activeLane, setActiveLane] = useState<string | null>(null);
  const [simStep, setSimStep] = useState<number>(-1); // -1: idle, 0: Kai, 1: Vex, 2: Lyra, 3: Nova, 4: Converged
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(0);
    setActiveLane(LANES[0].code);

    const stepInterval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepInterval);
          setIsSimulating(false);
          setActiveLane(null);
          return 4; // converged
        }
        const next = prev + 1;
        setActiveLane(LANES[next].code);
        return next;
      });
    }, 1800);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper-2)] p-2 shadow-[var(--shadow-lg)] transition-all duration-300">
      {/* Top ambient signal line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      {/* Machined Inner Core */}
      <div className="rounded-[22px] border border-[var(--line-subtle)] bg-[var(--paper)]/60 p-5 sm:p-6 backdrop-blur-xl">
        {/* Cockpit Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[14px] font-bold text-[var(--ink)]">
                  Neural Swarm Pipeline
                </span>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 border border-cyan-500/25">
                  LIVE DELIBERATION ARENA
                </span>
              </div>
              <p className="m-0 text-[11px] text-[var(--dim)]">
                Four autonomous neural lanes cross-examining in real time on Groq LPU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11.5px] font-semibold transition-all duration-200 cursor-pointer ${
                isSimulating
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                  : 'bg-[var(--paper-3)] text-[var(--ink)] border border-[var(--line)] hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-400 shadow-sm'
              }`}
            >
              {isSimulating ? (
                <>
                  <ArrowClockwise size={13} className="spin" />
                  <span>Simulating Deliberation...</span>
                </>
              ) : (
                <>
                  <Lightning size={13} weight="fill" className="text-cyan-400" />
                  <span>Simulate Live Consensus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic 4-Agent Grid */}
        <div className="grid gap-3.5 pt-5 sm:grid-cols-2">
          {LANES.map((lane, index) => {
            const isSpeaking = simStep === index;
            const isSelected = activeLane === lane.code;
            return (
              <div
                key={lane.code}
                onClick={() => setActiveLane(isSelected ? null : lane.code)}
                className={`group relative cursor-pointer rounded-2xl border p-4.5 transition-all duration-300 ${
                  isSpeaking
                    ? 'border-cyan-400/70 bg-cyan-500/[0.08] shadow-[0_0_30px_rgba(0,210,255,0.25)] scale-[1.01]'
                    : isSelected
                    ? 'border-[var(--line-strong)] bg-[var(--paper-2)] shadow-md'
                    : 'border-[var(--line)] bg-[var(--paper-2)]/80 hover:border-[var(--line-strong)] hover:bg-[var(--paper-2)]'
                }`}
              >
                {/* Visual Status Indicator Bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all duration-300"
                  style={{
                    backgroundColor: lane.color,
                    boxShadow: isSpeaking || isSelected ? `0 0 12px ${lane.color}` : 'none',
                  }}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-[var(--ink)]">
                        {lane.name}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold border"
                        style={{
                          backgroundColor: `${lane.color}15`,
                          borderColor: `${lane.color}35`,
                          color: lane.color,
                        }}
                      >
                        {lane.role}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--faint)]">
                        {lane.code}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] font-medium text-[var(--dim)] truncate">
                      {lane.focus}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className="font-mono text-[14px] font-bold"
                      style={{ color: lane.color }}
                    >
                      {Math.round(lane.conf * 100)}%
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)]">
                      Confidence
                    </span>
                  </div>
                </div>

                {/* Simulated Live Reasoning Bubble */}
                <div
                  className={`mt-3 rounded-xl border p-2.5 transition-all duration-300 ${
                    isSpeaking
                      ? 'border-cyan-400/40 bg-cyan-500/10'
                      : 'border-[var(--line-subtle)] bg-[var(--paper-3)]/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--faint)] mb-1">
                    {isSpeaking && <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
                    <span className="font-semibold" style={{ color: lane.color }}>
                      {lane.badge}
                    </span>
                    <span>·</span>
                    <span>14:22:{10 + index * 3}</span>
                  </div>
                  <p className="m-0 text-[12px] leading-relaxed text-[var(--ink)]">
                    {lane.simulatedQuote}
                  </p>
                </div>

                {/* Micro Telemetry Bar */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--line-subtle)] text-[11px] font-mono text-[var(--dim)]">
                  <span>Pass {index + 1}/4</span>
                  <span className="text-[var(--faint)]">Groq LPU &lt;580ms</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Synthesis Reactor Banner */}
        <div className="mt-4 relative overflow-hidden rounded-2xl border border-cyan-500/35 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-indigo-950/30 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,210,255,0.12)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-400 ring-1 ring-cyan-400/50 shadow-inner">
                <Sparkle size={22} weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[14.5px] font-bold text-[var(--ink)]">
                    Synthesized Audit Verdict
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-emerald-400 border border-emerald-500/35">
                    DEFENSIBLE
                  </span>
                </div>
                <p className="m-0 mt-0.5 text-[12px] text-[var(--dim)]">
                  All 4 specialist reasoning paths reconciled · Formal dissent documented · Ready for executive review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-2 sm:pt-0 sm:pl-4">
              <div className="text-right">
                <span className="font-mono text-[16px] font-extrabold text-cyan-400">
                  96.4%
                </span>
                <span className="block font-mono text-[9.5px] uppercase tracking-wider text-[var(--faint)]">
                  Weighted Consensus
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Strip */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--line)] border-t border-[var(--line)] pt-3 text-center sm:text-left">
          <div className="px-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--faint)]">
              Turn Latency
            </span>
            <p className="font-mono m-0 mt-0.5 text-[13px] font-semibold text-[var(--ink)]">
              0.58s / pass
            </p>
          </div>
          <div className="px-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--faint)]">
              Cross-Examination
            </span>
            <p className="font-mono m-0 mt-0.5 text-[13px] font-semibold text-emerald-400">
              4 Parallel Passes
            </p>
          </div>
          <div className="px-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--faint)]">
              Dissent Audit
            </span>
            <p className="font-mono m-0 mt-0.5 text-[13px] font-semibold text-amber-400">
              100% Preserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
