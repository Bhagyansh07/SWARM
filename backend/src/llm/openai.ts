import OpenAI from 'openai';
import { logger } from '../lib/logger';

const key = process.env.OPENAI_API_KEY?.trim();
export const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const client = key ? new OpenAI({ apiKey: key }) : null;

export function openaiAvailable(): boolean {
  return client !== null;
}

export async function openaiComplete(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number; onChunk?: (chunk: string) => void } = {},
): Promise<{ content: string; tokensUsed: number }> {
  if (!client) throw new Error('openai client not configured');

  const stream = await client.chat.completions.create({
    model: MODEL,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 700,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    stream: true,
  });

  let content = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      content += delta;
      opts.onChunk?.(delta);
    }
  }

  const trimmed = content.trim();
  const tokensUsed = Math.ceil(trimmed.length / 4);
  logger.debug('openai complete', { model: MODEL, tokens: tokensUsed });
  return { content: trimmed, tokensUsed };
}
