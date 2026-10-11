import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { logger } from '../lib/logger';
import { groqAvailable, groqComplete, MODEL as GROQ_MODEL } from '../llm/groq';
import { Orchestrator } from '../orchestrator/orchestrator';
import { DocumentMissionStore, FileBackend, readDoc, writeDoc, type MissionRecord } from '../lib/store';
import { currentModel, providerUsage, resetProviderUsage, resolveProvider } from '../llm/provider';
import {
  BASELINE_SYSTEM,
  EVAL_TASKS,
  JUDGE_MODEL,
  JUDGE_SYSTEM,
  judgePrompt,
  type EvalTask,
} from './tasks';
import { parseJudgeOutput } from './parse';

export interface EvalRunResult {
  taskId: string;
  title: string;
  category: string;
  brief: string;
  baseline: { content: string; latencyMs: number; tokens: number };
  swarm: { content: string; latencyMs: number; tokens: number; verdict: string };
  judge: { scoreA: number; scoreB: number; winner: 'A' | 'B' | 'TIE'; rationale: string };
  model: string;
  judgeModel: string;
  provider: string;
  providersUsed: string[];
  ranAt: string;
}

export interface EvalResultsDoc {
  createdAt: string;
  updatedAt: string;
  tasks: EvalRunResult[];
}

export const EVAL_RESULTS_KEY = 'eval-results.json';

// Each single-task benchmark must fit comfortably inside the serverless budget.
// The whole task is baseline + swarm + judge, so every stage is capped.
export const EVAL_SWARM_BUDGET_MS = Number(process.env.EVAL_SWARM_BUDGET_MS ?? 18000);
const SINGLE_MAX_MS = 12000;
const JUDGE_MAX_MS = 12000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs `work` but gives up after `maxMs`. The timer is always cleared and the
 * in-flight promise keeps a rejection handler, so a late failure can never
 * surface as an unhandled rejection (which would crash the function).
 */
async function withTimeout<T>(work: () => Promise<T>, maxMs: number): Promise<{ value: T; durationMs: number }> {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`step exceeded ${maxMs}ms budget`)), maxMs);
  });

  const task = work();
  task.catch(() => undefined); // swallow late rejections if the timeout wins

  try {
    const value = await Promise.race([task, timeout]);
    return { value, durationMs: Date.now() - start };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function emptyResultsDoc(): Promise<EvalResultsDoc> {
  return { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tasks: [] };
}

export async function loadResults(): Promise<EvalResultsDoc> {
  const doc: EvalResultsDoc | null = await readDoc<EvalResultsDoc>(EVAL_RESULTS_KEY);
  if (doc && Array.isArray(doc.tasks)) return doc;
  return emptyResultsDoc();
}

export async function saveResults(doc: EvalResultsDoc): Promise<void> {
  doc.updatedAt = new Date().toISOString();
  await writeDoc(EVAL_RESULTS_KEY, doc);
}

/** Single LLM baseline: one direct call, no swarm. */
async function runBaseline(task: EvalTask, onChunk?: (chunk: string) => void) {
  const step = await withTimeout(() => groqComplete(BASELINE_SYSTEM, task.brief, { temperature: 0.4, maxTokens: 700, onChunk }), SINGLE_MAX_MS);
  return { content: step.value.content, tokens: step.value.tokensUsed, latencyMs: step.durationMs };
}

/** Full SWARM pipeline via the same Orchestrator used by the live API. */
async function runSwarm(task: EvalTask): Promise<{ content: string; latencyMs: number; tokens: number; verdict: string }> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'swarm-eval-'));
  const store = new DocumentMissionStore(new FileBackend(dir));
  const now = new Date().toISOString();

  const record: MissionRecord = {
    id: `eval_${randomUUID()}`,
    name: `Eval · ${task.title}`,
    template: 'eval',
    prompt: task.brief,
    order: ['researcher', 'analyst', 'critic', 'synthesizer'],
    status: 'queued',
    provider: 'groq',
    model: GROQ_MODEL,
    startedAt: now,
    completedAt: null,
    createdAt: now,
    totalTokens: 0,
    estCostUsd: 0,
    error: null,
    agents: [],
    messages: [],
    nodes: [],
    edges: [],
    chunks: {},
    report: null,
    analytics: null,
  };

  await store.create(record);
  const orchestrator = new Orchestrator({ record, store, runSeed: Date.now() % 100000, budgetMs: EVAL_SWARM_BUDGET_MS });
  const started = Date.now();
  await orchestrator.start();
  const latencyMs = Date.now() - started;

  const verdict = record.report?.verdict ?? 'Swarm converged without a verdict.';
  const content = [
    `VERDICT: ${verdict}`,
    '',
    'KEY FINDINGS:',
    ...(record.report?.keyFindings ?? []).map((f) => `- ${f}`),
    '',
    'RISKS:',
    ...(record.report?.risks ?? []).map((r) => `- ${r}`),
  ].join('\n');

  await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  return { content, latencyMs, tokens: record.totalTokens, verdict };
}

