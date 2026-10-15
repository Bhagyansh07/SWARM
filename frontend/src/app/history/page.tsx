'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GitBranch,
  MagnifyingGlass,
  RocketLaunch,
  ShareNetwork,
  Trash,
  X,
} from '@phosphor-icons/react/dist/ssr';
import { EmptyState, StatusDot } from '@/components/ui';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { formatDuration, formatRelative, statusColor } from '@/lib/hooks';
import { api } from '@/lib/api';
import { copyText } from '@/lib/export';
import type { MissionSummaryDto } from '@/lib/types';

type StatusFilter = 'all' | 'complete' | 'running' | 'failed';
type SortKey = 'newest' | 'oldest' | 'tokens' | 'duration';

const STATUS_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All Executions' },
  { key: 'complete', label: 'Converged' },
  { key: 'running', label: 'In Flight' },
  { key: 'failed', label: 'Failed' },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'duration', label: 'Duration' },
  { key: 'tokens', label: 'Token Volume' },
];

function durationOf(m: MissionSummaryDto): number {
  if (m.completedAt && m.status === 'complete') {
    return new Date(m.completedAt).getTime() - new Date(m.startedAt).getTime();
  }
  return 0;
}

export default function HistoryPage() {
  const router = useRouter();
  const toast = useToast();
  const [missions, setMissions] = useState<MissionSummaryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [busyId, setBusyId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    api
      .listMissions()
      .then((r) => setMissions(r.data.filter((m) => m.id !== 'roster')))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const del = async (id: string) => {
    if (!window.confirm('Delete this mission snapshot and its complete reasoning trace?')) return;
    setBusyId(id);
    try {
      await api.deleteMission(id);
      setMissions((m) => (m ? m.filter((x) => x.id !== id) : m));
      toast.push('Mission trace purged.', 'ok');
    } catch {
      toast.push('Deletion failed. Please retry.', 'bad');
    } finally {
      setBusyId(null);
    }
  };

  const share = async (id: string) => {
    try {
      const result = await api.shareMission(id);
      const url = `${window.location.origin}/shared/${result.data.token}`;
      const ok = await copyText(url);
      toast.push(ok ? 'Read-only share link copied to clipboard.' : url, ok ? 'ok' : 'info');
    } catch {
      toast.push('Failed to generate share link.', 'bad');
    }
  };

  const visible = useMemo(() => {
    if (!missions) return null;
    const q = query.trim().toLowerCase();
    const list = missions.filter((m) => {
      if (status !== 'all' && m.status !== status) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.prompt.toLowerCase().includes(q) ||
        m.template.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sort === 'newest') return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      if (sort === 'oldest') return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
      if (sort === 'tokens') return b.totalTokens - a.totalTokens;
      if (sort === 'duration') return durationOf(b) - durationOf(a);
      return 0;
    });
  }, [missions, query, status, sort]);

  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setSort('newest');
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-4 sm:px-6 pb-20 pt-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--faint)]">
              Audit Archive · Persistent Telemetry
            </span>
            <h1 className="font-display mt-2 text-[30px] font-extrabold tracking-tight text-[var(--ink)] sm:text-[36px]">
              Mission Execution Library
            </h1>
            <p className="mt-1 text-[14px] text-[var(--dim)]">
              Comprehensive log of all autonomous multi-agent runs, consensus reports, and telemetry.
            </p>
          </div>
          <Link
            href="/#launcher"
            className="flex items-center gap-2 rounded-lg bg-[var(--ink)] px-5 py-2.5 text-[13px] font-semibold text-[var(--paper)] transition-opacity hover:opacity-90 active:scale-95 no-underline"
          >
            <RocketLaunch size={15} weight="bold" />
            <span>Dispatch New Swarm</span>
          </Link>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
            <p className="font-mono m-0 text-[13px] text-rose-500">{error}</p>
            <button type="button" onClick={load} className="ghost px-3 py-1 text-[11px]">
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="mt-8 flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:max-w-[340px] lg:flex-1">
            <MagnifyingGlass
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
              aria-hidden
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter missions by brief or query..."
              className="field w-full rounded-full py-2.5 pl-10 pr-9 text-[13.5px] text-[var(--ink)] bg-[var(--paper-2)] border border-[var(--line)] placeholder:text-[var(--faint)] outline-none"
              aria-label="Search missions"
            >
            </input>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 text-[var(--faint)] hover:text-[var(--ink)]"
              >
                <X size={13} aria-hidden />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="segmented">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  aria-selected={status === o.key}
                  onClick={() => setStatus(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="field cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-[11px] text-[var(--ink)] bg-[var(--paper-2)] border border-[var(--line)] outline-none"
                aria-label="Sort missions"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} className="bg-[var(--paper)] text-[var(--ink)]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {visible === null && (
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-6">
            <SkeletonTable rows={5} />
          </div>
        )}

        {/* Empty state */}
        {visible !== null && visible.length === 0 && (
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-12 text-center">
            <EmptyState
              icon={<GitBranch size={24} className="text-[var(--dim)]" />}
              title={query || status !== 'all' ? 'No missions match criteria' : 'No mission executions recorded yet'}
              body={
                query || status !== 'all'
                  ? 'Try expanding search parameters or reset the active filter.'
                  : 'Launch your first mission collective to start building an audit-grade intelligence library.'
              }
              action={
                query || status !== 'all' ? (
                  <button onClick={clearFilters} className="ghost px-4 py-2 text-[12px]">
                    Reset Filters
                  </button>
                ) : (
                  <Link href="/#launcher" className="key px-5 py-2.5 text-[13px] no-underline">
                    Deploy Swarm
                  </Link>
                )
              }
            />
          </div>
        )}

        {/* Missions Feed */}
        {visible !== null && visible.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="font-mono text-[11px] text-[var(--faint)]">
              Showing {visible.length} execution{visible.length === 1 ? '' : 's'}
            </p>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] divide-y divide-[var(--line)] overflow-hidden shadow-sm">
              {visible.map((m) => {
                const color = statusColor(m.status);
                const dur = durationOf(m);
                return (
                  <div
                    key={m.id}
                    className="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--paper-3)]/40"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/mission/${m.id}`)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left border-0 bg-transparent p-0"
                    >
                      <span className="flex h-3 w-3 shrink-0 items-center justify-center">
                        <StatusDot color={color} live={!m.completedAt} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display truncate text-[14.5px] font-bold text-[var(--ink)]">
                            {m.name}
                          </span>
                          <span className="rounded-full bg-[var(--paper-3)] border border-[var(--line)] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-[var(--faint)]">
                            {m.template.split('_').join(' ')}
                          </span>
                        </div>
                        <p className="m-0 mt-1 truncate font-mono text-[11px] text-[var(--dim)]">
                          {m.prompt}
                        </p>
                      </div>

                      <div className="hidden sm:flex flex-col items-end shrink-0">
                        <span className="font-mono text-[12px] font-semibold text-[var(--ink)]">
                          {m.totalTokens.toLocaleString()} tokens
                        </span>
                        <span className="font-mono text-[10px] text-[var(--faint)]">
                          {dur !== 0 ? formatDuration(dur) : formatRelative(m.startedAt)}
                        </span>
                      </div>

                      <span
                        className="hidden md:inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider border border-[var(--line)] bg-[var(--paper-3)] text-[var(--ink)]"
                      >
                        {m.status}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void share(m.id)}
                        aria-label="Share link"
                        title="Copy shareable link"
                        className="btn-icon"
                      >
                        <ShareNetwork size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void del(m.id)}
                        disabled={busyId === m.id}
                        aria-label="Purge trace"
                        title="Purge mission trace"
                        className="btn-icon hover:!text-rose-500"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}