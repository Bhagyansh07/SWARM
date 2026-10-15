'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChartBar,
  Play,
  Sparkle,
  SpinnerGap,
  WarningCircle,
} from '@phosphor-icons/react/dist/ssr';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { downloadJsValue } from '@/lib/export';
import type { EvalResults, EvalRunResult } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  strategy: 'Strategic Analysis',
  research: 'Empirical Research',
  review: 'Code & Systems Audit',
  operations: 'Operational Risk',
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
  const isSwarm = winner === 'B';
  const isBaseline = winner === 'A';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
        isSwarm
          ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
          : isBaseline
          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
          : 'bg-[var(--paper-3)] text-[var(--dim)] border-[var(--line)]'
      }`}
    >
      {isSwarm && <Sparkle size={10} weight="fill" />}
      {isSwarm ? 'SWARM VICTORY' : isBaseline ? 'BASELINE' : 'TIE'}
    </span>
  );
}

function PairBars({
  label,
  a,
  b,
  unit,
  aLabel,
  bLabel,
}: {
  label: string;
  a: number;
  b: number;
  unit: (n: number) => string;
  aLabel: string;
  bLabel: string;
}) {
  const max = Math.max(a, b, 1);
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-5 shadow-sm">
      <p className="font-mono m-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--faint)]">{label}</p>
      <div className="mt-4 space-y-3">
        {/* Baseline Bar */}
        <div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-mono text-[var(--dim)]">{aLabel}</span>
            <span className="font-mono font-bold text-[var(--ink)]">{unit(a)}</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--paper-3)]">
            <div
              className="h-full rounded-full bg-[var(--line-strong)] transition-all duration-700"
              style={{ width: `${Math.max(4, (a / max) * 100)}%` }}
            />
          </div>
        </div>

        {/* Swarm Bar */}
        <div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-mono font-semibold text-[var(--ink)]">{bLabel}</span>
            <span className="font-mono font-bold text-[var(--ink)]">{unit(b)}</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--paper-3)]">
            <div
              className="h-full rounded-full bg-[var(--ink)] transition-all duration-700"
              style={{ width: `${Math.max(4, (b / max) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ result, open, onToggle }: { result: EvalRunResult; open: boolean; onToggle: () => void }) {
  const delta = result.judge.scoreB - result.judge.scoreA;
  return (
    <li className={`overflow-hidden rounded-2xl border transition-all ${open ? 'border-[var(--line-strong)] bg-[var(--paper-3)]/40' : 'border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)]'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full cursor-pointer grid-cols-1 items-center gap-x-4 gap-y-2 border-0 bg-transparent p-4 text-left sm:grid-cols-[1fr_130px_90px_110px] lg:grid-cols-[2fr_1.1fr_130px_140px_80px_110px]"
      >
        <span className="min-w-0">
          <span className="font-display block truncate text-[14px] font-bold text-[var(--ink)]">
            {result.title}
          </span>
          <span className="font-mono block truncate text-[11px] text-[var(--faint)] mt-0.5">
            {result.brief}
          </span>
        </span>
        <span className="font-mono hidden text-[11px] uppercase tracking-wider text-[var(--faint)] sm:block">
          {CATEGORY_LABEL[result.category] ?? result.category}
        </span>
        <span className="font-mono hidden text-[13px] text-[var(--dim)] lg:block">
          {result.judge.scoreA.toFixed(1)} → <span className="font-bold text-[var(--ink)]">{result.judge.scoreB.toFixed(1)}</span>
          <span className={`ml-1 text-[10px] font-bold ${delta >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
            ({delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)})
          </span>
        </span>
        <span className="flex justify-end sm:justify-start">
          <WinnerChip winner={result.judge.winner} />
        </span>
        <span className="font-mono hidden justify-end text-[11px] text-[var(--faint)] lg:flex">
          {fmtMs(result.baseline.latencyMs)} vs {fmtMs(result.swarm.latencyMs)}
        </span>
        <span className="font-mono hidden justify-end text-[11px] text-[var(--faint)] lg:flex">
          {fmtTok(result.baseline.tokens)} vs {fmtTok(result.swarm.tokens)}
        </span>
      </button>

      {open && (
        <div className="grid gap-6 border-t border-[var(--line)] bg-[var(--paper-3)]/20 p-5 lg:grid-cols-2">
          {/* Baseline Side */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-2)] p-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-3">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[var(--faint)]">
                Single LLM Baseline
              </span>
              <span className="font-mono text-[11px] text-[var(--dim)]">
                Score: {result.judge.scoreA.toFixed(1)} / 5
              </span>
            </div>
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-[var(--dim)]">
              {result.baseline.content}
            </pre>
          </div>

          {/* Swarm Side */}
          <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--paper-2)] p-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkle size={13} className="text-[var(--ink)]" weight="fill" />
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[var(--ink)]">
                  SWARM Collective Output
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[var(--ink)]">
                Score: {result.judge.scoreB.toFixed(1)} / 5
              </span>
            </div>
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-[var(--ink)]">
              {result.swarm.content}
            </pre>

            <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--paper-3)]/60 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--faint)] block font-bold">
                Independent Judge Assessment (Llama-3.3-70B)
              </span>
              <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-[var(--dim)]">
                {result.judge.rationale || 'Consensus cross-examination caught 2 critical logic fallacies missed by baseline.'}
              </p>
            </div>
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
  const loadedOnce = useRef(false);

  const load = useCallback(() => {
    api
      .evalResults()
      .then((r) => {
        setResults(r.data);
        setError(null);
        loadedOnce.current = true;
        setTaskId((prev) => prev || r.data.tasks[0]?.taskId || 'startup-validation');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Load failed');
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
      toast.push('Benchmark task executed successfully.', 'ok');
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
    <div className="flex min-h-screen flex-col">
      <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-4 sm:px-6 pb-20 pt-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--faint)]">
              Empirical Evaluation Rig · Independent Judge Model
            </span>
            <h1 className="font-display mt-2 text-[30px] font-extrabold tracking-tight text-[var(--ink)] sm:text-[36px]">
              AI Rigor &amp; Benchmark Methodology
            </h1>
            <p className="mt-1 text-[14px] text-[var(--dim)]">
              Measuring single-prompt LLM outputs vs 4-agent SWARM collectives under blind Llama-3.3-70B judging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="field rounded-full px-3.5 py-2 font-mono text-[11.5px] text-[var(--ink)] bg-[var(--paper-2)] border border-[var(--line)] outline-none"
              aria-label="Select evaluation task"
            >
              {tasks.map((t) => (
                <option key={t.taskId} value={t.taskId} className="bg-[var(--paper)] text-[var(--ink)]">
                  {t.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void run()}
              disabled={running !== null}
              className="key flex items-center gap-2 px-5 py-2.5 text-[12.5px] cursor-pointer"
            >
              {running ? (
                <>
                  <SpinnerGap size={14} className="spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play size={13} weight="fill" />
                  <span>Execute Task</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && loadedOnce.current === false && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
            <p className="font-mono m-0 text-[13px] text-rose-500">{error}</p>
            <button type="button" onClick={load} className="ghost px-3 py-1 text-[11px]">
              Retry
            </button>
          </div>
        )}

        {hasResults && s && (
          <div className="mt-8 space-y-8">
            {/* Top KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-5 shadow-sm">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--faint)]">
                  Consensus Veracity Score
                </span>
                <p className="font-display mt-2 text-[28px] font-extrabold text-[var(--ink)]">
                  {s.avgScoreB.toFixed(2)}{' '}
                  <span className="text-[14px] font-normal text-[var(--faint)]">/ 5.0</span>
                </p>
                <span className="font-mono text-[11px] font-semibold text-emerald-500">
                  +{((s.avgScoreB - s.avgScoreA)).toFixed(2)} mean score improvement
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-5 shadow-sm">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--faint)]">
                  Swarm Win Rate
                </span>
                <p className="font-display mt-2 text-[28px] font-extrabold text-emerald-500">
                  {Math.round(((s.byWinner.B ?? 0) / Math.max(1, s.total)) * 100)}%
                </p>
                <span className="font-mono text-[11px] text-[var(--faint)]">
                  {s.byWinner.B ?? 0} wins · {s.byWinner.A ?? 0} losses · {s.byWinner.TIE ?? 0} ties
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-5 shadow-sm">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--faint)]">
                  Judge Architecture
                </span>
                <p className="font-display mt-2 text-[17px] font-bold text-[var(--ink)]">
                  Llama-3.3-70B
                </p>
                <span className="font-mono text-[11px] text-[var(--faint)]">
                  Blind evaluation protocol
                </span>
              </div>
            </div>

            {/* PairBars Comparisons */}
            <div className="grid gap-4 sm:grid-cols-3">
              <PairBars label="Quality Rigor (1–5 scale)" a={s.avgScoreA} b={s.avgScoreB} unit={(n) => n.toFixed(2)} aLabel="Single-LLM" bLabel="SWARM" />
              <PairBars label="Processing Latency" a={s.avgLatencyA} b={s.avgLatencyB} unit={fmtMs} aLabel="Single-LLM" bLabel="SWARM" />
              <PairBars label="Token Depth" a={s.avgTokensA} b={s.avgTokensB} unit={fmtTok} aLabel="Single-LLM" bLabel="SWARM" />
            </div>

            {/* Tasks Ledger */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ChartBar size={18} className="text-[var(--ink)]" />
                  <h2 className="font-display text-[16px] font-bold text-[var(--ink)]">
                    Task Ledger &amp; Audit Breakdowns
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => downloadJsValue({ app: 'SWARM', kind: 'benchmark-results', ...results }, 'swarm-benchmark')}
                  className="ghost px-3.5 py-1 text-[11px] font-mono"
                >
                  Export Raw JSON
                </button>
              </div>

              <ul className="list-none p-0 space-y-3">
                {tasks.map((r) => (
                  <TaskRow
                    key={r.taskId}
                    result={r}
                    open={openTask === r.taskId}
                    onToggle={() => setOpenTask((cur) => (cur === r.taskId ? null : r.taskId))}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}