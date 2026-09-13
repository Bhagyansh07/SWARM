'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AgentMessageDto } from '@/lib/types';

const TONE: Record<string, { label: string; color: string }> = {
  evidence: { label: 'evidence', color: 'var(--signal)' },
  critique: { label: 'attack', color: 'var(--warn)' },
  thought: { label: 'signal', color: 'var(--ok)' },
  synthesis: { label: 'verdict', color: 'var(--signal)' },
  narrative: { label: 'note', color: 'var(--faint)' },
};

export function MissionReplay({ messages }: { messages: AgentMessageDto[] }) {
  const [cursor, setCursor] = useState(Math.max(0, messages.length - 1));
  const [playing, setPlaying] = useState(false);
  const visible = messages.slice(0, cursor + 1);
  const current = visible[visible.length - 1];
  const tone = current ? TONE[current.type] ?? TONE.narrative : TONE.narrative;
  const progress = messages.length ? ((cursor + 1) / messages.length) * 100 : 0;

  useEffect(() => {
    setCursor(Math.max(0, messages.length - 1));
    setPlaying(false);
  }, [messages.length]);

  useEffect(() => {
    if (!playing || cursor >= messages.length - 1) {
      if (cursor >= messages.length - 1) setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setCursor((value) => value + 1), 650);
    return () => window.clearTimeout(timer);
  }, [playing, cursor, messages.length]);

  const timeline = useMemo(() => messages.map((message, index) => ({ message, index })), [messages]);

  if (!messages.length) {
    return <p className="font-mono m-0 px-4 py-14 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">replay will unlock when the first signal arrives...</p>;
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="rack-index m-0">mission replay / causal trace</p>
          <h4 className="font-display m-0 mt-2 text-[19px] font-black uppercase tracking-[0.04em] text-[var(--ink)]">Watch the swarm converge</h4>
        </div>
        <button onClick={() => { setCursor(0); setPlaying(true); }} className="ghost px-3 py-1.5 text-[10px]">restart trace</button>
      </div>

      <div className="border border-[var(--line)] bg-[var(--field)] p-4">
        <div className="flex items-start gap-3">
          <span className="led mt-1.5" aria-hidden style={{ background: tone.color, boxShadow: `0 0 7px ${tone.color}` }} />
          <div className="min-w-0 flex-1">
            <p className="font-mono m-0 text-[10px] uppercase tracking-[0.14em]" style={{ color: tone.color }}>
              {tone.label} / {current?.role ?? 'waiting'} / signal {String(current?.seq ?? 0).padStart(2, '0')}
            </p>
            <p className="m-0 mt-2 text-[15px] leading-relaxed text-[var(--ink)]">{current?.content}</p>
          </div>
        </div>
        <div className="mt-5 h-1 bg-[var(--paper-3)]">
          <span className="block h-full bg-[var(--signal)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button onClick={() => setPlaying((value) => !value)} className="key px-3 py-1.5 text-[10px]">
            {playing ? 'pause trace' : cursor >= messages.length - 1 ? 'play again' : 'play trace'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">{cursor + 1} / {messages.length} signals</span>
        </div>
      </div>

      <div className="overflow-x-auto border-y border-[var(--line)] py-4">
        <div className="flex min-w-[560px] items-center gap-1">
          {timeline.map(({ message, index }) => {
            const messageTone = TONE[message.type] ?? TONE.narrative;
            const active = index === cursor;
            const passed = index <= cursor;
            return (
              <button
                key={message.id}
                onClick={() => { setCursor(index); setPlaying(false); }}
                title={`${messageTone.label}: ${message.role}`}
                className="group flex flex-1 items-center gap-1 bg-transparent p-0"
              >
                <span className={`block h-3 w-3 shrink-0 border transition-transform ${active ? 'scale-125' : ''}`} style={{ borderColor: messageTone.color, background: passed ? messageTone.color : 'transparent' }} />
                {index < messages.length - 1 && <span className="h-px flex-1 bg-[var(--line-strong)]" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="font-mono m-0 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-[var(--faint)]">
        Select any signal to inspect the exact moment the mission changed direction.
      </p>
    </div>
  );
}
