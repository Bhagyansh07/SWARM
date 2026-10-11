'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretDown, CaretUp, RocketLaunch } from '@phosphor-icons/react/dist/ssr';
import { TEMPLATES, type TemplateDef } from '@/lib/types';
import { api } from '@/lib/api';
import { Button, FieldLabel, Input, Spinner, StatusDot, Textarea } from '@/components/ui';

const MAX_PROMPT = 600;

const SAMPLES: Record<string, string> = {
  deep_research: 'edge AI chips in 2026 — key players, open problems, likely next moves',
  product_review: 'my local bookstore marketplace app — architecture, failure modes, first fixes',
  startup_validation: 'a subscription box that curates indie board games',
  code_review: 'an Express API that handles webhooks and file uploads — correctness and security',
};

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
  const [showAll, setShowAll] = useState(false);

  const active = TEMPLATES.find((t) => t.key === template) ?? TEMPLATES[0];

  const pick = (t: TemplateDef) => {
    setTemplate(t.key);
    setCustom(false);
    setPrompt(t.defaultPrompt);
    setTopic(SAMPLES[t.key] ?? '');
    setError(null);
  };

  const launch = async () => {
    if (busy) return;
    const finalPrompt = (custom ? prompt : fillPrompt(active, topic.trim() || 'this idea')).trim();
    if (finalPrompt.length < 10) {
      setError('Give the swarm a real brief — at least a sentence.');
      return;
    }
    if (finalPrompt.length > MAX_PROMPT) {
      setError(`Brief is too long. Keep it under ${MAX_PROMPT} characters.`);
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

  const visible = showAll ? TEMPLATES : TEMPLATES.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-1.5 sm:grid-cols-3">
        {visible.map((t, i) => {
          const on = t.key === template;
          return (
            <button key={t.key} onClick={() => pick(t)} className={`patch-row flex flex-col gap-1 px-4 py-2.5 ${on ? 'active' : ''}`} aria-pressed={on}>
              <span className="flex items-center gap-2">
                <span className="rack-index">P.{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display truncate text-[12.5px] font-bold uppercase tracking-[0.1em]">
                  <span className="patch-name">{t.title}</span>
                </span>
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--dim)]">{chain(t)}</span>
            </button>
          );
        })}
      </div>
      {TEMPLATES.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="ghost !inline-flex self-end px-2.5 py-1 !text-[10px]"
          aria-expanded={showAll}
        >
          {showAll ? (
            <>
              <CaretUp size={11} aria-hidden /> fewer presets
            </>
          ) : (
            <>
              <CaretDown size={11} aria-hidden /> {TEMPLATES.length - visible.length} more presets
            </>
          )}
        </button>
      )}

      {!custom && (
        <div>
          <FieldLabel id="topic" hint={topic ? `${topic.length} chars` : undefined}>
            Subject
          </FieldLabel>
          <div className="relative">
            <Input
              id="topic"
              value={topic}
              placeholder={SAMPLES[active.key]}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void launch();
              }}
              maxLength={MAX_PROMPT}
              aria-describedby="topic-hint"
            />
          </div>
          <p id="topic-hint" className="font-mono m-0 mt-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
            one subject line — the swarm fills the rest of the brief
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-3">
          <FieldLabel id="prompt" hint={`${(custom ? prompt : fillPrompt(active, topic.trim() || 'this idea')).length}/${MAX_PROMPT}`}>
            Mission brief
          </FieldLabel>
          <button onClick={() => setCustom((c) => !c)} className="ghost px-2 py-1 text-[10px]">
            {custom ? 'use template prompt' : 'write my own'}
          </button>
        </div>
        <Textarea
          id="prompt"
          rows={3}
          value={custom ? prompt : fillPrompt(active, topic.trim() || 'this idea')}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={MAX_PROMPT}
        />
      </div>

      {error && (
        <p className="font-mono m-0 border-l-2 border-[var(--bad)] px-3 py-1.5 text-[12px] text-[var(--bad)]" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-3">
        <span className="font-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
          <StatusDot color="var(--ok)" live />
          4 agents · live link
        </span>
        <Button onClick={() => void launch()} disabled={busy} className="min-w-[220px]">
          {busy ? (
            <>
              <Spinner size={14} />
              Deploying
            </>
          ) : (
            <>
              <RocketLaunch size={15} weight="bold" aria-hidden />
              {active.cta}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}