/** LLM-as-judge: a different model scores both answers. */
async function runJudge(task: EvalTask, baseline: string, swarm: string) {
  const step = await withTimeout(
    () => groqComplete(JUDGE_SYSTEM, judgePrompt(task, baseline, swarm), { temperature: 0, maxTokens: 700, model: JUDGE_MODEL }),
    JUDGE_MAX_MS,
  );

  const text = step.value.content;
  const parsed = parseJudgeOutput(text);
  return { scoreA: parsed.scoreA, scoreB: parsed.scoreB, winner: parsed.winner, rationale: parsed.rationale, tokens: step.value.tokensUsed };
}

/**
 * Runs one fixed task end-to-end: baseline → swarm → judge. Never throws —
 * failures are recorded in the result so a single flaky call can't stall a run.
 */
export async function runEvalTask(task: EvalTask): Promise<EvalRunResult> {
  const provider = resolveProvider();
  const model = currentModel();

  if (!groqAvailable()) {
    throw new Error('eval requires a live Groq key (GROQ_API_KEY)');
  }

  resetProviderUsage();
  logger.info('eval task started', { task: task.id });

  const baseline = await runBaseline(task, () => undefined);
  await sleep(1200);
  const swarm = await runSwarm(task);
  await sleep(1200);
  const judge = await runJudge(task, baseline.content, swarm.content);

  const used = providerUsage();
  if (used.includes('simulation')) {
    throw new Error('benchmark would have fallen back to simulation — use a live model');
  }

  const result: EvalRunResult = {
    taskId: task.id,
    title: task.title,
    category: task.category,
    brief: task.brief,
    baseline: { content: baseline.content, latencyMs: baseline.latencyMs, tokens: baseline.tokens },
    swarm: { content: swarm.content, latencyMs: swarm.latencyMs, tokens: swarm.tokens, verdict: swarm.verdict },
    judge: { scoreA: judge.scoreA, scoreB: judge.scoreB, winner: judge.winner, rationale: judge.rationale },
    model,
    judgeModel: JUDGE_MODEL,
    provider,
    providersUsed: used,
    ranAt: new Date().toISOString(),
  };

  logger.info('eval task done', { task: task.id, scoreA: judge.scoreA, scoreB: judge.scoreB, winner: judge.winner });
  return result;
}

/** Re-runs the whole catalogue (used by `npm run eval` and the reset path). */
export async function runAllEvalTasks(progress?: (done: number, total: number, taskId: string) => void): Promise<EvalResultsDoc> {
  const results: EvalRunResult[] = [];
  for (let i = 0; i < EVAL_TASKS.length; i += 1) {
    const task = EVAL_TASKS[i];
    try {
      results.push(await runEvalTask(task));
    } catch (err) {
      logger.error('eval task failed', { task: task.id, error: err instanceof Error ? err.message : String(err) });
    }
    progress?.(i + 1, EVAL_TASKS.length, task.id);
    if (i < EVAL_TASKS.length - 1) await sleep(1500);
  }
  return { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tasks: results };
}