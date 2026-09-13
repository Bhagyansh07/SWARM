import { groqAvailable, groqComplete, MODEL } from './groq';
import {
  simulateStream,
  type SimContext,
} from './simulation';
import { logger } from '../lib/logger';
import type { AgentRole } from '../types';

export type ProviderKind = 'groq' | 'simulation';

export type LlmCallback = (chunk: string) => void;

export interface LlmTurnRequest {
  role: AgentRole;
  prompt: string;
  name: string;
  missionName: string;
  template: string;
  previousFindings: string[];
  systemPrompt: string;
  runSeed: number;
  onChunk: LlmCallback;
}

export interface LlmTurnResponse {
  content: string;
  tokensUsed: number;
  provider: ProviderKind;
}

export function resolveProvider(): ProviderKind {
  const forced = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (forced === 'simulation') return 'simulation';
  if (forced === 'groq') return groqAvailable() ? 'groq' : 'simulation';
  return groqAvailable() ? 'groq' : 'simulation';
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function llmTurn(req: LlmTurnRequest): Promise<LlmTurnResponse> {
  const provider = resolveProvider();

  if (provider === 'groq') {
    try {
      const { content, tokensUsed } = await groqComplete(req.systemPrompt, req.prompt, {
        temperature: 0.6,
        maxTokens: 750,
        onChunk: req.onChunk,
      });
      return { content, tokensUsed, provider: 'groq' };
    } catch (err) {
      logger.warn('groq request failed, falling back to simulation', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const simCtx: SimContext = {
    role: req.role,
    prompt: req.prompt,
    name: req.name,
    missionName: req.missionName,
    template: req.template,
    previousFindings: req.previousFindings,
  };

  const result = await simulateStream(simCtx, req.runSeed, (c) => req.onChunk(c));
  await delay(120); // let the streamed chunks flush naturally
  return {
    content: result.thoughts.join('\n'),
    tokensUsed: result.tokensUsed,
    provider: 'simulation',
  };
}

export function currentModel(): string {
  return resolveProvider() === 'groq' ? MODEL : 'deterministic-sim';
}