'use client';

import { Monitor, Moon, Sun } from '@phosphor-icons/react/dist/ssr';
import { useTheme, type Theme } from './theme-provider';

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

/** Three-way appearance control: Light / System / Dark. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`segmented ${className}`}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-selected={theme === value}
          title={`${label} theme`}
          onClick={() => setTheme(value)}
          className="!px-2 !py-1.5"
        >
          <Icon size={14} weight={theme === value ? 'bold' : 'regular'} aria-hidden />
          <span className="sr-only">{label} theme</span>
        </button>
      ))}
    </div>
  );
}
