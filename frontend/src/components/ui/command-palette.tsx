'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CaretRight,
  FileCode,
  GitBranch,
  House,
  MagnifyingGlass,
  Monitor,
  Moon,
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

  // Reset query each time the palette opens and shift focus in.
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Load recent missions (cheap enough; used for quick jump).
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
    const order: Theme[] = ['light', 'system', 'dark'];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  }, [theme, setTheme]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (...keys: string[]) => !q || keys.join(' ').toLowerCase().includes(q);

    const base: Item[] = [
      {
        id: 'home',
        label: 'Return to overview',
        hint: '/',
        icon: <House size={15} aria-hidden />,
        run: () => router.push('/'),
      },
      {
        id: 'builder',
        label: 'Compose a mission',
        hint: '/builder',
        icon: <FileCode size={15} aria-hidden />,
        run: () => router.push('/builder'),
      },
      {
        id: 'history',
        label: 'Open the run library',
        hint: '/history',
        icon: <GitBranch size={15} aria-hidden />,
        run: () => router.push('/history'),
      },
      {
        id: 'theme',
        label: `Switch appearance (now ${theme})`,
        hint: 'T',
        icon: theme === 'light' ? <Sun size={15} aria-hidden /> : theme === 'dark' ? <Moon size={15} aria-hidden /> : <Monitor size={15} aria-hidden />,
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
        hint: 'mission',
        icon: <CaretRight size={15} aria-hidden />,
        run: () => router.push(`/mission/${m.id}`),
      }));

    const all = [...base, ...missionItems];
    return all.filter((i) => matches(i.label, i.hint ?? '', 'mission')).length === all.length
      ? all
      : [...base.filter((i) => matches(i.label, i.hint ?? '')), ...missionItems];
  }, [query, missions, router, theme, cycleTheme, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-cmd-index="${cursor}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  // Global Esc + Cmd/Ctrl+K handling lives in the Topbar; here we only tie to
  // the open prop and window key events while open.
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
      className="fixed inset-0 z-[var(--z-overlay)] flex items-start justify-center bg-[var(--overlay)] px-4 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="panel w-full max-w-[560px] overflow-hidden shadow-[var(--shadow)] fade-up">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <MagnifyingGlass size={16} className="text-[var(--faint)]" aria-hidden />
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
            placeholder="Type a command or search missions…"
            className="flex-1 bg-transparent text-[14.5px] text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={items[cursor]?.id}
          />
          <Kbd>ESC</Kbd>
        </div>

        <div
          ref={listRef}
          id="cmd-list"
          role="listbox"
          className="max-h-[46vh] overflow-y-auto py-2"
        >
          {items.length === 0 && (
            <p className="flex items-center gap-2 px-4 py-6 text-[12.5px] text-[var(--faint)]">
              <Warning size={14} aria-hidden />
              Nothing matches “{query}”. Try a mission name or a route.
            </p>
          )}
          {items.map((item, i) => (
            <button
              key={item.id}
              role="option"
              aria-selected={i === cursor}
              data-cmd-index={i}
              onMouseEnter={() => setCursor(i)}
              onClick={() => run(item)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${i === cursor ? 'bg-[var(--signal-dim)]' : ''}`}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--line)] text-[var(--dim)]"
                style={i === cursor ? { borderColor: 'var(--signal)', color: 'var(--signal)' } : undefined}
              >
                {item.icon}
              </span>
              <span className="flex-1 truncate text-[13.5px] text-[var(--ink)]">{item.label}</span>
              {item.hint && (
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--faint)]">{item.hint}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2">
          <p className="font-mono m-0 text-[9.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
            ↑ ↓ to move · enter to run
          </p>
          <p className="font-mono m-0 text-[9.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
            {items.length} results
          </p>
        </div>
      </div>
    </div>
  );
}