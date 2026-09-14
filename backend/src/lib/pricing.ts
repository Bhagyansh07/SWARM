export const COST_PER_MILLION_TOKENS_USD = Number(process.env.COST_PER_MILLION_TOKENS_USD ?? '0.59');

export function estimateTokenCost(tokens: number): number {
  return Number(((tokens / 1_000_000) * COST_PER_MILLION_TOKENS_USD).toFixed(6));
}
