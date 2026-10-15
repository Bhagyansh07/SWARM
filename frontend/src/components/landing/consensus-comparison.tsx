'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Cpu,
  Lightning,
  ShieldCheck,
  WarningCircle,
  XCircle,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';

interface Scenario {
  id: string;
  title: string;
  icon: typeof Cpu;
  brief: string;
  singleLlm: {
    status: string;
    flaw: string;
    quote: string;
  };
  swarm: {
    kai: string;
    vex: string;
    lyra: string;
    nova: string;
    status: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'concurrency',
    title: 'High-Load Payment Service',
    icon: Cpu,
    brief: 'Deploying a high-volume payment gateway handling 12,000 requests/sec with shared memory locks.',
    singleLlm: {
      status: 'Missed Race Condition',
      flaw: 'Thread Pool Lock Collapse. Standard mutex locks freeze Node.js event loop workers under peak traffic.',
      quote: '"The architecture is robust and production-ready. Standard mutex locking ensures thread safety."',
    },
    swarm: {
      kai: 'Cites Node.js benchmarks: Mutex locks will block the asynchronous event loop under load.',
      vex: 'Stress test: At 8,000 concurrent webhooks, lock contention causes cascading deadlock.',
      lyra: 'Quantifies 88.4% crash risk within 45 minutes of market opening.',
      nova: 'Prescribes fix: Replace mutex with zero-copy atomic ring buffers and non-blocking workers.',
      status: 'Production Crash Averted',
    },
  },
  {
    id: 'silicon',
    title: '3D Chiplet Thermal Limits',
    icon: Lightning,
    brief: 'Evaluating 2.5D vs 3D chiplet stacking for an edge AI processor under a 350W thermal budget.',
    singleLlm: {
      status: 'Missed Thermal Limits',
      flaw: 'Thermal Dissipation Violation. 3D stack heat density exceeds passive enterprise cooling limits.',
      quote: '"Both 2.5D and 3D stacking offer high bandwidth. Either option will easily meet cooling limits."',
    },
    swarm: {
      kai: 'Verifies foundry specifications: 3D stacking thermal density exceeds 1.2 W/mm² at peak inference.',
      vex: 'Red-teams cooling: 3D stack hotspot breaches 380W, causing permanent thermal throttling.',
      lyra: 'Models thermal curves: 2.5D packaging yields 91.2% higher sustained throughput per watt.',
      nova: 'Prescribes fix: Adopt hybrid 2.5D interposer with active microchannel vapor chambers.',
      status: 'Hardware Validated Safe',
    },
  },
  {
    id: 'legal',
    title: 'EU AI Compliance Audit',
    icon: ShieldCheck,
    brief: 'Procuring an autonomous decision copilot for EU AI Act regulatory filings and governance.',
    singleLlm: {
      status: 'Compliance Liability',
      flaw: 'Missing Dissent Log. EU AI Act Article 14 requires immutable records of minority agent objections.',
      quote: '"The system adheres to standard compliance guidelines and automates filings seamlessly."',
    },
    swarm: {
      kai: 'Audits Article 14: Mandates verifiable human oversight and full dissenting opinion logs.',
      vex: 'Flags legal liability: Single AI silences disagreement, creating direct regulatory exposure.',
      lyra: 'Calculates procurement risk: 78.4% failure probability during formal agency inspection.',
      nova: 'Prescribes fix: Generate tamper-proof audit memo preserving minority dissent with verifiable signatures.',
      status: 'Audit-Grade Compliance Ready',
    },
  },
];

