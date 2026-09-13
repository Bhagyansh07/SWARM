import { Agent } from './base';
import { llmTurn } from '../llm/provider';
import type { LlmCallback } from '../llm/provider';

export class ResearcherAgent extends Agent {
  async run(): Promise<void> {
    this.ctx.onUpdate({ status: 'working', phase: 'gather', confidence: 0.2, iterations: 1, tokensUsed: 0 });

    const userPrompt = `Mission objective: ${this.ctx.prompt}

Act as the RESEARCHER. Break the objective into claim, context, and gap. Produce 3-5 concrete evidence findings. Before each finding, cite what kind of evidence it is (primary/secondary/inferred). End with a one-line "Research boundary" noting what remains unknown.`;

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
      previousFindings: this.ctx.getSharedFindings(),
      systemPrompt: this.systemPrompt(),
      runSeed: this.ctx.runSeed,
      onChunk,
    });

    const findings = acc
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 20 && (l.includes(':') || l.startsWith('-') || l.includes('—')));

    const actualFindings = findings.length > 0 ? findings.slice(0, 5) : [res.content];
    for (const f of actualFindings) {
      this.ctx.onMessage('evidence', f);
    }
    this.ctx.onGraph(
      actualFindings.map((f, i) => ({
        label: f.slice(0, 42),
        kind: 'fact',
        group: 0,
        weight: 0.5 + ((i + this.ctx.runSeed) % 4) * 0.1,
      })),
      actualFindings.slice(1).map((f, i) => ({
        sourceLabel: actualFindings[i].slice(0, 42),
        targetLabel: f.slice(0, 42),
        label: 'corroborates',
      })),
    );

    this.ctx.onUpdate({ status: 'done', phase: 'gather:complete', confidence: 0.8, iterations: 2, tokensUsed: res.tokensUsed });
  }
}