import type { AgentRole } from '../types';

export interface SimContext {
  role: AgentRole;
  prompt: string;
  name: string;
  missionName: string;
  template: string;
  previousFindings: string[];
}

export interface SimResult {
  thoughts: string[];
  messages: Array<{ type: string; content: string }>;
  findings: string[];
  confidence: number;
  tokensUsed: number;
  nodes: Array<{ label: string; kind: string; group: number; weight: number }>;
  edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }>;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function getNouns(prompt: string): string[] {
  const banned = new Set(['the', 'a', 'an', 'in', 'of', 'to', 'and', 'or', 'for', 'on', 'at', 'with', 'from', 'this', 'that', 'how', 'what', 'why', 'when', '?' , '!', ',', '.']);
  return prompt
    .replace(/\[(topic|idea|product|diff)\]/g, (m) => m)
    .toLowerCase()
    .split(/[^a-z0-9\-]+/)
    .filter((w) => w.length > 2 && !banned.has(w));
}

function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const RESEARCH_ISSUES = [
  'traction figures are inconsistent across sources',
  'the moat claim is unverified by any primary data',
  'distribution cost is almost certainly understated',
  'competitor timing assumptions look optimistic',
  'the revenue model ignores churn entirely',
  'team experience is thinner than the plan implies',
  'regulatory exposure is waved away, not handled',
  'the unit economics only work at impossible scale',
];

const CRITIC_ATTACKS = [
  'If this works, why has nobody executed it in five years of cheap AI?',
  'The plan threads every risk except the one that actually kills products: distribution.',
  'You are solving a problem that is urgent in your head and optional in the market.',
  'This has moat in the pitch and none in the architecture. Show me the switching cost.',
  'The milestones are calendar-shaped, not outcome-shaped. That is project theatre.',
  'One pilot is a story, not a signal. Where is the second customer?',
];

const ANALYST_CORRELATIONS = [
  'demand-side signals are real but concentrated, not broad',
  'cost curve bends down, but slower than the thesis requires',
  'the core differentiator is observable but trivially copied',
  'risk concentrates in delivery, not demand — execution gap, not market gap',
  'timing is the whole bet: slightly early is the same as wrong',
];

const SYNTH_VEDICTS = [
  'Proceed — with the distribution plan rewritten from first principles.',
  'Conditional go — the thesis holds, the economics do not yet.',
  'Kill the expansion, keep the core: narrow, then double down.',
  'Do not ship. The evidence profile funded is directionally wrong.',
];

function research(seed: number, ctx: SimContext): number {
  return ctx.previousFindings.length;
}