export function ConsensusComparison() {
  const [activeId, setActiveId] = useState<string>('concurrency');
  const scenario = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  return (
    <div className="relative">
      {/* Subtle Ambient Backlight underglow */}
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-[var(--backlight-core)] to-transparent opacity-60 blur-3xl pointer-events-none" />

      <div className="relative glass-bezel-outer">
        <div className="glass-bezel-inner p-6 sm:p-10">
          {/* Header & Scenario Chooser */}
          <div className="text-center max-w-3xl mx-auto mb-9">
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--faint)]">
              Architecture Stress Test
            </span>
            <h2 className="font-display mt-2 text-[30px] sm:text-[40px] font-extrabold tracking-tight text-[var(--ink)]">
              See How 4 Agents Prevent <span className="text-shimmer">Production Failures</span>
            </h2>
            <p className="mt-3 text-[14.5px] text-[var(--dim)] leading-relaxed">
              Single AI models act as agreeable yes-men that miss fatal edge cases. Click an example below to see how SWARM catches critical system flaws.
            </p>

            {/* Scenario Selector Tabs */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {SCENARIOS.map((s) => {
                const isSelected = s.id === activeId;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveId(s.id)}
                    className={`flex items-center gap-2 rounded-full px-4.5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--ink)] text-[var(--paper)] border border-[var(--ink)] shadow-md scale-[1.02]'
                        : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <Icon size={15} weight={isSelected ? 'fill' : 'regular'} />
                    <span>{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scenario Brief Strip */}
          <div className="mb-7 rounded-2xl glass-card p-4 text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--faint)]">
              Scenario Brief
            </span>
            <p className="mt-1 font-display text-[14.5px] font-semibold text-[var(--ink)] max-w-2xl mx-auto">
              &ldquo;{scenario.brief}&rdquo;
            </p>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div key={activeId} className="grid gap-6 lg:grid-cols-2">
            {/* Left: Single AI (Fails) */}
            <div className="relative flex flex-col justify-between rounded-2xl glass-card p-6 shadow-md border-rose-500/25 bg-gradient-to-b from-rose-500/[0.03] to-transparent">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs">
                      ✕
                    </span>
                    <div>
                      <h3 className="font-display text-[15px] font-bold text-[var(--ink)]">
                        Standard Single AI
                      </h3>
                      <span className="font-mono text-[10px] text-[var(--faint)]">
                        Single Prompt · No Peer Review
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full glass-pill px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-500 border-rose-500/30">
                    {scenario.singleLlm.status}
                  </span>
                </div>

                {/* AI Quote */}
                <div className="rounded-xl glass-card p-3.5 mb-4">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--faint)] block mb-1">
                    What Single AI Said:
                  </span>
                  <p className="font-mono text-[12px] leading-relaxed text-[var(--dim)] italic">
                    {scenario.singleLlm.quote}
                  </p>
                </div>

                {/* The Unchecked Flaw */}
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3.5 flex items-start gap-2.5">
                  <WarningCircle size={18} weight="bold" className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-display text-[12.5px] font-bold text-[var(--ink)] block">
                      The Critical Bug It Missed:
                    </span>
                    <p className="mt-0.5 text-[12px] text-[var(--dim)] leading-relaxed">
                      {scenario.singleLlm.flaw}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-between font-mono text-[10.5px] text-[var(--faint)]">
                <span>Production Outcome</span>
                <span className="font-semibold text-rose-500">Unchecked Outage Risk</span>
              </div>
            </div>

            {/* Right: SWARM 4-Agent Collective (Succeeds) */}
            <div className="relative flex flex-col justify-between rounded-2xl glass-card p-6 shadow-md border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.03] to-transparent">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                      ✓
                    </span>
                    <div>
                      <h3 className="font-display text-[15px] font-bold text-[var(--ink)]">
                        SWARM 4-Agent Review
                      </h3>
                      <span className="font-mono text-[10px] text-[var(--dim)]">
                        Kai · Vex · Lyra · Nova
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full glass-pill px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-500 border-emerald-500/30">
                    {scenario.swarm.status}
                  </span>
                </div>

                {/* 4 Agent Steps */}
                <div className="space-y-2">
                  <div className="rounded-lg glass-pill p-2.5 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="text-[11.5px] leading-relaxed">
                      <span className="font-mono font-bold text-[var(--ink)]">1. Evidence (Kai): </span>
                      <span className="text-[var(--dim)]">{scenario.swarm.kai}</span>
                    </div>
                  </div>

                  <div className="rounded-lg glass-pill p-2.5 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="text-[11.5px] leading-relaxed">
                      <span className="font-mono font-bold text-[var(--ink)]">2. Red Team (Vex): </span>
                      <span className="text-[var(--dim)]">{scenario.swarm.vex}</span>
                    </div>
                  </div>

                  <div className="rounded-lg glass-pill p-2.5 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="text-[11.5px] leading-relaxed">
                      <span className="font-mono font-bold text-[var(--ink)]">3. Risk Model (Lyra): </span>
                      <span className="text-[var(--dim)]">{scenario.swarm.lyra}</span>
                    </div>
                  </div>

                  <div className="rounded-lg glass-pill p-2.5 flex items-start gap-2 bg-[var(--paper-3)]/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] mt-1.5 shrink-0" />
                    <div className="text-[11.5px] leading-relaxed">
                      <span className="font-mono font-bold text-[var(--ink)]">4. Resolution (Nova): </span>
                      <span className="text-[var(--ink)] font-medium">{scenario.swarm.nova}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-between font-mono text-[10.5px] text-[var(--dim)]">
                <span>Production Outcome</span>
                <span className="font-bold text-emerald-500">100% Verified Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
