'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Cpu,
  Lightning,
  MagnifyingGlass,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';
import { TEMPLATES, type TemplateDef } from '@/lib/types';
import { api } from '@/lib/api';
import { Button, FieldLabel, Input, Spinner, StatusDot, Textarea } from '@/components/ui';

const MAX_PROMPT = 600;

const ENTERPRISE_SAMPLES: Record<string, string> = {
  deep_research: 'Next-gen edge neuromorphic silicon — dominant IP holders, thermal bottlenecks, and 2026-2028 adoption curve',
  product_review: 'B2B billing infrastructure microservice — latency spikes under concurrency, single points of failure, and zero-downtime fixes',
  startup_validation: 'Autonomous AI workflow orchestration for Fortune 500 legal compliance — TAM, defensibility, and procurement friction',
  code_review: 'High-throughput Node.js microservice handling streaming webhooks and cryptographic token validation — security and concurrency',
};

const CHIP_SUGGESTIONS: Record<string, string[]> = {
  deep_research: [
    'Semiconductor photonics vs HBM4 memory scaling',
    'AI agent orchestration security primitives',
    'Open-source vs proprietary foundation models in healthcare',
  ],
  product_review: [
    'Distributed Redis caching layer invalidation failures',
    'High-frequency trading settlement race conditions',
    'Multi-tenant database connection pooling memory leaks',
  ],
  startup_validation: [
    'Vertical LLM copilot for architectural CAD validation',
    'Decentralized synthetic training data generation network',
    'Automated enterprise cloud cost optimization agent',
  ],
  code_review: [
    'Express auth middleware JWT replay vulnerability audit',
    'WebSocket connection state race conditions in Node.js',
    'SQL injection mitigation in dynamic query builder',
  ],
};

export function fillPrompt(t: TemplateDef, topic: string): string {
  return t.defaultPrompt
    .replace('[topic]', topic)
    .replace('[product]', topic)
    .replace('[idea]', topic);
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
    setTopic(ENTERPRISE_SAMPLES[t.key] ?? '');
    setError(null);
  };

  const launch = async () => {
    if (busy) return;
    const finalPrompt = (custom ? prompt : fillPrompt(active, topic.trim() || 'this mission brief')).trim();
    if (finalPrompt.length < 8) {
      setError('Please provide a substantive brief (at least 8 characters).');
      return;
    }
    if (finalPrompt.length > MAX_PROMPT) {
      setError(`Brief exceeds maximum length of ${MAX_PROMPT} characters.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await api.launch({
        name: topic.trim() ? topic.trim().slice(0, 48) : active.title,
        template: active.key,
        prompt: finalPrompt,
      });
      router.push(`/mission/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mission dispatch failed. Check connectivity.');
      setBusy(false);
    }
  };

  const icons: Record<string, React.ReactNode> = {
    deep_research: <MagnifyingGlass size={18} className="text-emerald-400" />,
    product_review: <ShieldCheck size={18} className="text-indigo-400" />,
    startup_validation: <Lightning size={18} className="text-amber-400" />,
    code_review: <Cpu size={18} className="text-cyan-400" />,
  };

  const currentChars = (custom ? prompt : fillPrompt(active, topic.trim() || 'this idea')).length;
  const charPct = Math.min(100, Math.round((currentChars / MAX_PROMPT) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Strategy Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-[12px] font-bold uppercase tracking-wider text-[var(--faint)]">
            1. Select Strategy Archetype
          </span>
          <span className="font-mono text-[11px] text-cyan-400 font-medium">
            4-Agent Cross-Examination Enabled
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => {
            const isSelected = t.key === template;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => pick(t)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400/60 bg-cyan-500/[0.08] shadow-[0_0_24px_-4px_rgba(0,210,255,0.25)] ring-1 ring-cyan-400/30'
                    : 'border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] hover:bg-[var(--paper-3)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--paper-3)] border border-[var(--line)]">
                      {icons[t.key] ?? <Sparkle size={17} className="text-cyan-400" />}
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[var(--faint)]">
                      4 Agents
                    </span>
                  </div>
                  <h4 className="font-display mt-3 text-[14.5px] font-bold text-[var(--ink)]">
                    {t.title}
                  </h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-[var(--dim)] line-clamp-2">
                    {t.tagline}
                  </p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-[var(--line)] pt-2.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--faint)]">
                    Consensus Pass
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400 font-semibold truncate">
                    Kai → Lyra → Vex → Nova
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brief Parameter Console */}
      {!custom ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel id="topic">
              2. Mission Subject & Parameters
            </FieldLabel>
            <button
              type="button"
              onClick={() => {
                setCustom(true);
                setPrompt(fillPrompt(active, topic.trim()));
              }}
              className="text-[12px] font-semibold text-cyan-400 hover:underline cursor-pointer"
            >
              Switch to custom brief editor →
            </button>
          </div>

          <div className="relative">
            <Input
              id="topic"
              value={topic}
              placeholder={ENTERPRISE_SAMPLES[active.key]}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void launch();
              }}
              maxLength={MAX_PROMPT}
              className="h-13 text-[14.5px] px-4 font-normal shadow-inner bg-[var(--paper-3)] border-[var(--line)] text-[var(--ink)]"
            />
          </div>

          {/* Quick Query Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-mono text-[11px] text-[var(--faint)] mr-1">
              One-Click Presets:
            </span>
            {(CHIP_SUGGESTIONS[active.key] ?? []).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="rounded-full border border-[var(--line)] bg-[var(--paper-3)] px-3 py-1 font-mono text-[11px] text-[var(--dim)] transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel id="prompt">
              2. Custom Structured Mission Brief
            </FieldLabel>
            <button
              type="button"
              onClick={() => setCustom(false)}
              className="text-[12px] font-semibold text-cyan-400 hover:underline cursor-pointer"
            >
              ← Back to subject mode
            </button>
          </div>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            maxLength={MAX_PROMPT}
            className="text-[14px] leading-relaxed bg-[var(--paper-3)] border-[var(--line)] text-[var(--ink)]"
          />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-[13px] font-medium text-rose-400">
          {error}
        </div>
      )}

      {/* Dispatch Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[12px] text-[var(--dim)]">
            <StatusDot color="#10b981" live />
            <span>4 Specialist Lanes Armed</span>
          </div>

          <span className="text-[var(--faint)]">·</span>

          <span className="font-mono text-[11px] text-[var(--faint)]">
            {currentChars} / {MAX_PROMPT} chars ({charPct}%)
          </span>
        </div>

        <button
          type="button"
          onClick={() => void launch()}
          disabled={busy}
          className="group relative flex w-full sm:w-auto min-w-[270px] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-8 py-4 text-[14.5px] font-bold text-slate-950 shadow-[0_0_28px_rgba(0,210,255,0.45)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {busy ? (
            <>
              <Spinner size={16} />
              <span>Deploying Collective...</span>
            </>
          ) : (
            <>
              <span>Deploy Autonomous Swarm</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/20 text-slate-950 transition-transform group-hover:translate-x-1">
                <RocketLaunch size={14} weight="bold" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}