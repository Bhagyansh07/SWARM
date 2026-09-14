import { groqAvailable, groqComplete, MODEL } from './groq';
import { openaiAvailable, openaiComplete, MODEL as OPENAI_MODEL } from './openai';
import {
  simulateStream,
  type SimContext,
} from './simulation';
import { logger } from '../lib/logger';
import type { AgentRole } from '../types';

export type ProviderKind = 'groq' | 'openai' | 'simulation';

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
  if (forced === 'groq') return groqAvailable() ? 'groq' : openaiAvailable() ? 'openai' : 'simulation';
  if (forced === 'openai') return openaiAvailable() ? 'openai' : groqAvailable() ? 'groq' : 'simulation';
  return groqAvailable() ? 'groq' : openaiAvailable() ? 'openai' : 'simulation';
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function llmTurn(req: LlmTurnRequest): Promise<LlmTurnResponse> {
  const provider = resolveProvider();
  const providers: ProviderKind[] = provider === 'groq'
    ? ['groq', 'openai', 'simulation']
    : provider === 'openai'
      ? ['openai', 'groq', 'simulation']
      : ['simulation'];

  for (const candidate of providers) {
    if (candidate === 'simulation') break;
    try {
      const complete = candidate === 'groq' ? groqComplete : openaiComplete;
      const { content, tokensUsed } = await complete(req.systemPrompt, req.prompt, {
        temperature: 0.6,
        maxTokens: 750,
        onChunk: req.onChunk,
      });
      return { content, tokensUsed, provider: candidate };
    } catch (err) {
      logger.warn(`${candidate} request failed, trying next provider`, {
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
  const provider = resolveProvider();
  return provider === 'groq' ? MODEL : provider === 'openai' ? OPENAI_MODEL : 'deterministic-sim';
}