'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  FileText,
  Lightning,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';
import { SwarmWorkbench } from '@/components/landing/swarm-workbench';
import { HeroBacklight } from '@/components/landing/hero-backlight';
import { ConsensusComparison } from '@/components/landing/consensus-comparison';
import { EnterpriseObservability } from '@/components/landing/observability-deck';

const METRICS = [
  { label: 'Specialist Agents', value: '4 Lanes' },
  { label: 'Turn Latency', value: '< 600ms' },
  { label: 'Consensus Passes', value: '4 Rounds' },
  { label: 'Trace Integrity', value: '100% Auditable' },
];

const PRINCIPLES = [
  {
    num: '01',
    title: 'Parallel Evidence Retrieval',
    tag: 'Empirical Foundation',
    desc: 'Kai scours domain literature, technical specifications, and historical precedent before any hypotheses form. Zero assertions accepted without verifiable citations.',
    graphic: (
      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--paper-3)]/40 p-3 font-mono text-[10.5px]">
        <span className="text-[var(--dim)]">Citations Analyzed</span>
        <span className="font-bold text-[var(--ink)]">14 Verified arXiv/RFCs</span>
      </div>
    ),
  },
  {
    num: '02',
    title: 'Adversarial Cross-Examination',
    tag: 'Red-Team Probe',
    desc: 'Vex attacks hidden single points of failure, cognitive biases, and race conditions that single-prompt LLMs overlook. Every hypothesis is ruthlessly stress-tested.',
    graphic: (
      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--paper-3)]/40 p-3 font-mono text-[10.5px]">
        <span className="text-[var(--dim)]">Flaws Intercepted</span>
        <span className="font-bold text-amber-500">2 Critical Blindspots</span>
      </div>
    ),
  },
  {
    num: '03',
    title: 'Defensible Consensus & Dissent',
    tag: 'Bayesian Synthesis',
    desc: 'Lyra and Nova recalibrate Bayesian weights and reconcile disagreements into an executive action memo, formally logging minority dissents for governance.',
    graphic: (
      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--paper-3)]/40 p-3 font-mono text-[10.5px]">
        <span className="text-[var(--dim)]">Consensus Veracity</span>
        <span className="font-bold text-[var(--ink)]">98.2% Calibrated</span>
      </div>
    ),
  },
];

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 px-4 sm:px-6">
        {/* ===================================================================
            HERO SECTION — MNC-GRADE LUXURY EDITORIAL SAAS WITH VOLUMETRIC AURA
            =================================================================== */}
        <section className="relative pt-16 pb-14 sm:pt-28 sm:pb-20 text-center overflow-hidden">
          {/* Ambient Volumetric Backlight & Deliberation Orbits */}
          <HeroBacklight />

          <div className="relative z-10">
            {/* MNC Eyebrow Badge */}
            <div className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--faint)] mb-7 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Enterprise Multi-Agent Synthesis Platform</span>
            </div>

            {/* Master Headline: Catchy, Cool, MNC Tier */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-tight text-[var(--ink)] leading-[1.04] max-w-4xl mx-auto">
              Architectural Certainty at Scale.
              <span className="block mt-2.5 font-bold text-[var(--dim)] text-2xl sm:text-4xl lg:text-[42px] tracking-tight">
                Four AI agents that stress-test your system before you ship.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-[var(--dim)] max-w-2xl mx-auto leading-relaxed">
              Instead of trusting a single agreeable AI, SWARM deploys four specialized autonomous agents to research citations, challenge assumptions, and reach mathematical consensus — catching fatal edge cases before production.
            </p>

            {/* Tactile CTAs with "Button-in-Button" Trailing Icon */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#launcher"
                className="group inline-flex items-center gap-3 rounded-full bg-[var(--ink)] pl-6 pr-2.5 py-2.5 text-[14px] font-semibold text-[var(--paper)] transition-all hover:opacity-95 active:scale-[0.98] shadow-sm no-underline"
              >
                <span>Deploy a swarm</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--paper)]/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowRight size={13} weight="bold" />
                </span>
              </a>

              <Link
                href="/eval"
                className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-[var(--ink)] transition-all hover:text-[var(--ink)] no-underline"
              >
                <span>View benchmarks</span>
              </Link>
            </div>

            {/* Luxury Frosted Glass Metric Strip */}
            <div className="mt-16 glass-card rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)]">
              {METRICS.map((m) => (
                <div key={m.label} className="text-center sm:px-4 first:pt-0 pt-4 sm:pt-0">
                  <span className="font-display text-[20px] font-bold text-[var(--ink)] block">
                    {m.value}
                  </span>
                  <span className="text-[10.5px] text-[var(--faint)] block mt-0.5 font-mono uppercase tracking-wider">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            WORKBENCH PRODUCT SECTION (DOUBLE-BEZEL HARDWARE CHASSIS)
            =================================================================== */}
        <section id="launcher" className="relative scroll-mt-24 mb-24" aria-label="Swarm Workbench">
          {/* Ambient Hardware Backlight Halo */}
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-[var(--backlight-core)] via-transparent to-transparent opacity-60 blur-3xl pointer-events-none" />

          <div className="relative mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE MULTI-AGENT TOPOLOGY
            </div>
            <h2 className="font-display text-[24px] sm:text-[30px] font-extrabold text-[var(--ink)] tracking-tight">
              Multi-Agent Consensus Graph
            </h2>
            <p className="text-[13.5px] sm:text-[14.5px] text-[var(--dim)] mt-1 max-w-2xl leading-relaxed">
              Watch four autonomous specialist nodes deliberate, cross-examine, and forge mathematical consensus through an active DAG execution pipeline.
            </p>
          </div>

          <SwarmWorkbench />
        </section>

        {/* ===================================================================
            HOW IT WORKS — 3 EDITORIAL LUXURY PILLARS
            =================================================================== */}
        <section className="border-t border-[var(--line)] py-24" aria-label="How it works">
          <div className="mb-14">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--faint)]">
              Methodology
            </span>
            <h2 className="font-display mt-1 text-[28px] sm:text-[36px] font-bold text-[var(--ink)]">
              Built to eliminate <span className="text-shimmer">cognitive blind spots</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div
                key={p.num}
                className="group relative rounded-2xl glass-card p-6 sm:p-7 transition-all duration-300 hover:border-white/25 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[12px] font-bold text-[var(--faint)]">
                      {p.num}
                    </span>
                    <span className="glass-pill rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium text-[var(--faint)] uppercase tracking-wider">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-[17px] font-bold text-[var(--ink)] mb-2.5">
                    {p.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-[var(--dim)]">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl glass-pill px-3.5 py-2.5 font-mono text-[11px]">
                  <span className="text-[var(--dim)]">Verification Metric</span>
                  <span className="font-bold text-[var(--ink)]">{p.num === '01' ? '14 Verified arXiv/RFCs' : p.num === '02' ? '2 Critical Blindspots' : '98.2% Calibrated'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            SCENARIO STRESS-TEST ARENA (STREAMLINED & USABLE)
            =================================================================== */}
        <section className="mb-24" aria-label="Comparison">
          <ConsensusComparison />
        </section>

        {/* ===================================================================
            ENTERPRISE OBSERVABILITY & CRYPTOGRAPHIC AUDIT COMMAND DECK
            =================================================================== */}
        <section className="border-t border-[var(--line)] py-24" aria-label="Observability">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--faint)]">
              Enterprise Observability
            </span>
            <h2 className="font-display mt-1 text-[28px] sm:text-[38px] font-extrabold tracking-tight text-[var(--ink)]">
              Verifiable Audit Deck &amp; Telemetry
            </h2>
            <p className="mt-2 text-[14px] text-[var(--dim)] leading-relaxed">
              Every citation, adversarial attack, and consensus probability is cryptographically signed and auditable in real time.
            </p>
          </div>

          <EnterpriseObservability />
        </section>

        {/* ===================================================================
            CALL TO ACTION (DOUBLE-BEZEL LUXURY SHELL WITH BACKLIGHT)
            =================================================================== */}
        <section className="relative my-24">
          {/* Volumetric Underglow */}
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-[var(--backlight-core)] to-transparent opacity-70 blur-3xl pointer-events-none" />

          <div className="relative glass-bezel-outer">
            <div className="glass-bezel-inner p-8 sm:p-16 text-center relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-radial from-white/[0.04] to-transparent opacity-60" />
              <span className="relative z-10 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--faint)] mb-3">
                Instant Execution · Enterprise Ready
              </span>
              <h2 className="relative z-10 font-display text-[30px] sm:text-[40px] font-bold tracking-tight text-[var(--ink)] max-w-xl mx-auto">
                Ready to test high-stakes briefs against a <span className="text-shimmer">swarm</span>?
              </h2>
              <p className="relative z-10 mt-3 text-[14.5px] text-[var(--dim)] max-w-md mx-auto leading-relaxed">
                Deploy four autonomous specialists in parallel with 100% auditable traces.
              </p>

              <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#launcher"
                  className="group inline-flex items-center gap-3 rounded-full bg-[var(--ink)] pl-6 pr-2.5 py-2.5 text-[14px] font-semibold text-[var(--paper)] transition-all hover:opacity-95 active:scale-[0.98] shadow-sm no-underline"
                >
                  <span>Deploy a swarm</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--paper)]/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowRight size={13} weight="bold" />
                  </span>
                </a>

                <Link
                  href="/history"
                  className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-[var(--ink)] transition-all no-underline"
                >
                  <span>View past runs</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}