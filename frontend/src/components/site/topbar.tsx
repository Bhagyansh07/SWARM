'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GlyphHub } from '../glyphs';
import { StatusDot } from '../ui';

interface Health {
  status: string;
  provider: string;
  model: string;
}

export function Topbar() {
  const [health, setHealth] = useState<Health | null>(null);
  const [down, setDown] = useState(true);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const ping = async (retryMs: number) => {
      if (!alive) return;
      let took = false;
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const h = (await res.json()) as Health;
        if (alive && !took) {
          setHealth(h);
          setDown(false);
        }
      } catch {
        if (alive && !took) setDown(true);
        if (alive) timer = setTimeout(() => ping(retryMs), retryMs);
      } finally {
        took = true;
      }
    };

    void ping(1500);
    const t = setInterval(() => ping(10000), 10000);
    return () => {
      alive = false;
      clearTimeout(timer);
      clearInterval(t);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_86%,transparent)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-5 px-5 py-2.5">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-[var(--ink)] no-underline">
            <GlyphHub width={17} height={17} className="text-[var(--signal)]" />
            <span className="font-display text-[14px] font-black tracking-[0.28em]">SWARM</span>
          </Link>
          <span className="rack-index hidden sm:inline">orb control · mission deck</span>
        </div>

        <nav className="flex items-center gap-5">
          <Link href="/builder" className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--dim)] no-underline hover:text-[var(--signal)]">
            Builder
          </Link>
          <Link href="/history" className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--dim)] no-underline hover:text-[var(--signal)]">
            Run library
          </Link>
          <span className="hidden items-center gap-2 border border-[var(--line-strong)] bg-[var(--field)] px-2.5 py-1 lg:flex">
            <StatusDot color={down ? 'var(--bad)' : 'var(--ok)'} live={!down} />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--dim)]">
              {down ? 'link down' : `${health?.model ?? '—'}`}
            </span>
          </span>
        </nav>
      </div>
    </header>
  );
}