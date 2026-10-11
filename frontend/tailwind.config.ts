import type { Config } from 'tailwindcss';

/**
 * Colors are wired to the CSS custom properties declared in globals.css so a
 * single [data-theme] switch repaints the whole app. Nothing here hard-codes a
 * color value — that is the point.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        paper2: 'var(--paper-2)',
        paper3: 'var(--paper-3)',
        paper4: 'var(--paper-4)',
        line: 'var(--line)',
        line2: 'var(--line-strong)',
        ink: 'var(--ink)',
        dim: 'var(--dim)',
        faint: 'var(--faint)',
        signal: 'var(--signal)',
        signalDim: 'var(--signal-dim)',
        signalLine: 'var(--signal-line)',
        onSignal: 'var(--on-signal)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',
        field: 'var(--field)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'var(--line)',
      },
      backgroundImage: {
        grid: 'var(--grid)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
      boxShadow: {
        panel: 'var(--shadow)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        led: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        cursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.45s var(--ease) both',
        led: 'led 1.4s step-end infinite',
        cursor: 'cursor 0.9s step-end infinite',
        shimmer: 'shimmer 1.4s var(--ease) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
