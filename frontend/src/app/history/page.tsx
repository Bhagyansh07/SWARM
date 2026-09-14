'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { StatusDot } from '@/components/ui';
import { formatClock, formatDuration, statusColor } from '@/lib/hooks';
import { api } from '@/lib/api';
import type { MissionSummaryDto } from '@/lib/types';

export default function HistoryPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<MissionSummaryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .listMissions()
      .then((r) => setMissions(r.data.filter((m) => m.id !== 'roster')))
      .catch((e) => setError(e instanceof Error ? e.message : 'load failed'));
  };

  useEffect(load, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this mission and its trace?')) return;
    try {
      await api.deleteMission(id);
      setMissions((m) => (m ? m.filter((x) => x.id !== id) : m));
    } catch {
      setError('delete failed');
    }
  };

  const share = async (id: string) => {
    try {
      const result = await api.shareMission(id);
      await navigator.clipboard.writeText(`${window.location.origin}/shared/${result.data.token}`);
    } catch {
      setError('share failed');
    }
  };

  return (
    <div className="bg-grid flex min-h-screen flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-[960px] flex-1 px-5 pb-16">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4 pt-10">
          <div>
            <p className="rack-index m-0">run archive · last 24h</p>
            <h1 className="font-display m-0 mt-2 text-[26px] font-black uppercase tracking-[0.06em] text-[var(--ink)]">Run library</h1>
          </div>
          <Link href="/" className="ghost px-4 py-2 text-[12px] no-underline">
            Launch new
          </Link>
        </div>

        {error && <p className="font-mono mt-6 border border-[var(--bad)] px-3 py-2 text-[12px] text-[var(--bad)]">{error}</p>}

        {missions === null && <p className="font-mono m-0 py-20 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">loading…</p>}

        {missions !== null && missions.length === 0 && (
          <p className="font-mono m-0 py-20 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">
            no missions yet — the launch pad is waiting.
          </p>
        )}

        {missions !== null && missions.length > 0 && (
          <ul className="mt-6 list-none border border-[var(--line)] bg-[var(--paper-2)]">
            {missions.map((m, i) => {
              const color = statusColor(m.status);
              const dur = m.completedAt && m.status === 'complete' ? new Date(m.completedAt).getTime() - new Date(m.startedAt).getTime() : null;
              return (
                <li key={m.id} className="group flex items-center gap-3 border-b border-[var(--line)] px-3 transition-colors last:border-0 hover:bg-[var(--paper-3)]">
                  <span className="rack-index w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <button onClick={() => router.push(`/mission/${m.id}`)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 border-0 bg-transparent p-0 py-3 text-left">
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
                    <span className="font-mono hidden w-20 text-right text-[10.5px] text-[var(--dim)] sm:block">{dur !== null ? formatDuration(dur) : formatClock(m.startedAt)}</span>
                    <span className="font-mono w-16 text-right text-[10.5px] text-[var(--dim)]">{m.totalTokens} tok</span>
                    <span className="font-mono hidden w-24 text-right text-[10.5px] text-[var(--dim)] md:block">${m.estCostUsd.toFixed(5)}</span>
                    <span className="font-mono w-24 text-right text-[10.5px] uppercase tracking-[0.12em]" style={{ color }}>
                      {m.status}
                    </span>
                  </button>
                  <button
                    onClick={() => share(m.id)}
                    aria-label="share mission"
                    className="font-mono shrink-0 cursor-pointer border border-transparent bg-transparent px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)] hover:border-[var(--signal)] hover:text-[var(--signal)]"
                  >
                    share
                  </button>
                  <button
                    onClick={() => del(m.id)}
                    aria-label="delete mission"
                    className="font-mono shrink-0 cursor-pointer border border-transparent bg-transparent px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)] hover:border-[var(--bad)] hover:text-[var(--bad)]"
                  >
                    del
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}