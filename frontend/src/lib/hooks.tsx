'use client';

import { useEffect, useRef, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s % 60)}s`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function confidenceColor(c: number): string {
  if (c >= 0.66) return 'var(--ok)';
  if (c >= 0.33) return 'var(--warn)';
  return 'var(--bad)';
}

export function statusColor(status: string): string {
  switch (status) {
    case 'complete':
      return 'var(--ok)';
    case 'running':
    case 'thinking':
    case 'working':
      return 'var(--signal)';
    case 'queued':
      return 'var(--warn)';
    case 'failed':
      return 'var(--bad)';
    default:
      return 'var(--faint)';
  }
}

export function useTypewriter(text: string, speed = 14): string {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    if (!text) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return out;
}

export function useFadeIn<T extends Element>(visible: boolean): React.RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.toggle('fade-up', visible);
  }, [visible]);
  return ref;
}

export function Ellipsis() {
  return <span className="animate-cursor">{String.fromCharCode(9642)}</span>;
}