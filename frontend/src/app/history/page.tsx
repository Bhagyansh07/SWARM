'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Funnel,
  GitBranch,
  MagnifyingGlass,
  ShareNetwork,
  SortAscending,
  Trash,
  X,
} from '@phosphor-icons/react/dist/ssr';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
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
  { key: 'all', label: 'All' },
  { key: 'complete', label: 'Complete' },
  { key: 'running', label: 'In flight' },
  { key: 'failed', label: 'Failed' },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'duration', label: 'Duration' },
  { key: 'tokens', label: 'Tokens' },
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
      .catch((e) => setError(e instanceof Error ? e.message : 'load failed'));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const del = async (id: string) => {
    if (!window.confirm('Delete this mission and its full trace?')) return;
    setBusyId(id);
    try {
      await api.deleteMission(id);
      setMissions((m) => (m ? m.filter((x) => x.id !== id) : m));
      toast.push('Mission and trace deleted.', 'ok');
    } catch {
      toast.push('Delete failed — try again.', 'bad');
    } finally {
      setBusyId(null);
    }
  };

  const share = async (id: string) => {
    try {
      const result = await api.shareMission(id);
      const url = `${window.location.origin}/shared/${result.data.token}`;
      const ok = await copyText(url);
      toast.push(ok ? 'Share link copied to clipboard.' : url, ok ? 'ok' : 'info');
    } catch {
      toast.push('Could not create a share link.', 'bad');
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
        m.id.toLowerCase().includes(q) ||
        m.template.toLowerCase().includes(q)
      );
    });
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
        case 'tokens':
          return b.totalTokens - a.totalTokens;
        case 'duration':
          return durationOf(b) - durationOf(a);
        default:
          return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      }
    });
    return sorted;
  }, [missions, query, status, sort]);

  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setSort('newest');
    inputRef.current?.focus();
  };

  return (
    <div className="bg-grid flex min-h-screen flex-col">
      <Topbar />
      <main id="main" className="mx-auto w-full max-w-[1000px] flex-1 px-5 pb-16">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4 pt-10">
          <div>
            <p className="rack-index m-0">run archive · persisted to blob storage</p>
            <h1 className="font-display m-0 mt-2 text-[26px] font-black uppercase tracking-[0.06em] text-[var(--ink)]">Run library</h1>
          </div>
          <Link href="/" className="ghost px-4 py-2 text-[12px] no-underline">
            Launch new
          </Link>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 border border-[var(--bad)] px-3 py-2">
            <p className="font-mono m-0 text-[12px] text-[var(--bad)]">{error}</p>
            <button type="button" onClick={load} className="ghost px-2.5 py-1 text-[10px]">
              retry
            </button>
          </div>
        )}

        {/* toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:max-w-[320px] lg:flex-1">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--faint)]" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, prompt, id…"
              className="field w-full py-2 pl-9 pr-8 text-[13.5px] text-[var(--ink)] outline-none"
              aria-label="Search missions"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 text-[var(--faint)] hover:text-[var(--signal)]"
              >
                <X size={13} aria-hidden />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)] sm:flex">
              <Funnel size={11} aria-hidden /> status
            </span>
            <div className="segmented" role="group" aria-label="Filter by status">
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

            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)] sm:flex">
                <SortAscending size={11} aria-hidden /> sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="field cursor-pointer px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--dim)] outline-none"
                aria-label="Sort missions"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} className="bg-[var(--field)] text-[var(--ink)]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {visible === null && <div className="mt-4 border border-[var(--line)] bg-[var(--paper-2)]"><SkeletonTable rows={5} /></div>}

        {visible !== null && visible.length === 0 && (
          <div className="mt-4 border border-[var(--line)] bg-[var(--paper-2)]">
            <EmptyState
              icon={<GitBranch size={20} aria-hidden />}
              title={query || status !== 'all' ? 'No runs match these filters' : 'No missions yet'}
              body={
                query || status !== 'all'
                  ? 'Try a different search term or clear the filters.'
                  : 'The launch pad is waiting — brief the swarm and your first run lands here.'
              }
              action={
                query || status !== 'all' ? (
                  <button onClick={clearFilters} className="ghost px-3 py-1.5 text-[11px]">
                    Clear filters
                  </button>
                ) : (
                  <Link href="/" className="key px-4 py-2 text-[11.5px] no-underline">
                    Launch a mission
                  </Link>
                )
              }
            />
          </div>
        )}

        {visible !== null && visible.length > 0 && (
          <>
            <p className="font-mono mt-6 text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
              {visible.length} run{visible.length === 1 ? '' : 's'} shown
            </p>
            <ul className="mt-2 list-none border border-[var(--line)] bg-[var(--paper-2)]">
              {visible.map((m, i) => {
                const color = statusColor(m.status);
                const dur = durationOf(m);
                return (
                  <li key={m.id} className="group flex items-center gap-2 border-b border-[var(--line)] px-3 transition-colors last:border-0 hover:bg-[var(--paper-3)]">
                    <span className="rack-index w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <button
                      onClick={() => router.push(`/mission/${m.id}`)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 border-0 bg-transparent p-0 py-3 text-left"
                      aria-label={`Open ${m.name}`}
                    >
                      <span className="hidden shrink-0 sm:block">
                        <StatusDot color={color} live={!m.completedAt} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-display block truncate text-[13.5px] font-bold tracking-[0.02em] text-[var(--ink)]">{m.name}</span>
                        <span className="font-mono block truncate text-[10.5px] text-[var(--faint)]">{m.prompt}</span>
                      </span>
                      <span className="font-mono hidden w-32 text-right text-[10.5px] uppercase tracking-[0.1em] text-[var(--faint)] lg:block">
                        {m.template.split('_').join(' ')}
                      </span>
                      <span className="font-mono hidden w-20 text-right text-[10.5px] text-[var(--dim)] sm:block">
                        {dur !== 0 ? formatDuration(dur) : formatRelative(m.startedAt)}
                      </span>
                      <span className="font-mono w-16 text-right text-[10.5px] text-[var(--dim)]">{m.totalTokens} tok</span>
                      <span className="font-mono w-24 text-right text-[10.5px] uppercase tracking-[0.12em]" style={{ color }}>
                        {m.status}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void share(m.id)}
                      aria-label="Copy share link"
                      title="Copy share link"
                      className="btn-icon !h-7 !w-7 shrink-0 !border-0 !bg-transparent"
                    >
                      <ShareNetwork size={13} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => void del(m.id)}
                      disabled={busyId === m.id}
                      aria-label="Delete mission"
                      title="Delete mission"
                      className="btn-icon !h-7 !w-7 shrink-0 !border-0 !bg-transparent hover:!text-[var(--bad)]"
                    >
                      <Trash size={13} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}