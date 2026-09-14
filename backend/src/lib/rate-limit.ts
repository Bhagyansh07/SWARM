export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const hits = new Map<string, number[]>();

  return {
    limited(key: string): boolean {
      const now = Date.now();
      const bucket = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < config.windowMs);
      hits.set(key, bucket);
      return bucket.length >= config.max;
    },
    record(key: string): void {
      hits.set(key, [...(hits.get(key) ?? []), Date.now()]);
    },
  };
}

export const missionLaunchRateLimit = { windowMs: 60_000, max: 12 };
