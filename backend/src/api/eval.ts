import { Router, type Request, type Response } from 'express';
import { logger } from '../lib/logger';
import { runEvalTask, loadResults, saveResults, type EvalResultsDoc } from '../eval/runner';
import { createRateLimiter, type RateLimitConfig } from '../lib/rate-limit';
import { getEvalTask } from '../eval/tasks';

// Running one benchmark task is expensive (several LLM calls + a full swarm run),
// so it is rate-limited hard — visitors can re-run, but a bot can't drain the key.
const evalRunLimiter = createRateLimiter({ windowMs: 60_000, max: 3 } satisfies RateLimitConfig);
const evalDailyLimiter = createRateLimiter({ windowMs: 24 * 60 * 60_000, max: 24 } satisfies RateLimitConfig);

function countByWinner(doc: EvalResultsDoc): Record<string, number> {
  return doc.tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.judge.winner] = (acc[t.judge.winner] ?? 0) + 1;
    return acc;
  }, {});
}

export function createEvalRouter(): Router {
  const router = Router();

  router.get('/eval', async (_req: Request, res: Response) => {
    try {
      const doc = await loadResults();
      res.json({
        data: {
          tasks: doc.tasks,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          summary: {
            total: doc.tasks.length,
            byWinner: countByWinner(doc),
            avgScoreA: doc.tasks.length
              ? doc.tasks.reduce((s, t) => s + t.judge.scoreA, 0) / doc.tasks.length
              : 0,
            avgScoreB: doc.tasks.length
              ? doc.tasks.reduce((s, t) => s + t.judge.scoreB, 0) / doc.tasks.length
              : 0,
            avgTokensA: doc.tasks.length
              ? doc.tasks.reduce((s, t) => s + t.baseline.tokens, 0) / doc.tasks.length
              : 0,
            avgTokensB: doc.tasks.length
              ? doc.tasks.reduce((s, t) => s + t.swarm.tokens, 0) / doc.tasks.length
              : 0,
            avgLatencyA: doc.tasks.length
              ? doc.tasks.reduce((s, t) => s + t.baseline.latencyMs, 0) / doc.tasks.length
              : 0,
            avgLatencyB: doc.tasks.length
              ? doc.tasks.reduce((s, t) => s + t.swarm.latencyMs, 0) / doc.tasks.length
              : 0,
          },
        },
      });
    } catch (err) {
      logger.error('eval results read failed', { error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Failed to load benchmark results.', details: {} } });
    }
  });

  router.post('/eval/run/:taskId', async (req: Request, res: Response) => {
    if (evalRunLimiter.limited(req.ip ?? 'unknown') || evalDailyLimiter.limited('global')) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Benchmark re-runs are rate-limited. Wait a minute and try again.',
          details: {},
        },
      });
      return;
    }

    const task = getEvalTask(req.params.taskId);
    if (!task) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: `Unknown eval task "${req.params.taskId}".`, details: {} } });
      return;
    }

    try {
      const result = await runEvalTask(task);
      const doc = await loadResults();
      doc.tasks = [
        ...doc.tasks.filter((t) => t.taskId !== task.id),
        result,
      ].sort((a, b) => a.taskId.localeCompare(b.taskId));
      await saveResults(doc);
      evalRunLimiter.record(req.ip ?? 'unknown');
      evalDailyLimiter.record('global');

      res.json({ data: { task: result, updatedAt: doc.updatedAt } });
    } catch (err) {
      logger.error('eval run failed', { task: req.params.taskId, error: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ error: { code: 'INTERNAL', message: 'Benchmark run failed.', details: {} } });
    }
  });

  return router;
}