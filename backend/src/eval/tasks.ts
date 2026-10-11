/**
 * Fixed benchmark tasks. Every task runs through (a) a single LLM baseline call
 * and (b) the full SWARM pipeline, then a different model scores both outputs
 * against the same rubric (1–5). Tasks are deliberately small enough to fit the
 * serverless budget yet broad enough to exercise research, critique and
 * synthesis behaviour.
 */

export interface EvalTask {
  id: string;
  category: 'strategy' | 'research' | 'review' | 'operations';
  title: string;
  brief: string;
  rubric: string;
}

export const EVAL_TASKS: EvalTask[] = [
  {
    id: 'startup-validation',
    category: 'strategy',
    title: 'Startup idea validation',
    brief:
      'A solo founder wants to launch a subscription box that curates indie board games. Evaluate the idea: who is the customer, what must be true for it to work, what are the three biggest risks, and is the pricing roughly sane?',
    rubric: 'Accuracy of reasoning, completeness of the customer/risk analysis, actionability of next steps.',
  },
  {
    id: 'edge-ai-research',
    category: 'research',
    title: 'Edge-AI chip market scan',
    brief:
      'Give a grounded scan of the 2026 edge-AI chip landscape: who the main players are, what compute trend matters most, what the open problems are, and who is most likely to win and why.',
    rubric: 'Groundedness and breadth, quality of named players/claims, coherence of the conclusion.',
  },
  {
    id: 'express-code-review',
    category: 'review',
    title: 'Express API code review',
    brief:
      'Review this Express server: POST /hooks (no verification, writes to disk via req.body.filename) and POST /upload (accepts any file, no size limit, no auth). Rank the concrete vulnerabilities by impact and give the top three fixes in order.',
    rubric: 'Technical correctness of identified issues, correct severity ordering, specificity of fixes.',
  },
  {
    id: 'checkout-triage',
    category: 'operations',
    title: 'Production checkout triage',
    brief:
      'Users report intermittent 500s on checkout at high traffic: some see network timeouts, some see 503, error logs show PostgreSQL connection pool exhaustion. Rank hypotheses by likelihood, say what you would instrument first, and describe the fastest safe mitigation.',
    rubric: 'Plausible hypothesis ranking, operational reasoning, safety of the proposed mitigation.',
  },
  {
    id: 'go-to-market',
    category: 'strategy',
    title: '30-day GTM for a dev tool',
    brief:
      'Draft a 30-day go-to-market plan for a free developer tool aimed at solo founders. Pick 2–3 channels, propose the content type that will earn attention, and state the one metric to watch on day one.',
    rubric: 'Channel realism, prioritisation, concrete and actionable plan.',
  },
  {
    id: 'serverless-migration',
    category: 'operations',
    title: 'Serverless migration risk plan',
    brief:
      'Plan a migration from a Socket.IO + SQLite app to serverless functions with object storage. What breaks first, what is a safe cutover order, and which two rollback risks deserve the most attention?',
    rubric: 'Ordering of migration steps, identification of subtle breakages, realistic rollback thinking.',
  },
];

export function getEvalTask(id: string): EvalTask | undefined {
  return EVAL_TASKS.find((task) => task.id === id);
}

/** Single-LLM baseline system prompt — asks for the same report shape SWARM produces. */
export const BASELINE_SYSTEM =
  'You are a senior consultant answering a brief directly. Respond with:\nVERDICT: one decisive sentence.\nKEY FINDINGS: 3-5 short bullet points.\nRISKS: 1-3 short bullet points.\nBe specific and concrete; do not hedge.';

/** Judge model — deliberately different from the answer model to reduce self-preference. */
export const JUDGE_MODEL = process.env.EVAL_JUDGE_MODEL ?? 'llama-3.1-70b-versatile';

export function judgePrompt(task: EvalTask, baseline: string, swarm: string): string {
  return [
    `You are an impartial evaluator. Score both responses to the same brief against the rubric below.`,
    ``,
    `BRIEF: ${task.brief}`,
    ``,
    `RUBRIC: ${task.rubric}`,
    ``,
    `--- RESPONSE A (single LLM baseline) ---`,
    baseline,
    ``,
    `--- RESPONSE B (multi-agent SWARM) ---`,
    swarm,
    ``,
    `Rate each response 1-5 on: accuracy, completeness, actionability. Then give the final scores as:\nSCORE_A: <number>\nSCORE_B: <number>\nWINNER: A | B | TIE\nRATIONALE: 2-3 sentences.`,
  ].join('\n');
}

export const JUDGE_SYSTEM =
  'You are a strict, fair benchmark judge. Output only the lines requested: SCORE_A, SCORE_B, WINNER, RATIONALE. Base everything on the provided text — never hallucinate claims into a response.';