export function simulate(ctx: SimContext, runSeed: number): SimResult {
  const salt = seedFrom(`${ctx.prompt}:${ctx.role}:${runSeed}`);
  const nouns = getNouns(ctx.prompt);
  const noun = nouns.length > 0 ? pick(nouns, salt) : 'the target';
  const arena = pick(
    ['the primary market', 'distribution channels', 'unit economics', 'the switching cost', 'time-to-market', 'the regulatory layer'],
    salt + 1,
  );
  const actor = ctx.name;
  const step = (salt + 3) % 4;

  const thoughts: string[] = [];
  const messages: Array<{ type: string; content: string }> = [];
  const findings: string[] = [];
  let nodes: Array<{ label: string; kind: string; group: number; weight: number }> = [];
  const edges: Array<{ sourceLabel: string; targetLabel: string; label?: string }> = [];
  let confidence = 0;
  let tokensUsed = 0;

  switch (ctx.role) {
    case 'researcher': {
      thoughts.push(`Reconnaissance on "${ctx.prompt}" — splitting the brief into claim, context, and gap.`);
      const depth = 2 + (salt % 3);
      const facts = [
        `Primary observation: ${noun} sits in ${pick(['a defensible niche', 'a crowded corridor', 'an abandoned lane', 'a fast-moving current'], salt + 2)}, and that positioning changes the whole read.`,
        `Current evidence on ${arena} is thin and mostly secondary — exactly where a swarm earns its keep.`,
        `The stated size of the opportunity is disputed; sources cluster at ${5 + (salt % 9)}x apart, which is a red flag on the demand side.`,
        `Comparative scan: existing players price for ${pick(['speed', 'incumbency', 'premium access', 'scale'], salt + 4)}, not for the problem actually being solved.`,
      ];
      for (let i = 0; i < depth; i++) {
        const line = pick(facts, salt + i * 7);
        thoughts.push(`scan ${i + 1}/${depth}: ${line}`);
        findings.push(line);
        messages.push({ type: 'evidence', content: line });
        const label = line.split(' ').slice(0, 4).join(' ').replace(/[^a-z0-9 ]/gi, '');
        const label2 = (i + 1 < depth ? pick(facts, salt + i * 7 + 3).split(' ').slice(0, 4).join(' ').replace(/[^a-z0-9 ]/gi, '') : arena);
        nodes.push({ label, kind: 'fact', group: 0, weight: 0.4 + (salt % 5) * 0.1 });
        if (i > 0) edges.push({ sourceLabel: nodes[i - 1].label, targetLabel: label, label: 'corroborates' });
        edges.push({ sourceLabel: label, targetLabel: label2, label: 'contextualizes' });
      }
      tokensUsed = 120 + (salt % 160) + findings.length * 60;
      confidence = Math.min(0.85, 0.45 + (salt % 40) / 100 + depth * 0.06);
      break;
    }
    case 'analyst': {
      const base = [(ctx.previousFindings?.[0] ?? `${noun} evidence gathered`), `${arena} measure`, noun];
      thoughts.push('Weighing evidence. Counting how many findings are secondary, how many are asserted, how many are actually measured.');
      base.forEach((f, i) => {
        const line = `Signal "${f}": ${pick(ANALYST_CORRELATIONS, salt + i)}. Weighted at ${Math.round(20 + salt % 70)}%.`;
        thoughts.push(line);
        messages.push({ type: 'thought', content: line });
        findings.push(line);
        nodes.push({ label: f, kind: 'entity', group: 1, weight: 0.5 + (salt % 5) * 0.1 });
        if (i > 0) edges.push({ sourceLabel: base[i - 1], targetLabel: f, label: 'correlates with' });
      });
      tokensUsed = 140 + (salt % 120);
      confidence = Math.min(0.8, 0.5 + (salt % 30) / 100);
      break;
    }
    case 'critic': {
      thoughts.push('Adversarial pass. Loading hypotheses and attacking each one in turn.');
      const count = 2 + (salt % 2);
      CRITIC_ATTACKS.slice(0, count).forEach((a, i) => {
        const line = `${a}`;
        thoughts.push(`attack ${i + 1}: ${line}`);
        messages.push({ type: 'critique', content: line });
        findings.push(`RISK: ${line}`);
        nodes.push({ label: `risk: ${arena}`, kind: 'claim', group: 2, weight: 0.6 });
        if (i > 0) edges.push({ sourceLabel: nodes[0].label, targetLabel: nodes[nodes.length - 1].label, label: 'compounds' });
      });
      const line = `Confidence audit: researcher at ${Math.round(0.5 + salt % 40)}% on ${arena} looks ${pick(['one standard deviation too high', 'about right', 'unjustified'], salt + 2)}.`;
      thoughts.push(line);
      messages.push({ type: 'thought', content: line });
      tokensUsed = 130 + (salt % 110);
      confidence = 0.15 + (salt % 25) / 100;
      break;
    }
    case 'synthesizer': {
      thoughts.push('Convergence. Pulling the swarm’s findings into a single verdict with the risks attached.');
      const verdict = pick(SYNTH_VEDICTS, salt);
      const summary = `${verdict} The swarm’s central finding: ${noun} is ${pick(['real but mispriced', 'early but real', 'crowded at the edges, open in the middle', 'funding-ready, market-wobbly'], salt + 1)}, with the critical risk living in ${arena}. ${actor} recorded ${Math.max(2, ctx.previousFindings.length)} challenges from the critic lane before agreeing on direction.`;
      messages.push({ type: 'synthesis', content: summary });
      thoughts.push(summary);
      const top = `Top finding: ${pick(['distribution is the binding constraint', 'the core differentiator is copiable inside a quarter', 'demand exists but is concentrated in the wrong segment', 'the economics flip only at scale that takes capital'], salt + 3)}.`;
      thoughts.push(top);
      messages.push({ type: 'evidence', content: top });
      findings.push(top);
      nodes.push({ label: `${noun} → integrated verdict`, kind: 'claim', group: 3, weight: 0.9 });
      nodes.forEach((n, i) => {
        if (i > 0) edges.push({ sourceLabel: nodes[0].label, targetLabel: n.label, label: 'informs' });
      });
      tokensUsed = 200 + (salt % 200);
      confidence = 0.72 + (salt % 20) / 100;
      break;
    }
    case 'orchestrator': {
      thoughts.push(`Scheduling ${ctx.missionName}. Ordering lanes: researcher → analyst → critic → synthesizer.`);
      thoughts.push(`Watchers: ${step + 1} lanes active on telemetry. First findings blob in flight.`);
      tokensUsed = 40 + (salt % 60);
      confidence = 1;
      break;
    }
  }

  if (ctx.role !== 'orchestrator') {
    messages.unshift({
      type: 'narrative',
      content: `${actor} (${ctx.role}) joined the swarm on mission "${ctx.missionName}".`,
    });
  }
  nodes = nodes.filter((n, i, a) => a.findIndex((x) => x.label === n.label) === i);
  return { thoughts, messages, findings, confidence, tokensUsed, nodes, edges };
}

export function simulateStream(
  ctx: SimContext,
  runSeed: number,
  onChunk: (chunk: string) => void,
): Promise<SimResult> {
  return new Promise((resolve) => {
    const result = simulate(ctx, runSeed);
    let i = 0;
    const body = result.thoughts.join(' ');
    const interval = setInterval(() => {
      const slice = body.slice(i, i + 3);
      if (slice) onChunk(slice);
      i += 3;
      if (i >= body.length) {
        clearInterval(interval);
        resolve({ ...result, messages: [result.messages[0], ...result.messages.slice(1)] });
      }
    }, 4);
  });
}