'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { List, MagnifyingGlass, X } from '@phosphor-icons/react/dist/ssr';
import { GlyphHub } from '../glyphs';
import { StatusDot, Kbd } from '../ui';
import { CommandPalette } from '../ui/command-palette';
import { ThemeToggle } from '../theme/theme-toggle';

interface Health {
  status: string;
  provider: string;
  model: string;
}

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/builder', label: 'Builder' },
  { href: '/history', label: 'Run library' },
  { href: '/eval', label: 'Benchmark' },
];

export function Topbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<Health | null>(null);
  const [down, setDown] = useState(true);
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);

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

  // Global command palette hotkey: Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-[var(--z-topbar)] border-b border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_86%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-2.5">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-[var(--ink)] no-underline" aria-label="SWARM home">
            <GlyphHub width={17} height={17} className="text-[var(--signal)]" />
            <span className="font-display text-[14px] font-bold tracking-[0.16em] sm:text-[15px]">SWARM</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`no-underline ${active(n.href) ? 'bg-[var(--signal-dim)] text-[var(--signal)]' : 'text-[var(--dim)] hover:text-[var(--signal)]'}`}
            >
              <span className="font-mono block px-2.5 py-1.5 text-[11px] uppercase tracking-[0.14em]">{n.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="hidden items-center gap-2 border border-[var(--line-strong)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--faint)] transition-colors hover:border-[var(--signal)] hover:text-[var(--signal)] sm:flex"
            aria-haspopup="dialog"
            aria-label="Open command palette"
          >
            <MagnifyingGlass size={13} aria-hidden />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">Jump to</span>
            <Kbd>Ctrl K</Kbd>
          </button>

          <ThemeToggle className="hidden sm:inline-flex" />

          <span className="hidden items-center gap-2 border border-[var(--line)] bg-[var(--field)] px-2.5 py-1.5 lg:flex" title={down ? 'API unreachable' : `API ${health?.status ?? 'ok'} · ${health?.model ?? ''}`}>
            <StatusDot color={down ? 'var(--bad)' : 'var(--ok)'} live={!down} />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--dim)]">
              {down ? 'link down' : (health?.model ?? '—').split('/').pop()}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            className="btn-icon md:hidden"
            aria-expanded={menu}
            aria-label={menu ? 'Close menu' : 'Open menu'}
          >
            {menu ? <X size={16} aria-hidden /> : <List size={16} aria-hidden />}
          </button>
        </div>
      </div>

      {menu && (
        <nav className="border-t border-[var(--line)] bg-[var(--paper-2)] px-5 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`font-mono px-2.5 py-2 text-[11.5px] uppercase tracking-[0.14em] no-underline ${active(n.href) ? 'bg-[var(--signal-dim)] text-[var(--signal)]' : 'text-[var(--dim)]'}`}
              >
                {n.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono flex items-center gap-2 px-2.5 text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
                <StatusDot color={down ? 'var(--bad)' : 'var(--ok)'} live={!down} />
                {down ? 'API down' : 'API live'}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </header>
  );
}