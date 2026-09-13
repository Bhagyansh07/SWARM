import { Agent } from './base';
import { llmTurn } from '../llm/provider';
import type { LlmCallback } from '../llm/provider';

export class AnalystAgent extends Agent {
  async run(): Promise<void> {
    this.ctx.onUpdate({ status: 'working', phase: 'analyze', confidence: 0.2, iterations: 1, tokensUsed: 0 });

    const prior = this.ctx.getSharedFindings();
    const priorText = prior.length ? prior.map((f) => `- ${f}`).join('\n') : '(no prior findings yet)';

    const userPrompt = `Mission objective: ${this.ctx.prompt}

Research findings available so far:
${priorText}

Act as the ANALYST. Weigh each finding's quality (primary vs secondary), surface 2-3 patterns or correlations, and assign a confidence level to the overall thesis. Be quantitative where possible. Keep it to 5-7 sentences.`;

    let acc = '';
    const onChunk: LlmCallback = (c) => {
      acc += c;
      this.ctx.onChunk(c);
    };

    const res = await llmTurn({
      role: this.role,
      prompt: userPrompt,
      name: this.meta().name,
      missionName: this.ctx.missionName,
      template: this.ctx.template,
      previousFindings: prior,
      systemPrompt: this.systemPrompt(),
      runSeed: this.ctx.runSeed,
      onChunk,
    });

    const lines = acc
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 16);
    const key = lines.length > 0 ? lines.slice(0, 3) : [res.content.slice(0, 200)];
    for (const l of key) this.ctx.onMessage('thought', l);

    this.ctx.onGraph(
      key.map((l, i) => ({ label: l.slice(0, 42), kind: 'entity', group: 1, weight: 0.55 + i * 0.1 })),
      key.slice(1).map((l, i) => ({
        sourceLabel: key[i].slice(0, 42),
        targetLabel: l.slice(0, 42),
        label: 'correlates with',
      })),
    );

    this.ctx.onUpdate({ status: 'done', phase: 'analyze:complete', confidence: 0.7, iterations: 2, tokensUsed: res.tokensUsed });
  }
}