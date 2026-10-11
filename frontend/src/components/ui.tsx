import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  SVGProps,
} from 'react';
import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { Glyph } from './glyphs';
import type { AgentRole } from '@/lib/types';

/* ---------------------------------------------------------------------------
 * Surfaces
 * ------------------------------------------------------------------------ */

export function Panel({
  children,
  className = '',
  title,
  accent = false,
  right,
  index,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: boolean;
  right?: ReactNode;
  index?: string;
}) {
  return (
    <section
      className={`panel ${accent ? '!border-[var(--signal-line)]' : ''} ${className}`}
    >
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

export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`m-0 border-0 border-t border-[var(--line)] ${className}`} />;
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className = '',
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}>
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center border border-[var(--line)] bg-[var(--paper-3)] text-[var(--faint)]">
          {icon}
        </div>
      ) : null}
      <p className="font-display m-0 text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--dim)]">
        {title}
      </p>
      {body && <p className="m-0 max-w-[36ch] text-[13px] leading-relaxed text-[var(--faint)]">{body}</p>}
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Status / labels
 * ------------------------------------------------------------------------ */

export type BadgeTone = 'signal' | 'ok' | 'warn' | 'bad' | 'neutral' | 'info';

export function Badge({ tone = 'signal', children }: { tone?: BadgeTone; children: ReactNode }) {
  const map: Record<string, string> = {
    signal: 'var(--signal)',
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    bad: 'var(--bad)',
    info: 'var(--dim)',
    neutral: 'var(--faint)',
  };
  const c = map[tone];
  return (
    <span
      className="chip !border-l-2 font-mono !p-0 !px-1.5"
      style={{ color: c, borderLeftColor: c }}
    >
      {children}
    </span>
  );
}

export function StatusDot({ color, live = false }: { color: string; live?: boolean }) {
  return (
    <span
      className={`led ${live ? 'led-live' : ''}`}
      aria-hidden
      style={{ background: color, boxShadow: `inset 0 0 0 1px ${color}66` }}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Buttons
 * ------------------------------------------------------------------------ */

export function Button({
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-[11px] gap-1.5',
    md: 'px-4 py-2 text-[12px] gap-1.5',
    lg: 'px-5 py-2.5 text-[12.5px] gap-2',
  };
  const base = variant === 'icon' ? 'btn-icon' : variant === 'ghost' ? 'ghost' : 'key';
  return <button className={`${base} ${variant !== 'icon' ? sizes[size] : ''} ${className}`} {...props} />;
}

export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return <CircleNotch size={size} className={`spin ${className}`} aria-hidden />;
}

export function LoadingButton({
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Spinner size={14} />}
      {children}
    </Button>
  );
}

/* ---------------------------------------------------------------------------
 * Fields
 * ------------------------------------------------------------------------ */

export function FieldLabel({ children, id, hint }: { children: ReactNode; id?: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="font-display block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--faint)]">
        {children}
      </label>
      {hint && <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--faint)]">{hint}</span>}
    </div>
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

/* ---------------------------------------------------------------------------
 * Telemetry readouts
 * ------------------------------------------------------------------------ */

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

export function Stat({ label, value, accent = false }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_55%,var(--paper-2))] p-3">
      <p className="font-mono m-0 text-[9.5px] uppercase tracking-[0.16em] text-[var(--faint)]">{label}</p>
      <p
        className="font-mono m-0 mt-1 truncate text-[15px] font-medium tabular-nums"
        style={{ color: accent ? 'var(--signal)' : 'var(--ink)' }}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Identity / avatars
 * ------------------------------------------------------------------------ */

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

/* ---------------------------------------------------------------------------
 * Misc
 * ------------------------------------------------------------------------ */

export function InlineSvg({ children, size = 14, ...p }: { children: ReactNode; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="glyph" width={size} height={size} aria-hidden {...p}>
      {children}
    </svg>
  );
}

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-[var(--z-overlay)] mb-1.5 hidden -translate-x-1/2 whitespace-nowrap border border-[var(--line-strong)] bg-[var(--paper-3)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--dim)] opacity-0 shadow-[var(--shadow)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:block"
      >
        {label}
      </span>
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}