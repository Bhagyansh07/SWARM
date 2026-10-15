'use client';

import { Moon, Sun } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from './theme-provider';
import { useEffect, useState } from 'react';

/** Clean Day / Night toggle (Sun & Moon only, zero hydration mismatch) */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolved === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      data-testid="theme-toggle"
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper-3)]/80 text-[var(--dim)] transition-all hover:border-[var(--line-strong)] hover:text-[var(--ink)] active:scale-95 cursor-pointer ${className}`}
    >
      {mounted ? (
        isDark ? (
          <Sun size={16} weight="regular" aria-hidden />
        ) : (
          <Moon size={16} weight="regular" aria-hidden />
        )
      ) : (
        <span className="h-3.5 w-3.5 rounded-full bg-[var(--line)] opacity-40" />
      )}
    </button>
  );
}
