'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BracketsCurly,
  ChartBar,
  FileCode,
  Flask,
  Info,
  Play,
  SpinnerGap,
  WarningCircle,
} from '@phosphor-icons/react/dist/ssr';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { EmptyState, StatusDot, Kbd, Button } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { downloadJsValue } from '@/lib/export';
import type { EvalResults, EvalRunResult } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  strategy: 'strategy',
  research: 'research',
  review: 'review',
  operations: 'operations',
};

function fmtMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtTok(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function WinnerChip({ winner }: { winner: string }) {
  const color = winner === 'B' ? 'var(--ok)' : winner === 'A' ? 'var(--warn)' : 'var(--faint)';
  const label = winner === 'B' ? 'SWARM' : winner === 'A' ? 'baseline' : 'tie';
  return (
    <span className="font-mono inline-flex items-center border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
}

function PairBars({ label, a, b, unit, aLabel, bLabel }: { label: string; a: number; b: number; unit: (n: number) => string; aLabel: string; bLabel: string }) {
  const max = Math.max(a, b, 1);
  return (
    <div className="border border-[var(--line)] bg-[var(--paper-2)] p-3">
      <p className="rack-index m-0">{label}</p>
      <div className="mt-3 flex items-end gap-5">
        <div className="flex-1">
          <div
            className="h-5 border border-[var(--line-strong)] bg-[color-mix(in_oklch,var(--signal)_18%,transparent)] transition-all duration-500"
            style={{ width: `${Math.max(4, (a / max) * 100)}%` }}
          />
          <p className="font-mono m-0 mt-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--dim)]">
            {aLabel} <span className="text-[var(--ink)]">{unit(a)}</span>
          </p>
        </div>
        <div className="flex-1">
          <div
            className="h-5 border border-[var(--line-strong)] bg-[color-mix(in_oklch,var(--ok)_20%,transparent)] transition-all duration-500"
            style={{ width: `${Math.max(4, (b / max) * 100)}%` }}
          />
          <p className="font-mono m-0 mt-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--dim)]">
            {bLabel} <span className="text-[var(--ink)]">{unit(b)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ result, open, onToggle }: { result: EvalRunResult; open: boolean; onToggle: () => void }) {
  const delta = result.judge.scoreB - result.judge.scoreA;
  return (
    <li className={`border border-[var(--line)] ${open ? 'border-[var(--line-strong)]' : ''}`}>
      <button type="button" onClick={onToggle} className="grid w-full cursor-pointer grid-cols-1 items-center gap-x-4 gap-y-2 border-0 bg-transparent px-4 py-3 text-left sm:grid-cols-[1fr_110px_70px_90px] lg:grid-cols-[2fr_0.9fr_120px_130px_70px_110px]">
        <span className="min-w-0">
          <span className="font-display block truncate text-[13px] font-bold tracking-[0.01em] text-[var(--ink)]">{result.title}</span>
          <span className="font-mono block truncate text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">{result.brief.slice(0, 90)}…</span>
        </span>
        <span className="font-mono hidden text-[10.5px] uppercase tracking-[0.12em] text-[var(--faint)] sm:block">{CATEGORY_LABEL[result.category] ?? result.category}</span>
        <span className="font-mono hidden text-[12px] text-[var(--ink)] lg:block">
          {result.judge.scoreA.toFixed(1)} <span className="text-[var(--faint)]">→</span> <span style={{ color: delta >= 0 ? 'var(--ok)' : 'var(--warn)' }}>{result.judge.scoreB.toFixed(1)}</span>
          <span className={`ml-1.5 text-[9px] ${delta >= 0 ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>{delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}</span>
        </span>
        <span className="flex justify-end sm:justify-start">
          <WinnerChip winner={result.judge.winner} />
        </span>
        <span className="font-mono hidden justify-end text-[10.5px] text-[var(--dim)] lg:flex">
          {fmtMs(result.baseline.latencyMs)} <span className="text-[var(--faint)]">vs</span> {fmtMs(result.swarm.latencyMs)}
        </span>
        <span className="font-mono hidden justify-end text-[10.5px] text-[var(--dim)] lg:flex">
          {fmtTok(result.baseline.tokens)} <span className="text-[var(--faint)]">vs</span> {fmtTok(result.swarm.tokens)}
        </span>
      </button>
      {open && (
        <div className="grid gap-4 border-t border-[var(--line)] px-4 py-4 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="rack-index m-0 mb-2">baseline · single LLM</p>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--dim)]">{result.baseline.content}</pre>
          </div>
          <div className="min-w-0">
            <p className="rack-index m-0 mb-2">swarm · {result.swarm.verdict.slice(0, 60)}…</p>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--dim)]">{result.swarm.content}</pre>
            <p className="rack-index m-0 mt-3 mb-1">judge rationale</p>
            <p className="m-0 text-[12px] leading-relaxed text-[var(--dim)]">{result.judge.rationale || '—'}</p>
          </div>
        </div>
      )}
    </li>
  );
}

export default function EvalPage() {
  const toast = useToast();
  const [results, setResults] = useState<EvalResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [taskId, setTaskId] = useState('startup-validation');
  const [config, setConfig] = useState(false);
  const loadedOnce = useRef(false);

  const load = useCallback(() => {
    api
      .evalResults()
      .then((r) => {
        setResults(r.data);
        setError(null);
        loadedOnce.current = true;
        // Seed the re-run selector from the first available task.
        setTaskId((prev) => prev || r.data.tasks[0]?.taskId || 'startup-validation');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'load failed');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async () => {
    if (running) return;
    setRunning(taskId);
    try {
      await api.runEvalTask(taskId);
      toast.push('Benchmark task finished — results refreshed.', 'ok');
      load();
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Benchmark run failed.', 'bad');
    } finally {
      setRunning(null);
    }
  };

  const tasks = results?.tasks ?? [];
  const hasResults = tasks.length > 0;
  const s = results?.summary;

  return (
    <div className="bg-grid flex min-h-screen flex-col">
      <Topbar />
      <main id="main" className="mx-auto w-full max-w-[1060px] flex-1 px-5 pb-16">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-4 pt-10 sm:flex-row sm:items-end">
          <div>
            <p className="rack-index m-0">benchmark rig · single LLM vs multi-agent</p>
            <h1 className="font-display m-0 mt-2 text-[26px] font-black uppercase tracking-[0.06em] text-[var(--ink)]">Methodology lab</h1>
          </div>
          <p className="font-mono m-0 max-w-[280px] text-[10px] uppercase leading-relaxed tracking-[0.12em] text-[var(--faint)]">
            fixed tasks · same brief · judge is a different model · results are honest, losses included
          </p>
        </div>

        {error && loadedOnce.current === false && (
          <div className="flex items-center justify-between gap-4 border border-[var(--bad)] px-3 py-2">
            <p className="font-mono m-0 text-[12px] text-[var(--bad)]">{error}</p>
            <button type="button" onClick={load} className="ghost px-2.5 py-1 text-[10px]">
              retry
            </button>
          </div>
        )}

        {!hasResults && loadedOnce.current && (
          <div className="mt-6 border border-[var(--line)] bg-[var(--paper-2)]">
            <EmptyState
              icon={<Flask size={22} aria-hidden />}
              title="No benchmark results yet"
              body="Results are produced by running the fixed task catalogue against the live model — rate-limited to protect the free key. Pick a task and run it, or regenerate the full set locally with `npm run eval`."
              action={
                <button onClick={() => void run()} disabled={running !== null} className="key px-4 py-2 text-[11.5px]">
                  {running ? 'Running benchmark…' : 'Run first benchmark task'}
                </button>
              }
            />
          </div>
        )}

        {hasResults && s && (
          <div className="mt-6 space-y-6">
            {/* headline stats */}
            <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
              {[
                ['quality / 5', `${s.avgScoreA.toFixed(2)} → ${s.avgScoreB.toFixed(2)}`, `${s.avgScoreB - s.avgScoreA >= 0 ? '+' : ''}${(s.avgScoreB - s.avgScoreA).toFixed(2)} mean delta`, 'var(--signal)'],
                ['tasks run', `${s.total}`, `${(s.byWinner.B ?? 0)} won / ${s.byWinner.A ?? 0} lost / ${s.byWinner.TIE ?? 0} tied`, 'var(--ok)'],
                ['last run', `${new Date(results.updatedAt).toLocaleDateString()} ${new Date(results.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, `${results.tasks[0]?.model ?? '—'} · judge ${results.tasks[0]?.judgeModel ?? '—'}`, 'var(--faint)'],
              ].map(([label, value, note, color]) => (
                <div key={label as string} className="metric-cell bg-[var(--paper-2)] px-4 py-4">
                  <span className="rack-index block">{label as string}</span>
                  <span className="font-mono mt-1 block text-[19px]" style={{ color: color as string }}>
                    {value as string}
                  </span>
                  <span className="font-mono mt-1 block text-[9.5px] uppercase tracking-[0.1em] text-[var(--faint)]">{note as string}</span>
                </div>
              ))}
            </div>

            {/* charts */}
            <div className="grid gap-4 lg:grid-cols-3">
              <PairBars label="avg quality (1–5)" a={s.avgScoreA} b={s.avgScoreB} unit={(n) => n.toFixed(2)} aLabel="baseline" bLabel="swarm" />
              <PairBars label="avg latency" a={s.avgLatencyA} b={s.avgLatencyB} unit={fmtMs} aLabel="baseline" bLabel="swarm" />
              <PairBars label="avg tokens" a={s.avgTokensA} b={s.avgTokensB} unit={fmtTok} aLabel="baseline" bLabel="swarm" />
            </div>

            {/* task table */}
            <section aria-label="Per-task results">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display m-0 text-[14px] font-black uppercase tracking-[0.16em] text-[var(--ink)]">
                  <ChartBar size={13} className="mr-2 inline-block -translate-y-px text-[var(--signal)]" aria-hidden />
                  Task ledger
                </h2>
                <button
                  type="button"
                  onClick={() => downloadJsValue({ app: 'SWARM', kind: 'benchmark-results', ...results }, 'benchmark')}
                  className="ghost items-center gap-1.5 px-3 py-1.5 text-[10px]"
                >
                  <BracketsCurly size={12} aria-hidden /> results.json
                </button>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {tasks.map((t) => (
                  <TaskRow key={t.taskId} result={t} open={openTask === t.taskId} onToggle={() => setOpenTask(openTask === t.taskId ? null : t.taskId)} />
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* re-run panel */}
        {(hasResults || loadedOnce.current) && (
          <section className="mt-8 border-t border-[var(--line)] pt-6" aria-label="Run benchmark">
            <h2 className="font-display m-0 text-[14px] font-black uppercase tracking-[0.16em] text-[var(--ink)]">
              <Flask size={13} className="mr-2 inline-block -translate-y-px text-[var(--signal)]" aria-hidden />
              Re-run the rig
            </h2>
            <p className="m-0 mt-2 max-w-[52ch] text-[12.5px] leading-relaxed text-[var(--dim)]">
              Each run costs several live LLM calls, so re-runs are rate-limited (3 per minute, 24 per day). The full 6-task
              catalogue can be regenerated locally with <span className="font-mono text-[11px] text-[var(--signal)]">GROQ_API_KEY=… npm run eval</span>.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1">
                <label htmlFor="eval-task" className="font-mono block text-[9.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
                  choose a task
                </label>
                <select
                  id="eval-task"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="field mt-1.5 w-full cursor-pointer px-3 py-2 font-mono text-[12px] text-[var(--ink)] outline-none"
                >
                  {[
                    'startup-validation',
                    'edge-ai-research',
                    'express-code-review',
                    'checkout-triage',
                    'go-to-market',
                    'serverless-migration',
                  ].map((id) => (
                    <option key={id} value={id} className="bg-[var(--field)] text-[var(--ink)]">
                      {id.replaceAll('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={() => void run()} disabled={running !== null} className="min-w-[210px]">
                {running ? (
                  <>
                    <SpinnerGap size={14} className="animate-spin" aria-hidden /> running…
                  </>
                ) : (
                  <>
                    <Play size={13} weight="bold" aria-hidden /> Run benchmark
                  </>
                )}
              </Button>
            </div>
          </section>
        )}

        {/* methodology */}
        <section className="mt-8 border-t border-[var(--line)] pt-6" aria-label="Methodology">
          <h2 className="font-display m-0 text-[14px] font-black uppercase tracking-[0.16em] text-[var(--ink)]">
            <Info size={13} className="mr-2 inline-block -translate-y-px text-[var(--signal)]" aria-hidden />
            How the numbers are produced
          </h2>
          <div className="mt-3 grid gap-px border border-[var(--line)] bg-[var(--line)] lg:grid-cols-2">
            {[
              ['Fixed tasks', 'Six briefs across strategy, research, review and operations. Never changed to favour a winner — the same catalogue is versioned in the repo.'],
              ['Same model, one difference', 'The baseline is a single LLM call. SWARM runs the identical model inside its four-agent pipeline. Only orchestration differs.'],
              ['Judge is a different model', `A stronger model (${results?.tasks[0]?.judgeModel ?? 'llama-3.3-70b-versatile'}) scores both answers blind on accuracy, completeness and actionability.`],
              ['Honest reporting', 'Losses and ties are shown. If the swarm is not better on a task, that is visible — and that is the point of measuring.'],
            ].map(([title, body]) => (
              <div key={title} className="bg-[var(--paper-2)] px-4 py-3">
                <h3 className="font-display m-0 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]">{title}</h3>
                <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-[var(--dim)]">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="font-mono flex items-center gap-1.5 border border-[var(--line)] px-2 py-1 text-[9.5px] uppercase tracking-[0.12em] text-[var(--faint)]">
              <WarningCircle size={11} aria-hidden /> single run per task — variance expected
            </span>
            <span className="font-mono flex items-center gap-1.5 border border-[var(--line)] px-2 py-1 text-[9.5px] uppercase tracking-[0.12em] text-[var(--faint)]">
              <SpinnerGap size={11} aria-hidden /> budgets: {results?.tasks[0]?.provider ?? 'groq'} / {results?.tasks[0]?.model ?? 'qwen3.8-27b'}
            </span>
            <Link href="/mission/roster" className="ghost items-center gap-1.5 px-2 py-1 text-[10px] no-underline">
              <FileCode size={11} aria-hidden /> view a live mission
            </Link>
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)] sm:flex">
              <StatusDot color="var(--ok)" live /> rate-limited re-runs
              <Kbd>Ctrl K</Kbd>
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}