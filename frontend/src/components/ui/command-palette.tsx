'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CaretRight,
  ChartBar,
  Cpu,
  FileCode,
  GitBranch,
  House,
  MagnifyingGlass,
  Moon,
  RocketLaunch,
  Sun,
  Warning,
} from '@phosphor-icons/react/dist/ssr';
import { api } from '@/lib/api';
import { useTheme, type Theme } from '@/components/theme/theme-provider';
import { Kbd } from '@/components/ui';
import type { MissionSummaryDto } from '@/lib/types';

interface Item {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [missions, setMissions] = useState<MissionSummaryDto[]>([]);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    api
      .listMissions()
      .then((r) => {
        if (alive) setMissions(r.data.filter((m) => m.id !== 'roster').slice(0, 5));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  const cycleTheme = useCallback(() => {
    const order: Theme[] = ['light', 'dark'];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  }, [theme, setTheme]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (...keys: string[]) => !q || keys.join(' ').toLowerCase().includes(q);

    const base: Item[] = [
      {
        id: 'home',
        label: 'Platform Overview & Dispatch',
        hint: 'Overview',
        icon: <House size={16} />,
        run: () => router.push('/'),
      },
      {
        id: 'builder',
        label: 'Visual Workflow Orchestration Canvas',
        hint: 'Builder',
        icon: <Cpu size={16} />,
        run: () => router.push('/builder'),
      },
      {
        id: 'history',
        label: 'Mission Execution Library & Archive',
        hint: 'Runs',
        icon: <GitBranch size={16} />,
        run: () => router.push('/history'),
      },
      {
        id: 'eval',
        label: 'AI Methodology & Benchmark Rig',
        hint: 'Eval',
        icon: <ChartBar size={16} />,
        run: () => router.push('/eval'),
      },
      {
        id: 'theme',
        label: `Toggle Color Theme (Current: ${theme})`,
        hint: 'Theme',
        icon: theme === 'light' ? <Sun size={16} /> : <Moon size={16} />,
        run: () => {
          cycleTheme();
          onClose();
        },
      },
    ].filter((i) => matches(i.label, i.hint ?? ''));

    const missionItems: Item[] = missions
      .filter((m) => matches(m.name, m.template ?? '', m.id))
      .map((m) => ({
        id: `mission-${m.id}`,
        label: m.name,
        hint: 'Mission Run',
        icon: <RocketLaunch size={16} className="text-[var(--dim)]" />,
        run: () => router.push(`/mission/${m.id}`),
      }));

    return [...base, ...missionItems];
  }, [query, missions, router, theme, cycleTheme, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-cmd-index="${cursor}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const run = (item: Item | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 dark:bg-black/75 backdrop-blur-2xl px-4 pt-[10vh] transition-all"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Volumetric ambient backlight halo behind the modal */}
      <div className="relative w-full max-w-[620px] fade-up">
        <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-white/20 via-white/5 to-transparent dark:from-white/12 dark:via-white/5 dark:to-transparent opacity-85 blur-2xl pointer-events-none" />

        <div className="relative glass-bezel-outer shadow-[0_30px_80px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.22)]">
          <div className="glass-bezel-inner overflow-hidden border border-[var(--line-strong)]">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3.5 border-b border-[var(--line)] bg-[var(--paper-2)]/60 px-5 py-4 backdrop-blur-xl">
              <MagnifyingGlass size={19} className="text-[var(--ink)] opacity-75 shrink-0" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setCursor((c) => Math.min(c + 1, items.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setCursor((c) => Math.max(c - 1, 0));
                  } else if (e.key === 'Enter') {
                    run(items[cursor]);
                  }
                }}
                placeholder="Search actions, workflows, benchmarks, or past runs..."
                className="flex-1 bg-transparent text-[15px] font-medium text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-activedescendant={items[cursor]?.id}
              />
              <span className="glass-pill rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-[var(--faint)] uppercase tracking-wider">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              id="cmd-list"
              role="listbox"
              className="max-h-[46vh] overflow-y-auto p-2.5 space-y-1.5"
            >
              {items.length === 0 && (
                <div className="flex items-center gap-2.5 p-6 text-[13px] text-[var(--dim)]">
                  <Warning size={16} />
                  <span>No matching commands found for &ldquo;{query}&rdquo;.</span>
                </div>
              )}
              {items.map((item, i) => {
                const isSelected = i === cursor;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-cmd-index={i}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => run(item)}
                    className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--ink)] text-[var(--paper)] shadow-md scale-[1.01]'
                        : 'text-[var(--dim)] hover:bg-[var(--paper-3)]/60 hover:text-[var(--ink)]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
                        isSelected
                          ? 'border-transparent bg-[var(--paper)] text-[var(--ink)] shadow-xs'
                          : 'glass-pill text-[var(--dim)]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className={`flex-1 truncate text-[14px] ${isSelected ? 'font-semibold text-[var(--paper)]' : 'font-medium text-[var(--ink)]'}`}>
                      {item.label}
                    </span>
                    {item.hint && (
                      <span
                        className={`font-mono rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                          isSelected
                            ? 'bg-[var(--paper)]/20 text-[var(--paper)] font-semibold'
                            : 'glass-pill text-[var(--faint)]'
                        }`}
                      >
                        {item.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer shortcuts */}
            <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--paper-3)]/40 px-5 py-2.5 backdrop-blur-md">
              <p className="font-mono m-0 text-[10.5px] uppercase tracking-wider text-[var(--faint)]">
                ↑ ↓ navigate · ↵ select · ESC close
              </p>
              <p className="font-mono m-0 text-[10.5px] uppercase tracking-wider text-[var(--faint)]">
                {items.length} commands available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}