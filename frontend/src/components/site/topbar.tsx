'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { List, MagnifyingGlass, RocketLaunch, X } from '@phosphor-icons/react/dist/ssr';
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
  { href: '/builder', label: 'Workflow Builder' },
  { href: '/history', label: 'Run Library' },
  { href: '/eval', label: 'Benchmark Rig' },
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
    <>
      <header className="sticky top-0 z-50 w-full pointer-events-none">
        {/* Seamless frosted blur mask that completely dissolves scrolling content under the navbar */}
        <div className="absolute inset-x-0 top-0 h-24 bg-[var(--paper)]/85 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_65%,transparent)] pointer-events-none" />
        
        <div className="relative mx-auto w-full max-w-[1180px] px-4 pt-3 pointer-events-auto">
          <div className="glass-bezel-outer !rounded-full !p-1 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.35)]">
            <div className="glass-bezel-inner !rounded-full flex items-center justify-between px-4 py-2">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Link href="/" className="group flex items-center gap-2.5 text-[var(--ink)] no-underline outline-none" aria-label="SWARM home">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--paper-3)] border border-[var(--line-strong)] text-[var(--ink)] transition-all group-hover:border-[var(--ink)] group-hover:scale-105 shadow-xs">
                    {/* Custom modern kinetic nexus logo */}
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--ink)] transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" className="fill-[var(--ink)]/20" />
                      <circle cx="5" cy="5" r="2" />
                      <circle cx="19" cy="5" r="2" />
                      <circle cx="5" cy="19" r="2" />
                      <circle cx="19" cy="19" r="2" />
                      <path d="M10 10L6.5 6.5M14 10l3.5-3.5M10 14l-3.5 3.5M14 14l3.5 3.5" strokeOpacity="0.5" />
                    </svg>
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-[14.5px] font-bold tracking-tight text-[var(--ink)]">SWARM</span>
                    <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-[var(--faint)] -mt-0.5">Platform</span>
                  </div>
                </Link>
              </div>

              {/* Primary Navigation */}
              <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
                {NAV.map((n) => {
                  const isSelected = active(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all no-underline outline-none ${
                        isSelected
                          ? 'bg-[var(--paper-3)] text-[var(--ink)] font-semibold shadow-xs border border-[var(--line-strong)]'
                          : 'text-[var(--dim)] hover:text-[var(--ink)] hover:bg-[var(--paper-3)]/60'
                      }`}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPalette(true)}
                  className="hidden items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-[var(--dim)] transition-all hover:text-[var(--ink)] sm:flex cursor-pointer shadow-xs"
                  aria-haspopup="dialog"
                  aria-label="Open command palette"
                >
                  <MagnifyingGlass size={13.5} weight="bold" className="text-[var(--ink)] opacity-70" aria-hidden />
                  <span className="text-[12px] font-medium">Search</span>
                  <Kbd>⌘K</Kbd>
                </button>

                {/* Clean Day / Night Toggle */}
                <ThemeToggle />

            {/* Primary Action Button */}
            <Link
              href="/#launcher"
              className="hidden items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--paper)] transition-all hover:opacity-90 active:scale-[0.98] sm:inline-flex shadow-xs no-underline"
            >
              <span>Deploy</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              className="btn-icon md:hidden"
              aria-expanded={menu}
              aria-label={menu ? 'Close menu' : 'Open menu'}
            >
              {menu ? <X size={18} aria-hidden /> : <List size={18} aria-hidden />}
            </button>
          </div>
        </div>
      </div>

        {/* Mobile Dropdown Menu */}
        {menu && (
          <nav className="mt-2 rounded-2xl border border-[var(--line)] bg-[var(--paper-2)]/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1.5">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-xl px-4 py-2.5 text-[14px] font-medium transition-all ${
                    active(n.href)
                      ? 'bg-[var(--signal-dim)] text-[var(--signal)]'
                      : 'text-[var(--dim)] hover:bg-white/[0.04] hover:text-[var(--ink)]'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
                <span className="flex items-center gap-2 font-mono text-[11px] text-[var(--dim)]">
                  <StatusDot color={down ? 'var(--bad)' : 'var(--ok)'} live={!down} />
                  {down ? 'Cluster Offline' : 'Neural Cluster Active'}
                </span>
                <ThemeToggle />
              </div>
            </div>
          </nav>
        )}
        </div>
      </header>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}