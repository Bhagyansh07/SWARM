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
  opts: { temperature?: number; maxTokens?: number; onChunk?: (chunk: string) => void } = {},
): Promise<{ content: string; tokensUsed: number }> {
  if (!client) throw new Error('groq client not configured');

  const messages: GroqMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const start = Date.now();
  const stream = await client.chat.completions.create({
    model: MODEL,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 700,
    messages,
    stream: true,
  });

  let content = '';
  let tokensUsed = 0;
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      content += delta;
      opts.onChunk?.(delta);
    }
  }
  content = content.trim();
  tokensUsed ||= Math.ceil(content.length / 4);

  logger.debug('groq complete', {
    model: MODEL,
    latencyMs: Date.now() - start,
    tokens: tokensUsed,
  });

  return { content, tokensUsed };
}