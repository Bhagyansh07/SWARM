'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { THEME_STORAGE_KEY } from './theme-script';

export type Theme = 'light' | 'dark' | 'system';
export type Resolved = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolved: Resolved;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemResolved(): Resolved {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readStored(): Theme {
  if (typeof window === 'undefined') return 'system';
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

function apply(resolved: Resolved) {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<Resolved>('dark');

  // Sync initial state from storage + live-resolve the current theme.
  useEffect(() => {
    const stored = readStored();
    setThemeState(stored);
    const next = stored === 'system' ? systemResolved() : stored;
    setResolved(next);
    apply(next);
  }, []);

  // Follow the OS when in system mode.
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      const next: Resolved = mq.matches ? 'light' : 'dark';
      setResolved(next);
      apply(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — session-only */
    }
    const r = next === 'system' ? systemResolved() : next;
    setResolved(r);
    apply(r);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setTheme]);

  const value = useMemo(() => ({ theme, resolved, setTheme, toggle }), [theme, resolved, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback so isolated components (tests, storybook) never explode.
    return {
      theme: 'system',
      resolved: 'dark',
      setTheme: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}
