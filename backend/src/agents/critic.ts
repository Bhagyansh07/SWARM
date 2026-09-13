import { Agent } from './base';
import { llmTurn } from '../llm/provider';
import type { LlmCallback } from '../llm/provider';

export class CriticAgent extends Agent {
  async run(): Promise<void> {
    this.ctx.onUpdate({ status: 'working', phase: 'adversarial', confidence: 0.2, iterations: 1, tokensUsed: 0 });

    const prior = this.ctx.getSharedFindings();
    const priorText = prior.length ? prior.map((f) => `- ${f}`).join('\n') : '(nothing to attack yet)';

    const userPrompt = `Mission objective: ${this.ctx.prompt}

Claims so far:
${priorText}

Act as the CRITIC. This is an adversarial review: attack the three weakest assumptions, name the single most likely failure mode, and state clearly what evidence would change your mind. Do not soften it. Keep to 5-7 sentences.`;

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
    const critiques = lines.length > 0 ? lines.slice(0, 3) : [res.content.slice(0, 200)];
    for (const c of critiques) this.ctx.onMessage('critique', c);

    this.ctx.onGraph(
      critiques.map((l, i) => ({ label: `risk: ${l.slice(0, 36)}`, kind: 'claim', group: 2, weight: 0.65 - i * 0.1 })),
      critiques.slice(1).map((l, i) => ({
        sourceLabel: `risk: ${critiques[i].slice(0, 36)}`,
        targetLabel: `risk: ${l.slice(0, 36)}`,
        label: 'compounds',
      })),
    );

    this.ctx.onUpdate({ status: 'done', phase: 'adversarial:complete', confidence: 0.35, iterations: 2, tokensUsed: res.tokensUsed });
  }
}