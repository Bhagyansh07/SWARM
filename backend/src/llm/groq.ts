import Groq from 'groq-sdk';
import { logger } from '../lib/logger';

const key = process.env.GROQ_API_KEY?.trim();
export const MODEL = process.env.GROQ_MODEL ?? 'qwen/qwen3.8-27b';

const client = key ? new Groq({ apiKey: key }) : null;

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function groqAvailable(): boolean {
  return client !== null;
}

export async function groqComplete(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<{ content: string; tokensUsed: number }> {
  if (!client) throw new Error('groq client not configured');

  const messages: GroqMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const start = Date.now();
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 700,
    messages,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? '';
  const tokensUsed =
    completion.usage?.total_tokens ?? Math.ceil(content.length / 4);

  logger.debug('groq complete', {
    model: MODEL,
    latencyMs: Date.now() - start,
    tokens: tokensUsed,
  });

  return { content, tokensUsed };
}