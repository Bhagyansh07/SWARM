/**
 * `npm run eval` — runs the fixed benchmark catalogue (single LLM vs SWARM) and
 * writes eval-results.json. Requires GROQ_API_KEY in the environment.
 *
 *   GROQ_API_KEY=... npm run eval
 *
 * Output is JSON, one line per completed task, plus a final summary. The results
 * are stored wherever the store backend points (locally: .swarm-data/).
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runAllEvalTasks } from '../src/eval/runner';
import { EVAL_TASKS } from '../src/eval/tasks';

async function main(): Promise<void> {
  console.log(`SWARM eval · ${EVAL_TASKS.length} tasks · single LLM vs multi-agent`);
  const startedAt = Date.now();
  const doc = await runAllEvalTasks((done, total, taskId) => {
    console.log(`  [${done}/${total}] ${taskId}`);
  });

  const outPath = path.join(process.cwd(), 'eval-results.json');
  await writeFile(outPath, JSON.stringify(doc, null, 2), 'utf8');
  console.log(`wrote ${outPath}`);
  console.log(`summary · ${doc.tasks.length}/${EVAL_TASKS.length} tasks in ${((Date.now() - startedAt) / 1000).toFixed(0)}s`);
  const me = doc.tasks;
  if (me.length > 0) {
    const scoreA = me.reduce((s, t) => s + t.judge.scoreA, 0) / me.length;
    const scoreB = me.reduce((s, t) => s + t.judge.scoreB, 0) / me.length;
    console.log(`  avg score  · baseline ${scoreA.toFixed(2)} vs swarm ${scoreB.toFixed(2)}`);
  }
}

main().catch((err) => {
  console.error('eval failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});