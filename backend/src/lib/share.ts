import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Share links are *derived*, not stored. A token is the mission id plus an
 * HMAC signature, so resolving one is a pure computation followed by a read of
 * the mission document that already exists. This avoids maintaining a mutable
 * lookup document, which would be subject to read-after-write lag (and
 * clobbering under concurrency) on the Blob store.
 */

function secret(): string {
  return process.env.SHARE_SECRET ?? process.env.BLOB_READ_WRITE_TOKEN ?? 'swarm-local-share-secret';
}

function sign(id: string): string {
  return createHmac('sha256', secret()).update(id).digest('base64url');
}

export function shareToken(id: string): string {
  return `${Buffer.from(id, 'utf8').toString('base64url')}.${sign(id)}`;
}

/** Returns the mission id when the token carries a valid signature, else null. */
export function missionIdFromToken(token: string): string | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;

  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  let id: string;
  try {
    id = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  if (!id) return null;

  const expected = sign(id);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return id;
}
