import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'oklch(0.155 0.004 60)',
        paper2: 'oklch(0.185 0.005 60)',
        paper3: 'oklch(0.225 0.006 60)',
        line: 'oklch(0.3 0.006 60 / 0.6)',
        line2: 'oklch(0.42 0.008 60)',
        ink: 'oklch(0.9 0.005 60)',
        dim: 'oklch(0.7 0.006 60)',
        faint: 'oklch(0.52 0.006 60)',
        signal: 'oklch(0.72 0.185 45)',
        signalDim: 'oklch(0.72 0.185 45 / 0.16)',
        ok: 'oklch(0.78 0.12 150)',
        warn: 'oklch(0.8 0.11 85)',
        bad: 'oklch(0.66 0.16 25)',
        field: 'oklch(0.13 0.004 60)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'oklch(0.3 0.006 60 / 0.6)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, oklch(0.32 0.006 60 / 0.13) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.32 0.006 60 / 0.13) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
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
      },
      animation: {
        fadeUp: 'fadeUp 0.45s ease-out both',
        led: 'led 1.4s step-end infinite',
        cursor: 'cursor 0.9s step-end infinite',
      },
    },
  },
  plugins: [],
};

export default config;