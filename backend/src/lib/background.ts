import { waitUntil } from '@vercel/functions';
import { logger } from './logger';

/**
 * Keep a promise alive after the HTTP response has been sent.
 *
 * On Vercel this hands the promise to the platform via `waitUntil`, so a mission
 * keeps running (and persisting) once the launch request returns. On a plain Node
 * server `waitUntil` is unavailable; the promise is already in flight, so it just
 * runs to completion in the background.
 */
export function runInBackground(task: Promise<unknown>, label: string): void {
  const guarded = task.catch((err) => {
    logger.error('background task failed', {
      label,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  try {
    waitUntil(guarded);
  } catch {
    // Not inside a Vercel request context — the promise continues on its own.
  }
}
