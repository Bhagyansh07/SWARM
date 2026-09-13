import { Agent } from './base';
import { llmTurn } from '../llm/provider';
import type { LlmCallback } from '../llm/provider';

export class SynthesizerAgent extends Agent {
  async run(): Promise<void> {
    this.ctx.onUpdate({ status: 'working', phase: 'synthesize', confidence: 0.2, iterations: 1, tokensUsed: 0 });

    const prior = this.ctx.getSharedFindings();
    const priorText = prior.length ? prior.map((f) => `- ${f}`).join('\n') : '(no prior findings)';

    const userPrompt = `Mission objective: ${this.ctx.prompt}

Swarm findings (including critic challenges):
${priorText}

Act as the SYNTHESIZER. Write the final mission report: a 2-3 sentence verdict, a bullet list of 3 key findings, a bullet list of the top 2-3 risks, and any dissent that never fully resolved. Be decisive. Keep the whole report under 180 words.`;

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

    const content = acc.length > 20 ? acc : res.content;
    this.ctx.onMessage('synthesis', content);

    this.ctx.onGraph(
      [{ label: `${this.ctx.missionName} → verdict`, kind: 'claim', group: 3, weight: 0.9 }],
      prior.slice(0, 4).map((f) => ({
        sourceLabel: f.slice(0, 42),
        targetLabel: `${this.ctx.missionName} → verdict`,
        label: 'informs',
      })),
    );

    this.ctx.onUpdate({ status: 'done', phase: 'converge:complete', confidence: 0.85, iterations: 2, tokensUsed: res.tokensUsed });
  }
}