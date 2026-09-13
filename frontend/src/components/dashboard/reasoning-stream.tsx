'use client';

import { useEffect, useRef } from 'react';
import { useState } from 'react';
import type { AgentMessageDto } from '@/lib/types';

const GEN: Record<string, { tag: string; color: string }> = {
  critique: { tag: 'ATTACK', color: 'var(--warn)' },
  evidence: { tag: 'EVIDENCE', color: 'var(--signal)' },
  thought: { tag: 'SIGNAL', color: 'var(--ok)' },
  synthesis: { tag: 'VERDICT', color: 'var(--signal)' },
  narrative: { tag: 'NOTE', color: 'var(--faint)' },
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

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [messages, chunks]);

  const activeChunks = Object.entries(chunks).filter(([, c]) => c.trim().length > 0);
  const filteredMessages = lens === 'all' ? messages : messages.filter((message) => message.type === lens);
  const lensOptions = [
    ['all', 'all signals', messages.length],
    ['evidence', 'evidence', messages.filter((message) => message.type === 'evidence').length],
    ['critique', 'attacks', messages.filter((message) => message.type === 'critique').length],
    ['synthesis', 'verdicts', messages.filter((message) => message.type === 'synthesis').length],
  ] as const;

  return (
    <div ref={boxRef} className="h-[460px] overflow-y-auto">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-[var(--line)] bg-[var(--paper-2)] px-3 py-2">
        {lensOptions.map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setLens(key)}
            className={`font-mono cursor-pointer border px-2 py-1 text-[9px] uppercase tracking-[0.1em] transition-colors ${lens === key ? 'border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]' : 'border-transparent text-[var(--faint)] hover:border-[var(--line-strong)] hover:text-[var(--dim)]'}`}
          >
            {label} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {filteredMessages.map((m, i) => {
        const gen = GEN[m.type] ?? { tag: m.type, color: 'var(--dim)' };
        return (
          <article key={m.id} className="flex gap-3 border-b border-[var(--line)] px-4 py-2.5">
            <span className="font-mono pt-0.5 text-[10px] text-[var(--faint)]">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              <p className="font-mono m-0 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
                <span style={{ color: gen.color }}>{gen.tag}</span>
                <span className="mx-2 opacity-40">/</span>
                {m.role}
              </p>
              <p className="m-0 pt-0.5 text-[13.5px] leading-relaxed text-[var(--ink)]">{m.content}</p>
            </div>
          </article>
        );
      })}

      {activeChunks.map(([agentId, chunk]) => (
        <article key={`chunk-${agentId}`} className="flex gap-3 border-b border-[var(--line)] bg-[var(--signal-dim)] px-4 py-2.5">
          <span className="font-mono pt-0.5 text-[10px] text-[var(--signal)]">++</span>
          <div className="min-w-0 flex-1">
            <p className="font-mono m-0 text-[10px] uppercase tracking-[0.12em] text-[var(--signal)]">
              live · generating <span className="animate-cursor">▊</span>
            </p>
            <p className="font-mono m-0 pt-0.5 text-[12.5px] leading-relaxed text-[var(--dim)]">{chunk}</p>
          </div>
        </article>
      ))}

      {filteredMessages.length === 0 && activeChunks.length === 0 && status !== 'complete' && (
        <p className="font-mono m-0 px-4 py-16 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
          standing by for mission traffic…
        </p>
      )}
      {filteredMessages.length === 0 && messages.length > 0 && status === 'complete' && (
        <p className="font-mono m-0 px-4 py-16 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
          no {lens} signals in this trace
        </p>
      )}
      {status === 'complete' && messages.length === 0 && (
        <p className="font-mono m-0 px-4 py-16 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--dim)]">
          mission complete · no persisted stream (live-only)
        </p>
      )}
      {status === 'complete' && (
        <p className="flex items-center justify-center gap-2 py-4">
          <span className="led" aria-hidden style={{ background: 'var(--ok)', boxShadow: '0 0 6px var(--ok)' }} />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--faint)]">mission complete</span>
        </p>
      )}
    </div>
  );
}