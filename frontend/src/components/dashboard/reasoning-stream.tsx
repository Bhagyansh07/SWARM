'use client';

import { useEffect, useRef, useState } from 'react';
import type { AgentMessageDto } from '@/lib/types';
import {
  CheckCircle,
  MagnifyingGlass,
  Pulse,
  ShieldWarning,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';

const GEN_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  evidence: {
    label: 'EVIDENCE',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    text: 'text-emerald-400',
    icon: <CheckCircle size={11} weight="fill" />,
  },
  critique: {
    label: 'ATTACK',
    bg: 'bg-amber-500/10 border-amber-500/25',
    text: 'text-amber-400',
    icon: <ShieldWarning size={11} weight="fill" />,
  },
  thought: {
    label: 'SIGNAL',
    bg: 'bg-indigo-500/10 border-indigo-500/25',
    text: 'text-indigo-400',
    icon: <Pulse size={11} weight="bold" />,
  },
  synthesis: {
    label: 'VERDICT',
    bg: 'bg-cyan-500/10 border-cyan-500/25',
    text: 'text-cyan-400',
    icon: <Sparkle size={11} weight="fill" />,
  },
  rebuttal: {
    label: 'REBUTTAL',
    bg: 'bg-sky-500/10 border-sky-500/25',
    text: 'text-sky-400',
    icon: <CheckCircle size={11} weight="bold" />,
  },
  narrative: {
    label: 'NOTE',
    bg: 'bg-white/[0.04] border-white/10',
    text: 'text-slate-400',
    icon: null,
  },
};

export function ReasoningStream({
  messages,
  chunks,
  status,
}: {
  messages: AgentMessageDto[];
  chunks: Record<string, string>;
  status: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<'all' | 'evidence' | 'critique' | 'synthesis'>('all');
  const [needle, setNeedle] = useState('');

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [messages, chunks]);

  const activeChunks = Object.entries(chunks).filter(([, c]) => c.trim().length > 0);
  const filteredMessages = messages.filter((m) => {
    if (lens !== 'all' && m.type !== lens) return false;
    if (!needle.trim()) return true;
    return m.content.toLowerCase().includes(needle.trim().toLowerCase());
  });

  const lensOptions = [
    { key: 'all', label: 'All Signals', count: messages.length },
    { key: 'evidence', label: 'Evidence', count: messages.filter((m) => m.type === 'evidence').length },
    { key: 'critique', label: 'Critiques', count: messages.filter((m) => m.type === 'critique').length },
    { key: 'synthesis', label: 'Verdicts', count: messages.filter((m) => m.type === 'synthesis').length },
  ] as const;

  return (
    <div className="flex flex-col h-[520px]">
      {/* Stream Controls Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-white/[0.015] px-4 py-2.5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {lensOptions.map((opt) => {
            const isSelected = lens === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setLens(opt.key)}
                className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-[var(--faint)] hover:text-[var(--dim)] hover:bg-white/[0.04]'
                }`}
              >
                {opt.label}{' '}
                <span className="opacity-60 font-semibold">({opt.count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[170px]">
          <MagnifyingGlass
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
            aria-hidden
          />
          <input
            value={needle}
            onChange={(e) => setNeedle(e.target.value)}
            placeholder="Search signals..."
            className="field w-full rounded-full py-1 pl-7 pr-3 font-mono text-[11px] text-[var(--ink)] placeholder:text-[var(--faint)] outline-none"
            aria-label="Search messages in stream"
          />
        </div>
      </div>

      {/* Message Feed */}
      <div ref={boxRef} className="flex-1 overflow-y-auto divide-y divide-white/[0.05] p-2">
        {filteredMessages.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-mono text-[12px] uppercase tracking-wider text-[var(--faint)]">
              {messages.length === 0 ? 'Awaiting initial neural dispatch...' : 'No matching signals found.'}
            </p>
          </div>
        )}

        {filteredMessages.map((m, i) => {
          const cfg = GEN_CONFIG[m.type] ?? {
            label: m.type.toUpperCase(),
            bg: 'bg-white/[0.04] border-white/10',
            text: 'text-slate-400',
            icon: null,
          };
          return (
            <article key={m.id} className="flex gap-3.5 p-3.5 rounded-xl transition-colors hover:bg-white/[0.02]">
              <span className="font-mono pt-0.5 text-[10.5px] font-semibold text-[var(--faint)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 font-mono text-[9.5px] font-bold ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>
                  <span className="font-display text-[12px] font-semibold text-[var(--ink)]">
                    {m.role}
                  </span>
                </div>
                <p className="m-0 mt-1.5 text-[13.5px] leading-relaxed text-slate-200">
                  {m.content}
                </p>
              </div>
            </article>
          );
        })}

        {/* Live Chunks Streaming In-Flight */}
        {activeChunks.map(([agentId, chunk]) => (
          <article
            key={`chunk-${agentId}`}
            className="flex gap-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5"
          >
            <span className="font-mono pt-0.5 text-[11px] font-bold text-cyan-400">
              ⚡
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono m-0 text-[10.5px] font-bold uppercase tracking-wider text-cyan-400">
                Live Neural Stream ({agentId}) <span className="animate-pulse">▊</span>
              </p>
              <p className="font-mono m-0 mt-1 text-[13px] leading-relaxed text-cyan-200">
                {chunk}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}