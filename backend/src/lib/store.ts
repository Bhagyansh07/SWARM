import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  AgentMessageDto,
  AgentStateDto,
  KnowledgeEdgeDto,
  KnowledgeNodeDto,
  MissionAnalytics,
  MissionSummaryDto,
} from '../types';
import { logger } from './logger';

export interface MissionReportDto {
  summary: string;
  keyFindings: string[];
  risks: string[];
  verdict: string;
}

/**
 * A mission is stored as a single self-contained JSON document. The orchestrator
 * owns the document while a run is in flight and writes it back through the
 * {@link MissionStore} as it changes, so any reader (the polling API) can watch a
 * mission evolve without a socket server.
 */
export interface MissionRecord {
  id: string;
  name: string;
  template: string;
  prompt: string;
  order: string[];
  status: string;
  provider: string;
  model: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  totalTokens: number;
  estCostUsd: number;
  error: string | null;
  agents: AgentStateDto[];
  messages: AgentMessageDto[];
  nodes: KnowledgeNodeDto[];
  edges: KnowledgeEdgeDto[];
  chunks: Record<string, string>;
  report: MissionReportDto | null;
  analytics: MissionAnalytics | null;
}

export interface MissionStore {
  create(record: MissionRecord): Promise<void>;
  save(record: MissionRecord): Promise<void>;
  get(id: string): Promise<MissionRecord | null>;
  list(limit: number): Promise<MissionSummaryDto[]>;
  remove(id: string): Promise<void>;
}

const MISSION_PREFIX = 'missions/';
const INDEX_KEY = 'index.json';
const INDEX_LIMIT = 200;

const missionKey = (id: string) => `${MISSION_PREFIX}${id}.json`;

export function toSummary(record: MissionRecord): MissionSummaryDto {
  return {
    id: record.id,
    name: record.name,
    template: record.template,
    prompt: record.prompt,
    status: record.status,
    provider: record.provider,
    model: record.model,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    totalTokens: record.totalTokens,
    estCostUsd: record.estCostUsd,
    createdAt: record.createdAt,
  };
}

interface DocBackend {
  read(key: string): Promise<unknown | null>;
  write(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

/** File-backed document store: used for local development and self-hosting. */
export class FileBackend implements DocBackend {
  private readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  private resolve(key: string): string {
    return path.join(this.dir, key);
  }

  async read(key: string): Promise<unknown | null> {
    try {
      const raw = await readFile(this.resolve(key), 'utf8');
      return JSON.parse(raw) as unknown;
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
      logger.warn('store read failed', { key, error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    const file = this.resolve(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(value), 'utf8');
  }

  async remove(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }
}

/** Blob-backed document store: used in production on Vercel. */
class BlobBackend implements DocBackend {
  private sdk: Promise<typeof import('@vercel/blob')> | null = null;

  private client() {
    if (!this.sdk) this.sdk = import('@vercel/blob');
    return this.sdk;
  }

  async read(key: string): Promise<unknown | null> {
    const { get } = await this.client();
    try {
      const result = await get(key, { access: 'public', useCache: false });
      if (!result || result.statusCode !== 200) return null;
      const text = await new Response(result.stream).text();
      return text ? (JSON.parse(text) as unknown) : null;
    } catch (err) {
      logger.warn('blob read failed', { key, error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    const { put } = await this.client();
    await put(key, JSON.stringify(value), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
    });
  }

  async remove(key: string): Promise<void> {
    const { del } = await this.client();
    await del(key);
  }
}

function createBackend(): DocBackend {
  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.SWARM_STORE === 'blob';
  if (useBlob) return new BlobBackend();
  const dir = process.env.SWARM_DATA_DIR ?? path.join(process.cwd(), '.swarm-data');
  return new FileBackend(dir);
}

export class DocumentMissionStore implements MissionStore {
  private readonly backend: DocBackend;
  private readonly summaryCache = new Map<string, string>();

  constructor(backend: DocBackend) {
    this.backend = backend;
  }

  private async readIndex(): Promise<MissionSummaryDto[]> {
    const index = await this.backend.read(INDEX_KEY);
    return Array.isArray(index) ? (index as MissionSummaryDto[]) : [];
  }

  async create(record: MissionRecord): Promise<void> {
    await this.backend.write(missionKey(record.id), record);
    const index = await this.readIndex();
    const summary = toSummary(record);
    const next = [summary, ...index.filter((entry) => entry.id !== record.id)].slice(0, INDEX_LIMIT);
    await this.backend.write(INDEX_KEY, next);
    this.summaryCache.set(record.id, JSON.stringify(summary));
  }

  async save(record: MissionRecord): Promise<void> {
    await this.backend.write(missionKey(record.id), record);

    // The library only needs the summary, so only touch the index when a
    // summary-relevant field changed (status, totals, completion).
    const summary = toSummary(record);
    const encoded = JSON.stringify(summary);
    if (this.summaryCache.get(record.id) === encoded) return;

    const index = await this.readIndex();
    const next = [summary, ...index.filter((entry) => entry.id !== record.id)].slice(0, INDEX_LIMIT);
    await this.backend.write(INDEX_KEY, next);
    this.summaryCache.set(record.id, encoded);
  }

  async get(id: string): Promise<MissionRecord | null> {
    const record = await this.backend.read(missionKey(id));
    return record && typeof record === 'object' ? this.hydrate(record as MissionRecord) : null;
  }

  async list(limit: number): Promise<MissionSummaryDto[]> {
    const index = await this.readIndex();
    return index.slice(0, Math.max(0, limit));
  }

  async remove(id: string): Promise<void> {
    await this.backend.remove(missionKey(id));
    const index = await this.readIndex();
    await this.backend.write(INDEX_KEY, index.filter((entry) => entry.id !== id));
    this.summaryCache.delete(id);
  }

  /** Backfill fields when reading documents written by an older shape. */
  private hydrate(record: MissionRecord): MissionRecord {
    return {
      ...record,
      agents: record.agents ?? [],
      messages: record.messages ?? [],
      nodes: record.nodes ?? [],
      edges: record.edges ?? [],
      chunks: record.chunks ?? {},
      report: record.report ?? null,
      analytics: record.analytics ?? null,
      error: record.error ?? null,
    };
  }
}

let singleton: MissionStore | null = null;

export function getStore(): MissionStore {
  if (!singleton) singleton = new DocumentMissionStore(createBackend());
  return singleton;
}

/** Generic JSON document read/write using the same File/Blob backends as missions. */
export async function readDoc<T>(key: string): Promise<T | null> {
  return (await createBackend().read(key)) as T | null;
}

export async function writeDoc<T>(key: string, value: T): Promise<void> {
  await createBackend().write(key, value);
}
