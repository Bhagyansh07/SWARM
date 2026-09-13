import type { ButtonHTMLAttributes, ReactNode, SVGProps } from 'react';
import { Glyph } from './glyphs';
import type { AgentRole } from '@/lib/types';

export function Panel({ children, className = '', title, accent = false, right, index }: { children: ReactNode; className?: string; title?: string; accent?: boolean; right?: ReactNode; index?: string }) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <header className="panel-head flex items-center justify-between gap-3 px-4 py-2">
          <h3 className="font-display m-0 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
            {index && <span className="rack-index mr-2 align-middle">{index}</span>}
            {title}
          </h3>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone = 'signal', children }: { tone?: 'signal' | 'ok' | 'warn' | 'bad' | 'neutral'; children: ReactNode }) {
  const map: Record<string, string> = {
    signal: 'var(--signal)',
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    bad: 'var(--bad)',
    neutral: 'var(--faint)',
  };
  return (
    <span className="font-mono border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: map[tone], borderColor: `${map[tone]}55` }}>
      {children}
    </span>
  );
}

export function StatusDot({ color, live = false }: { color: string; live?: boolean }) {
  return (
    <span
      className={`led ${live ? 'led-live' : ''}`}
      aria-hidden
      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}

export function Button({ variant = 'solid', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost' }) {
  return <button className={`px-4 py-2 text-[12px] ${variant === 'solid' ? 'key' : 'ghost'} ${className}`} {...props} />;
}

export function AgentAvatar({ role, glyph, size = 34, dim = false }: { role: AgentRole; glyph?: string; size?: number; dim?: boolean }) {
  const G = Glyph[(glyph as keyof typeof Glyph) ?? role];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center border bg-[var(--paper-3)]"
      style={{ width: size, height: size, color: dim ? 'var(--faint)' : 'var(--signal)', borderColor: 'var(--line)' }}
      title={role}
    >
      {G ? <G width={size * 0.58} height={size * 0.58} /> : null}
    </span>
  );
}

export function FieldLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <label htmlFor={id} className="font-display mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--faint)]">
      {children}
    </label>
  );
}

export function Textarea({ id, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      className={`field w-full resize-none px-3 py-2 text-[14px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--faint)] ${className}`}
      {...props}
    />
  );
}

export function Input({ id, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      className={`field w-full px-3 py-2 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--faint)] ${className}`}
      {...props}
    />
  );
}

export function Bar({ value, max = 1, color = 'var(--signal)', height = 5 }: { value: number; max?: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <span className="block w-full overflow-hidden bg-[var(--paper-3)]" style={{ height }}>
      <span
        className="block h-full w-full"
        style={{
          transform: `scaleX(${pct})`,
          transformOrigin: 'left',
          background: color,
          transition: 'transform 0.4s ease-out',
        }}
      />
    </span>
  );
}

export function Step({ label, value, tone = 'faint' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="readout">
      <span className="readout-label">{label}</span>
      <span className="readout-value" style={{ color: tone === 'faint' ? 'var(--dim)' : tone }}>
        {value}
      </span>
    </div>
  );
}

export function Kv({ label, value }: { label: string; value: string }) {
  return (
    <span className="readout border-b border-[var(--line)] px-3 py-1.5 last:border-0">
      <span className="readout-label">{label}</span>
      <span className="readout-value break-all">{value}</span>
    </span>
  );
}

export function InlineSvg({ children, size = 14, ...p }: { children: ReactNode; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="glyph" width={size} height={size} aria-hidden {...p}>
      {children}
    </svg>
  );
}