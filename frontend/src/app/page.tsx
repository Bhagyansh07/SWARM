import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { DemoLauncher } from '@/components/landing/demo-launcher';
import { ArrowNote, GraphFrame, OrbitFrame, ReasoningStreamFrame } from '@/components/landing/showcase';
import { StatusDot } from '@/components/ui';
import dynamic from 'next/dynamic';

const SwarmWorld = dynamic(() => import('@/components/landing/swarm-world').then((mod) => mod.SwarmWorld), { ssr: false });

const SPECS = [
  ['agents', '04'],
  ['stream', 'live'],
  ['graph', 'on'],
  ['runtime', 'groq free tier'],
];

const FLIGHT_PLAN = [
  ['01', 'Brief', 'Give the swarm a question. Pick a template — research, product audit, startup validation, code review.'],
  ['02', 'Converse', 'Four agents take turns: evidence is gathered, attacked by the critic, weighted by the analyst.'],
  ['03', 'Report', 'The synthesizer converges a verdict, key findings and risks — with the dissent that never resolved.'],
];

export default function Page() {
  return (
    <div className="landing-shell bg-grid flex min-h-screen flex-col">
      <Topbar />

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-5">
        <section className="hero-grid grid gap-8 border-b border-[var(--line)] pb-12 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pb-16 lg:pt-16">
          <div className="fade-up">
            <p className="font-mono m-0 flex items-center gap-2.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--faint)]">
              <StatusDot color="var(--ok)" live />
              autonomous research operations / 2026
            </p>
            <h1 className="font-display mt-6 max-w-[11ch] text-[48px] font-black leading-[0.91] tracking-[-0.045em] text-[var(--ink)] sm:text-[68px]">
              Questions in.
              <br />
              <span className="text-[var(--signal)]">Signal out.</span>
            </h1>
            <p className="mt-7 max-w-[42ch] text-[15px] leading-[1.7] text-[var(--dim)]">
              SWARM turns a messy brief into a defensible decision. Four specialist agents investigate, challenge, weigh, and converge in one live mission.
            </p>

            <div className="mt-9 grid max-w-[520px] grid-cols-2 border-t border-[var(--line)] pt-3 sm:grid-cols-4">
              {SPECS.map(([k, v]) => (
                <div key={k} className="readout border-b border-[var(--line)] py-2 pr-4 sm:border-b-0">
                  <span className="readout-label">{k}</span>
                  <span className="readout-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="launcher" className="fade-up scroll-mt-20 lg:pt-4" style={{ animationDelay: '80ms' }}>
            <div className="panel launcher-panel">
              <header className="panel-head flex items-center justify-between gap-3 px-4 py-2">
                <h3 className="font-display m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
                  <span className="rack-index mr-2 align-middle">DECK-0</span>
                  Launch unit
                </h3>
                <span className="rack-index">pick a pattern · patch the subject</span>
              </header>
              <div className="p-4">
                <DemoLauncher />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8" aria-label="SWARM constellation preview">
          <SwarmWorld />
        </section>

        <section className="mt-16 border-t border-[var(--line)] pt-8 lg:mt-20">
          <div className="section-heading mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="rack-index m-0">01 / live mission telemetry</p>
              <h2 className="font-display m-0 mt-2 text-[24px] font-black uppercase tracking-[0.05em] text-[var(--ink)]">Watch the reasoning unfold</h2>
            </div>
            <p className="font-mono m-0 max-w-[270px] text-[10px] uppercase leading-relaxed tracking-[0.12em] text-[var(--faint)]">Evidence, dissent, and confidence stay visible until the verdict.</p>
          </div>
          <div className="max-w-[720px]">
            <ReasoningStreamFrame />
          </div>
        </section>

        <section className="mt-14 grid items-start gap-5 border-t border-[var(--line)] pt-8 lg:grid-cols-2">
          <div className="order-2 lg:order-2">
            <OrbitFrame />
          </div>
          <div className="order-1 lg:order-1">
            <GraphFrame />
          </div>
        </section>

        {/* flight plan rail */}
        <section className="mt-16 border-t border-[var(--line)] py-8 lg:mt-20">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display m-0 text-[17px] font-black uppercase tracking-[0.18em] text-[var(--ink)]">
              Flight plan
            </h2>
            <span className="rack-index">3 waypoints · no human in the loop</span>
          </div>
          <div className="mt-6 grid gap-0 border-t border-[var(--line)] lg:grid-cols-3 lg:gap-px lg:bg-[var(--line)]">
            {FLIGHT_PLAN.map(([n, t, d]) => (
              <div key={n} className="flex gap-4 border-b border-[var(--line)] bg-[var(--paper)] px-5 py-5 last:border-0 lg:border-b-0">
                <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--line-strong)] text-[10px] text-[var(--signal)]">
                  {n}
                </span>
                <div>
                  <h3 className="font-display m-0 text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]">{t}</h3>
                  <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-[var(--dim)]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* sticky cta */}
        <section className="mt-16 lg:sticky lg:bottom-4 lg:z-40">
          <div className="flex flex-col items-center justify-between gap-3 border border-[var(--signal)] bg-[color-mix(in_oklch,var(--field)_88%,transparent)] px-6 py-4 backdrop-blur-sm sm:flex-row">
            <div>
              <p className="font-display m-0 text-[14px] font-black uppercase tracking-[0.18em] text-[var(--ink)]">Ready when you are.</p>
              <p className="font-mono m-0 mt-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--faint)]">
                groq free tier · live stream in your browser
              </p>
            </div>
            <a href="#launcher" className="key px-5 py-2.5 text-[12px] no-underline">
              Launch a mission
            </a>
          </div>
        </section>
      </main>

      <div className="h-12" />

      <Footer />
    </div>
  );
}