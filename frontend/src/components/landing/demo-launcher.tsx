'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES, type TemplateDef } from '@/lib/types';
import { api } from '@/lib/api';
import { Button, FieldLabel, Input, StatusDot, Textarea } from '@/components/ui';

export function fillPrompt(t: TemplateDef, topic: string): string {
  return t.defaultPrompt
    .replace('[topic]', topic)
    .replace('[product]', topic)
    .replace('[idea]', topic);
}

function chain(t: TemplateDef): string {
  const short: Record<string, string> = { researcher: 'RES', analyst: 'ANL', critic: 'CRT', synthesizer: 'SYN' };
  return t.agents.map((a) => short[a] ?? a).join(' → ');
}

export function DemoLauncher() {
  const router = useRouter();
  const [template, setTemplate] = useState<string>(TEMPLATES[0].key);
  const [topic, setTopic] = useState('');
  const [custom, setCustom] = useState(false);
  const [prompt, setPrompt] = useState<string>(TEMPLATES[0].defaultPrompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = TEMPLATES.find((t) => t.key === template) ?? TEMPLATES[0];

  const pick = (t: TemplateDef) => {
    setTemplate(t.key);
    setCustom(false);
    setPrompt(t.defaultPrompt);
    setTopic('');
  };

  const launch = async () => {
    if (busy) return;
    const finalPrompt = (custom ? prompt : fillPrompt(active, topic.trim() || 'this idea')).trim();
    if (finalPrompt.length < 3) {
      setError('give the swarm something to chew on first.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await api.launch({ name: active.title, template: active.key, prompt: finalPrompt });
      router.push(`/mission/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'launch aborted.');
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        {TEMPLATES.map((t, i) => {
          const on = t.key === template;
          return (
            <button key={t.key} onClick={() => pick(t)} className={`patch-row px-4 py-2.5 ${on ? 'active' : ''}`} aria-pressed={on}>
              <span className="rack-index mr-3 align-text-top">P.{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink)]">
                <span className="patch-name">{t.title}</span>
              </span>
              <span className="font-mono float-right text-[9.5px] uppercase tracking-[0.1em] text-[var(--dim)]">{chain(t)}</span>
            </button>
          );
        })}
      </div>

      {!custom && (
        <div>
          <FieldLabel id="topic">Subject</FieldLabel>
          <Input
            id="topic"
            value={topic}
            placeholder="local bookstore marketplace, edge AI chips, the Flite guitar..."
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-3">
          <FieldLabel id="prompt">Mission brief</FieldLabel>
          <button onClick={() => setCustom((c) => !c)} className="ghost px-2 py-1 text-[10px]">
            {custom ? 'use template prompt' : 'write my own'}
          </button>
        </div>
        <Textarea
          id="prompt"
          rows={3}
          value={custom ? prompt : fillPrompt(active, topic.trim() || 'this idea')}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {error && (
        <p className="font-mono m-0 border-l-2 border-[var(--bad)] px-3 py-1.5 text-[12px] text-[var(--bad)]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-3">
        <span className="font-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
          <StatusDot color="var(--ok)" live />
          4 agents · link live
        </span>
        <Button onClick={launch} disabled={busy} className="inline-flex min-w-[200px] items-center justify-center gap-2">
          {busy ? (
            <>
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
              Deploying
            </>
          ) : (
            active.cta
          )}
        </Button>
      </div>
    </div>
  );
}