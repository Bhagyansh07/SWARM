import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { DemoLauncher } from '@/components/landing/demo-launcher';
import { HeroDeck } from '@/components/landing/hero-deck';
import { GraphFrame, OrbitFrame, ReasoningStreamFrame } from '@/components/landing/showcase';
import { StatusDot, Kbd } from '@/components/ui';

const SPECS = [
  ['agents', '04'],
  ['stream', 'live'],
  ['graph', 'on'],
  ['runtime', 'groq free tier'],
];

const FLIGHT_PLAN = [
  ['01', 'Brief', 'Give the swarm a question and pick a pattern — research, audit, validation, review.'],
  ['02', 'Converse', 'Four specialists take turns: evidence gathered, logic attacked, confidence weighted.'],
  ['03', 'Report', 'The synthesizer converges a verdict, findings and risks — dissent included.'],
];

export default function Page() {
  return (
    <div className="bg-grid flex min-h-screen flex-col">
      <Topbar />

      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 px-5">
        <section className="hero-grid grid gap-8 border-b border-[var(--line)] pb-10 pt-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-12 lg:pb-12 lg:pt-14">
          <div className="fade-up">
            <p className="font-mono m-0 flex items-center gap-2.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--faint)]">
              <StatusDot color="var(--ok)" live />
              autonomous research operations / 2026
            </p>
            <h1 className="font-display mt-6 max-w-[12ch] text-[46px] font-black leading-[0.92] tracking-[-0.04em] text-[var(--ink)] sm:text-[64px]">
              Many agents.
              <br />
              <span className="text-[var(--signal)]">One verdict.</span>
            </h1>
            <p className="mt-7 max-w-[44ch] text-[15px] leading-[1.7] text-[var(--dim)]">
              SWARM turns a messy brief into a defensible decision. Four specialist agents investigate, challenge, weigh and converge — live, in your browser, on the Groq free tier.
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

          <div className="fade-up order-first lg:order-last" style={{ animationDelay: '80ms' }}>
            <HeroDeck />
          </div>
        </section>

        <section id="launcher" className="scroll-mt-20 border-b border-[var(--line)] py-8" aria-label="Mission launcher">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="rack-index m-0">01 / launch a mission</p>
              <h2 className="font-display m-0 mt-2 text-[24px] font-black uppercase tracking-[0.04em] text-[var(--ink)]">Brief the swarm</h2>
            </div>
            <p className="font-mono m-0 max-w-[260px] text-[10px] uppercase leading-relaxed tracking-[0.12em] text-[var(--faint)]">
              Pick a preset or write your own brief — one live run is <span className="text-[var(--signal)]">free</span>.
            </p>
          </div>
          <div className="panel launcher-panel">
            <header className="panel-head flex items-center justify-between gap-3 px-4 py-2">
              <h3 className="font-display m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
                <span className="rack-index mr-2 align-middle">DECK-0</span>
                Launch unit
              </h3>
              <span className="rack-index">presets · subject · brief</span>
            </header>
            <div className="p-4">
              <DemoLauncher />
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-[var(--line)] pt-8 lg:mt-20">
          <div className="section-heading mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="rack-index m-0">02 / live mission telemetry</p>
              <h2 className="font-display m-0 mt-2 text-[24px] font-black uppercase tracking-[0.05em] text-[var(--ink)]">Watch the reasoning unfold</h2>
            </div>
            <p className="font-mono m-0 max-w-[270px] text-[10px] uppercase leading-relaxed tracking-[0.12em] text-[var(--faint)]">
              Evidence, dissent and confidence stay visible until the verdict.
            </p>
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
        <section className="mt-16 lg:sticky lg:bottom-4 lg:z-[var(--z-sticky)]">
          <div className="flex flex-col items-center justify-between gap-3 border border-[var(--signal)] bg-[var(--field)] px-6 py-4 shadow-[var(--shadow)] sm:flex-row">
            <div>
              <p className="font-display m-0 text-[14px] font-black uppercase tracking-[0.18em] text-[var(--ink)]">Ready when you are.</p>
              <p className="font-mono m-0 mt-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--faint)]">
                groq free tier · live stream in your browser
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)] sm:flex">
                <MagnifyingGlass size={12} aria-hidden /> jump to
                <Kbd>Ctrl K</Kbd>
              </span>
              <a href="#launcher" className="key px-5 py-2.5 text-[12px] no-underline">
                Launch a mission
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="h-12" />

      <Footer />
    </div>
  );
}