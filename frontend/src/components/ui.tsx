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
 * Surfaces & Containers
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
      className={`glass-card relative overflow-hidden rounded-2xl transition-all duration-300 ${
        accent
          ? 'border-[var(--signal-line)] ring-1 ring-white/10 shadow-[0_8px_32px_-4px_var(--signal-dim)]'
          : 'shadow-[var(--shadow)]'
      } ${className}`}
    >
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white/[0.02] px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            {index && (
              <span className="glass-pill font-mono rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--faint)]">
                {index}
              </span>
            )}
            <h3 className="font-display m-0 text-[13px] font-semibold tracking-tight text-[var(--ink)]">
              {title}
            </h3>
          </div>
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
    <div className={`flex flex-col items-center justify-center gap-3.5 px-6 py-16 text-center ${className}`}>
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/[0.02] text-[var(--faint)] shadow-inner">
          {icon}
        </div>
      ) : null}
      <p className="font-display m-0 text-[14px] font-semibold text-[var(--ink)]">
        {title}
      </p>
      {body && <p className="m-0 max-w-[42ch] text-[13px] leading-relaxed text-[var(--dim)]">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Status / Labels / Badges
 * ------------------------------------------------------------------------ */

export type BadgeTone = 'signal' | 'ok' | 'warn' | 'bad' | 'neutral' | 'info';

export function Badge({ tone = 'signal', children }: { tone?: BadgeTone; children: ReactNode }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    signal: { bg: 'bg-[var(--signal-dim)]', text: 'text-[var(--signal)]', border: 'border-[var(--signal-line)]' },
    ok: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    warn: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    bad: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    info: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
    neutral: { bg: 'bg-white/[0.04]', text: 'text-[var(--dim)]', border: 'border-white/[0.08]' },
  };
  const s = styles[tone] ?? styles.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${s.bg} ${s.text} ${s.border}`}>
      {children}
    </span>
  );
}

export function StatusDot({ color, live = false }: { color: string; live?: boolean }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={`inline-block h-2 w-2 rounded-full ${live ? 'led-live' : ''}`}
        aria-hidden
        style={{ backgroundColor: color }}
      />
    </span>
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
    sm: 'px-3.5 py-1.5 text-[12px] gap-1.5 rounded-full',
    md: 'px-5 py-2.5 text-[13px] gap-2 rounded-full',
    lg: 'px-6 py-3 text-[14px] gap-2.5 rounded-full',
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
 * Form Fields & Inputs
 * ------------------------------------------------------------------------ */

export function FieldLabel({ children, id, hint }: { children: ReactNode; id?: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="font-display block text-[12px] font-medium tracking-wide text-[var(--ink)]">
        {children}
      </label>
      {hint && <span className="font-mono text-[10px] text-[var(--faint)]">{hint}</span>}
    </div>
  );
}

export function Textarea({ id, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      className={`field w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--field)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--faint)] transition-all focus:border-[var(--signal)] focus:ring-2 focus:ring-[var(--signal-dim)] ${className}`}
      {...props}
    />
  );
}

export function Input({ id, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      className={`field w-full rounded-xl border border-[var(--line)] bg-[var(--field)] px-4 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--faint)] transition-all focus:border-[var(--signal)] focus:ring-2 focus:ring-[var(--signal-dim)] ${className}`}
      {...props}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Telemetry Readouts & Stats
 * ------------------------------------------------------------------------ */

export function Bar({ value, max = 1, color = 'var(--signal)', height = 4 }: { value: number; max?: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <span className="block w-full overflow-hidden rounded-full bg-white/[0.06]" style={{ height }}>
      <span
        className="block h-full w-full rounded-full"
        style={{
          transform: `scaleX(${pct})`,
          transformOrigin: 'left',
          background: color,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </span>
  );
}

export function Step({ label, value, tone = 'faint' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-[13px]">
      <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--faint)]">{label}</span>
      <span className="font-mono font-medium" style={{ color: tone === 'faint' ? 'var(--dim)' : tone }}>
        {value}
      </span>
    </div>
  );
}

export function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)]/50 py-2.5 text-[13px] last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--faint)]">{label}</span>
      <span className="font-mono font-medium text-[var(--ink)] break-all">{value}</span>
    </div>
  );
}

export function Stat({ label, value, accent = false }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/[0.015] p-4 backdrop-blur-md transition-all hover:border-[var(--line-strong)]">
      <p className="font-mono m-0 text-[10px] font-medium uppercase tracking-wider text-[var(--faint)]">{label}</p>
      <p
        className="font-mono m-0 mt-1.5 truncate text-[18px] font-semibold tabular-nums"
        style={{ color: accent ? 'var(--signal)' : 'var(--ink)' }}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Agent Identity Avatars
 * ------------------------------------------------------------------------ */

export function AgentAvatar({ role, glyph, size = 36, dim = false }: { role: AgentRole; glyph?: string; size?: number; dim?: boolean }) {
  const G = Glyph[(glyph as keyof typeof Glyph) ?? role];
  const roleColors: Record<AgentRole, { bg: string; text: string; ring: string }> = {
    researcher: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/20' },
    analyst: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', ring: 'ring-indigo-500/20' },
    critic: { bg: 'bg-amber-500/10', text: 'text-amber-500', ring: 'ring-amber-500/20' },
    synthesizer: { bg: 'bg-[var(--paper-3)]', text: 'text-[var(--ink)]', ring: 'ring-[var(--line)]' },
    orchestrator: { bg: 'bg-[var(--paper-3)]', text: 'text-[var(--ink)]', ring: 'ring-[var(--line)]' },
  };
  const color = roleColors[role] ?? roleColors.orchestrator;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 ring-1 ${color.bg} ${dim ? 'opacity-40' : color.ring} transition-all`}
      style={{ width: size, height: size, color: dim ? 'var(--faint)' : undefined }}
      title={role}
    >
      {G ? <G width={size * 0.52} height={size * 0.52} className={dim ? '' : color.text} /> : null}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Misc Utilities
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
        className="pointer-events-none absolute bottom-full left-1/2 z-[var(--z-overlay)] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--line-strong)] bg-[var(--paper-3)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink)] opacity-0 shadow-[var(--shadow-lg)] transition-all group-hover:opacity-100 group-focus-within:opacity-100 sm:block"
      >
        {label}
      </span>
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}