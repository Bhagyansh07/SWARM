'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowsClockwise,
  Check,
  CheckCircle,
  Copy,
  Cpu,
  Fingerprint,
  GitFork,
  Lightning,
  MagnifyingGlass,
  Play,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  TreeStructure,
} from '@phosphor-icons/react/dist/ssr';
import { TEMPLATES, type TemplateDef } from '@/lib/types';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui';

interface ScenarioPreset {
  key: string;
  title: string;
  subtitle: string;
  briefPlaceholder: string;
  chips: string[];
  graphSummary: {
    kai: { claim: string; citation: string; stat: string };
    vex: { claim: string; attackVector: string; stat: string };
    lyra: { claim: string; modelType: string; stat: string };
    nova: { verdict: string; directive: string; dissent: string; hash: string };
  };
}

const SCENARIOS: ScenarioPreset[] = [
  {
    key: 'deep_research',
    title: 'Silicon Architecture',
    subtitle: '2.5D vs 3D CoWoS packaging',
    briefPlaceholder: 'Evaluating 2.5D vs 3D CoWoS chiplet packaging for neuromorphic AI silicon — thermal throttling, packaging yield, and latency bottlenecks',
    chips: [
      'Silicon photonics vs HBM4 scaling',
      'Quantum topological qubits error mitigation',
      'Open-source vs proprietary foundation models in healthcare',
    ],
    graphSummary: {
      kai: {
        claim: 'Verified 14 primary foundry specs: 3D stacking thermal density exceeds 1.2 W/mm² under active inference workloads.',
        citation: 'TSMC CoWoS-S Datasheet v4.2 · IEEE Trans C-72',
        stat: '94% Confidence',
      },
      vex: {
        claim: 'Attacks baseline assumption: 3D stack thermal hotspot breaches 380W TDP envelope, triggering permanent throttling.',
        attackVector: 'Critical Hotspot Saturation',
        stat: '78% Scrutiny',
      },
      lyra: {
        claim: 'Models thermal dissipation curves: Hybrid 2.5D packaging yields 91.2% higher sustained throughput per watt.',
        modelType: 'Bayesian Monte Carlo (N=10,000)',
        stat: '89% Calibrated',
      },
      nova: {
        verdict: 'Edge neuromorphic silicon deployment experiences severe thermal density saturation beyond 1.2 W/mm² on standard monolithic and 3D stacked dies.',
        directive: 'Mandate hybrid 2.5D CoWoS interposers with integrated microchannel vapor chambers. Reallocate peak power envelopes to sustain sub-10ms inference passes.',
        dissent: 'Vex noted higher packaging unit costs in sub-100k production runs; mitigated by multi-die wafer yield savings.',
        hash: 'SHA256: 8f4a2b919d701e83f5c71b69f8849c',
      },
    },
  },
  {
    key: 'product_review',
    title: 'Distributed Systems',
    subtitle: 'High-concurrency mutex locks',
    briefPlaceholder: 'Distributed crypto payment gateway processing 12,000 req/sec with shared mutex state — deadlock mitigation and threadpool starvation',
    chips: [
      'Redis distributed caching invalidation failures',
      'High-frequency trading settlement race conditions',
      'Database connection pooling memory leaks',
    ],
    graphSummary: {
      kai: {
        claim: 'Cites Node.js libuv event loop benchmarks: Synchronous mutex locks block worker threads under 8,000+ ingress webhooks.',
        citation: 'RFC 6749 Auth Benchmarks · Linux Epoll Trace',
        stat: '96% Confidence',
      },
      vex: {
        claim: 'Red-teams catastrophic failure: Mutex lock convoys create cascading tail-latency spikes exceeding 14,000ms SLA.',
        attackVector: 'Cascading Lock Convoy Failure',
        stat: '84% Scrutiny',
      },
      lyra: {
        claim: 'Quantifies crash probability: 88.4% likelihood of service deadlock within 45 minutes of market volatility spike.',
        modelType: 'Poisson Queue Simulation',
        stat: '91% Calibrated',
      },
      nova: {
        verdict: 'Payment microservice encounters severe threadpool starvation under 8,000 concurrent webhooks due to shared mutex lock convoys in the event loop.',
        directive: 'Refactor into zero-copy atomic ring buffer with spin-locks. Completely decouple ledger transaction persistence from synchronous ingress workers.',
        dissent: 'Kai questioned memory allocation ceiling during prolonged traffic bursts; verified safe 64MB buffer bounds.',
        hash: 'SHA256: b104ef937a06d214c7719f20e4912a',
      },
    },
  },
  {
    key: 'startup_validation',
    title: 'AI Compliance',
    subtitle: 'EU AI Act Article 14 audit',
    briefPlaceholder: 'Self-executing compliance auditing agent for EU AI Act high-risk regulatory filings — audit trail immutability and liability defense',
    chips: [
      'Vertical AI copilot for architectural CAD validation',
      'Decentralized synthetic training data network',
      'Automated cloud cost optimization agent',
    ],
    graphSummary: {
      kai: {
        claim: 'Audits Article 14 EU AI Act: Human-in-the-loop oversight mandates formal dissenting audit trails for autonomous systems.',
        citation: 'EU AI Act Official Journal (2024/1689) Art. 14',
        stat: '95% Confidence',
      },
      vex: {
        claim: 'Flags regulatory fine risk: Single agreeable AI silences edge dissent, creating direct corporate liability up to €35M.',
        attackVector: 'Unmitigated Bias & Liability',
        stat: '82% Scrutiny',
      },
      lyra: {
        claim: 'Weights procurement friction: 78.4% audit rejection chance during enterprise legal review without immutable logs.',
        modelType: 'Regulatory Risk Factor Matrix',
        stat: '87% Calibrated',
      },
      nova: {
        verdict: 'TAM modeled at $4.2B with enterprise legal procurement friction centered around EU AI Act Article 14 human oversight requirements.',
        directive: 'Architect self-verifying audit trails with immutable dissenting records to secure compliance moat against single-prompt incumbents.',
        dissent: 'Lyra suggested self-serve freemium friction; counter-balanced by enterprise procurement retention mandates.',
        hash: 'SHA256: 49c8192a8e71b59012f46d819e9921',
      },
    },
  },
  {
    key: 'code_review',
    title: 'Zero-Trust Auth',
    subtitle: 'JWT token replay defense',
    briefPlaceholder: 'High-throughput Node.js microservice handling streaming webhooks and cryptographic token validation — JWT replay vulnerability fixes',
    chips: [
      'Express auth middleware JWT replay vulnerability',
      'WebSocket connection state race conditions',
      'SQL injection mitigation in dynamic query builder',
    ],
    graphSummary: {
      kai: {
        claim: 'Discovered replay vulnerability: Bearer tokens lack distributed nonce validation, allowing MITM packet re-transmission.',
        citation: 'RFC 7519 JWT Spec §4.1.7 · OWASP API Top 10',
        stat: '98% Confidence',
      },
      vex: {
        claim: 'Stress-tests cache failure: Standalone Redis cache failure allows token forgery during failover re-synchronization.',
        attackVector: 'Sentinel Failover Desync Window',
        stat: '86% Scrutiny',
      },
      lyra: {
        claim: 'Calculates breach surface: 96.1% attack success rate on unverified bearer tokens under distributed replay attacks.',
        modelType: 'Attack Surface Stochastic Model',
        stat: '93% Calibrated',
      },
      nova: {
        verdict: 'JWT replay vulnerability and WebSocket state races identified in streaming authentication middleware under distributed load.',
        directive: 'Implement distributed cryptographic nonce caching in Redis with atomic Lua scripts and TLS-bound session tokens.',
        dissent: 'Vex flagged potential single point of failure in standalone cache node; resolved via cluster-mode sentinel failover.',
        hash: 'SHA256: 9e8841a029c7b1149e8310f88214de',
      },
    },
  },
];

export function fillPrompt(t: TemplateDef, topic: string): string {
  return t.defaultPrompt
    .replace('[topic]', topic)
    .replace('[product]', topic)
    .replace('[idea]', topic);
}

export function SwarmWorkbench() {
  const router = useRouter();
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>('deep_research');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<'kai' | 'vex' | 'lyra' | 'nova' | null>('kai');
  const [simStep, setSimStep] = useState<number>(-1); // -1: idle, 0: kai, 1: vex, 2: lyra, 3: nova, 4: complete
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeScenario = SCENARIOS.find((s) => s.key === activeScenarioKey) ?? SCENARIOS[0];
  const activeTemplate = TEMPLATES.find((t) => t.key === activeScenarioKey) ?? TEMPLATES[0];

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(0);
    setSelectedNode('kai');

    const steps: Array<'kai' | 'vex' | 'lyra' | 'nova'> = ['kai', 'vex', 'lyra', 'nova'];
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current < 4) {
        setSimStep(current);
        setSelectedNode(steps[current]);
      } else {
        clearInterval(interval);
        setSimStep(4);
        setIsSimulating(false);
      }
    }, 1200);
  };

  const handleReset = () => {
    setSimStep(-1);
    setIsSimulating(false);
    setSelectedNode('kai');
  };

  const handleCopyMemo = () => {
    const text = `SWARM CONSENSUS ACTION MEMO\nScenario: ${activeScenario.title} — ${activeScenario.subtitle}\nVerdict Status: 98.2% CALIBRATED CONSENSUS\nCryptographic Seal: ${activeScenario.graphSummary.nova.hash}\n\n[SYNTHESIZED VERDICT]\n${activeScenario.graphSummary.nova.verdict}\n\n[EXECUTIVE DIRECTIVE]\n${activeScenario.graphSummary.nova.directive}\n\n[RETAINED MINORITY DISSENT]\n${activeScenario.graphSummary.nova.dissent}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = async () => {
    if (isDispatching) return;
    const promptToSend = fillPrompt(activeTemplate, customPrompt.trim() || activeScenario.briefPlaceholder).trim();
    if (promptToSend.length < 8) {
      setError('Please provide a substantive brief (at least 8 characters).');
      return;
    }
    setError(null);
    setIsDispatching(true);
    try {
      const res = await api.launch({
        name: customPrompt.trim() ? customPrompt.trim().slice(0, 48) : activeScenario.title,
        template: activeTemplate.key,
        prompt: promptToSend,
      });
      router.push(`/mission/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mission dispatch failed. Check network.');
      setIsDispatching(false);
    }
  };

  return (
    <div className="relative">
      {/* Ambient Volumetric Backlight */}
      <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-b from-[var(--backlight-core)] via-transparent to-transparent opacity-60 blur-3xl pointer-events-none" />

      {/* Unified Master Chassis — Everything is neatly encased inside this single frame */}
      <div className="relative glass-bezel-outer shadow-2xl">
        <div className="glass-bezel-inner p-5 sm:p-7 md:p-8">
          
          {/* =================================================================
              TOP MASTER CONSOLE DECK (Inside Frame)
              ================================================================= */}
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: System Status & Topology Metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full glass-pill px-3 py-1 font-mono text-[11px] font-bold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                TOPOLOGY: PARALLEL DAG ENGINE
              </span>
              <span className="hidden font-mono text-[11px] text-[var(--faint)] sm:inline">
                Byzantine Deliberation Bus · 4 Specialist Nodes
              </span>
            </div>

            {/* Right: Simulation Control & Action */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={simStep === 4 ? handleReset : handleSimulate}
                disabled={isSimulating}
                className="glass-pill flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11.5px] font-semibold text-[var(--ink)] hover:bg-[var(--line-subtle)] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSimulating ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Deliberating Node {Math.min(simStep + 1, 4)}/4...</span>
                  </>
                ) : simStep === 4 ? (
                  <>
                    <ArrowsClockwise size={13} className="text-emerald-500" />
                    <span>Reset Graph Cycle</span>
                  </>
                ) : (
                  <>
                    <Play size={11} weight="fill" className="text-emerald-500" />
                    <span>Simulate Deliberation DAG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =================================================================
              ARCHETYPE SCENARIO PICKER (Inside Frame)
              ================================================================= */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--faint)] mr-1">
              Archetypes:
            </span>
            {SCENARIOS.map((sc) => {
              const isSelected = sc.key === activeScenarioKey;
              return (
                <button
                  key={sc.key}
                  type="button"
                  onClick={() => {
                    setActiveScenarioKey(sc.key);
                    setCustomPrompt('');
                    setSimStep(-1);
                    setSelectedNode('kai');
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--ink)] text-[var(--paper)] shadow-md font-semibold'
                      : 'glass-pill text-[var(--dim)] hover:text-[var(--ink)]'
                  }`}
                >
                  {sc.title}
                </button>
              );
            })}
          </div>

          {/* =================================================================
              GRAPH VISUALIZATION & NODE TOPOLOGY STAGE (Inside Frame)
              ================================================================= */}
          <div className="mt-6 rounded-2xl glass-card p-4 sm:p-6 overflow-hidden">
            
            {/* Graph Deck Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--line)] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <TreeStructure size={16} className="text-emerald-500" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink)]">
                  Live Consensus Topology
                </span>
                <span className="rounded-full glass-pill px-2 py-0.5 font-mono text-[9.5px] text-[var(--faint)]">
                  DAG v2.4
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10.5px] text-[var(--faint)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Evidence Flow
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Cross-Exam
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Bayesian Fusion
                </span>
              </div>
            </div>

            {/* Ingestion & Problem Specification Hub */}
            <div className="mb-6 rounded-xl glass-input p-4 transition-all focus-within:border-[var(--line-strong)]">
              <div className="flex items-center justify-between border-b border-[var(--line-subtle)] pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md glass-pill font-mono text-[10px] font-bold text-[var(--ink)]">
                    IN
                  </span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--faint)]">
                    Origin Ingestion Buffer · Problem Brief
                  </span>
                </div>
                <span className="font-mono text-[10.5px] text-[var(--faint)]">
                  Dispatches in parallel to 4 lanes
                </span>
              </div>

              <textarea
                rows={2}
                value={customPrompt}
                placeholder={activeScenario.briefPlaceholder}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void handleDispatch();
                }}
                className="w-full resize-none bg-transparent p-1 text-[13.5px] sm:text-[14px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none"
              />

              <div className="mt-3 pt-2.5 border-t border-[var(--line-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Chip prompts */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10.5px] font-mono text-[var(--faint)]">Load:</span>
                  {activeScenario.chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setCustomPrompt(chip)}
                      className="glass-pill rounded-full px-2.5 py-0.5 font-mono text-[10px] text-[var(--dim)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Primary Launch Action */}
                <button
                  type="button"
                  onClick={() => void handleDispatch()}
                  disabled={isDispatching}
                  className="group inline-flex items-center gap-2 rounded-full bg-[var(--ink)] pl-4 pr-2 py-1.5 text-[12.5px] font-semibold text-[var(--paper)] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
                >
                  {isDispatching ? (
                    <>
                      <Spinner size={13} />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Swarm Mission</span>
                      <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-[var(--paper)]/20 font-mono text-[10px] font-bold">
                        ⌘↵
                      </span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-2.5 rounded-lg border border-rose-500/30 bg-rose-500/[0.08] p-2 text-[11.5px] text-rose-500">
                  {error}
                </div>
              )}
            </div>

            {/* =============================================================
                THE 4 INTERCONNECTED AGENT NODES IN DAG TOPOLOGY
                ============================================================= */}
            <div className="relative">
              {/* Visual Flow Connection Rails (Desktop SVG overlay indicator) */}
              <div className="hidden lg:block absolute inset-0 pointer-events-none -z-0">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gradientKaiVex" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="gradientVexLyra" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="gradientLyraNova" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Inter-Node Pipeline Ribbon */}
              <div className="hidden sm:flex items-center justify-between px-3.5 py-1.5 mb-3.5 rounded-xl glass-pill font-mono text-[10px] text-[var(--faint)]">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  01: Grounding
                </span>
                <span className="text-[var(--line-strong)] font-bold">──▶</span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  02: Adversarial
                </span>
                <span className="text-[var(--line-strong)] font-bold">──▶</span>
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  03: Risk Math
                </span>
                <span className="text-[var(--line-strong)] font-bold">──▶</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  04: Consensus
                </span>
              </div>

              {/* Node Grid */}
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                
                {/* NODE 1: Kai (Empirical Grounding) */}
                <div
                  onClick={() => setSelectedNode('kai')}
                  className={`group relative rounded-xl glass-card p-4 transition-all duration-200 cursor-pointer ${
                    selectedNode === 'kai'
                      ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-500/25 scale-[1.01]'
                      : simStep === 0
                      ? 'border-emerald-500/70 shadow-md'
                      : 'hover:border-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 font-mono text-[11px] font-bold text-white shadow-xs">
                        K
                      </span>
                      <div>
                        <span className="font-display text-[13px] font-bold text-[var(--ink)] block leading-tight">
                          Kai
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block">
                          Lane 01 · Empirical
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full glass-pill px-2 py-0.5 font-mono text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                      {activeScenario.graphSummary.kai.stat}
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-[var(--dim)] line-clamp-3">
                    &ldquo;{activeScenario.graphSummary.kai.claim}&rdquo;
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[var(--line-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--faint)]">
                    <span className="truncate max-w-[150px]">
                      {activeScenario.graphSummary.kai.citation}
                    </span>
                    <span className="text-emerald-500 font-semibold">Active</span>
                  </div>
                </div>

                {/* NODE 2: Vex (Adversarial Critic) */}
                <div
                  onClick={() => setSelectedNode('vex')}
                  className={`group relative rounded-xl glass-card p-4 transition-all duration-200 cursor-pointer ${
                    selectedNode === 'vex'
                      ? 'border-amber-500 shadow-lg ring-2 ring-amber-500/25 scale-[1.01]'
                      : simStep === 1
                      ? 'border-amber-500/70 shadow-md'
                      : 'hover:border-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 font-mono text-[11px] font-bold text-white shadow-xs">
                        V
                      </span>
                      <div>
                        <span className="font-display text-[13px] font-bold text-[var(--ink)] block leading-tight">
                          Vex
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block">
                          Lane 02 · Red Team
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full glass-pill px-2 py-0.5 font-mono text-[9.5px] font-bold text-amber-600 dark:text-amber-400">
                      {activeScenario.graphSummary.vex.stat}
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-[var(--dim)] line-clamp-3">
                    &ldquo;{activeScenario.graphSummary.vex.claim}&rdquo;
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[var(--line-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--faint)]">
                    <span className="text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[150px]">
                      {activeScenario.graphSummary.vex.attackVector}
                    </span>
                    <span className="text-amber-500">Debate ⇄</span>
                  </div>
                </div>

                {/* NODE 3: Lyra (Quantitative Risk) */}
                <div
                  onClick={() => setSelectedNode('lyra')}
                  className={`group relative rounded-xl glass-card p-4 transition-all duration-200 cursor-pointer ${
                    selectedNode === 'lyra'
                      ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-500/25 scale-[1.01]'
                      : simStep === 2
                      ? 'border-indigo-500/70 shadow-md'
                      : 'hover:border-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500 font-mono text-[11px] font-bold text-white shadow-xs">
                        L
                      </span>
                      <div>
                        <span className="font-display text-[13px] font-bold text-[var(--ink)] block leading-tight">
                          Lyra
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block">
                          Lane 03 · Bayesian
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full glass-pill px-2 py-0.5 font-mono text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400">
                      {activeScenario.graphSummary.lyra.stat}
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-[var(--dim)] line-clamp-3">
                    &ldquo;{activeScenario.graphSummary.lyra.claim}&rdquo;
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[var(--line-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--faint)]">
                    <span className="truncate max-w-[150px]">
                      {activeScenario.graphSummary.lyra.modelType}
                    </span>
                    <span className="text-indigo-500 font-semibold">Calibrated</span>
                  </div>
                </div>

                {/* NODE 4: Nova (Executive Arbiter) */}
                <div
                  onClick={() => setSelectedNode('nova')}
                  className={`group relative rounded-xl glass-card p-4 transition-all duration-200 cursor-pointer ${
                    selectedNode === 'nova'
                      ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-500/25 scale-[1.01]'
                      : simStep === 3
                      ? 'border-emerald-500/70 shadow-md'
                      : 'hover:border-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--ink)] font-mono text-[11px] font-bold text-[var(--paper)] shadow-xs">
                        N
                      </span>
                      <div>
                        <span className="font-display text-[13px] font-bold text-[var(--ink)] block leading-tight">
                          Nova
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block">
                          Lane 04 · Consensus
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full glass-pill px-2 py-0.5 font-mono text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                      98.2% Calibrated
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-[var(--dim)] line-clamp-3">
                    &ldquo;{activeScenario.graphSummary.nova.directive}&rdquo;
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[var(--line-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--faint)]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Consensus Sealed
                    </span>
                    <span className="truncate max-w-[100px] text-[var(--faint)]">
                      {activeScenario.graphSummary.nova.hash.slice(0, 15)}...
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Interactive Node Inspector Drawer */}
            {selectedNode && (
              <div className="mt-4 rounded-xl glass-card p-4 transition-all">
                <div className="flex items-center justify-between border-b border-[var(--line-subtle)] pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                      Node Deep Inspector ·{' '}
                      {selectedNode === 'kai'
                        ? 'Lane 01 (Kai: Empirical Retrieval & Citations)'
                        : selectedNode === 'vex'
                        ? 'Lane 02 (Vex: Adversarial Red-Team Stress-Test)'
                        : selectedNode === 'lyra'
                        ? 'Lane 03 (Lyra: Bayesian Risk & Monte Carlo)'
                        : 'Lane 04 (Nova: Executive Consensus & Seal)'}
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] text-[var(--faint)]">
                    Sub-second execution trace
                  </span>
                </div>

                <div className="text-[12.5px] text-[var(--dim)] leading-relaxed">
                  {selectedNode === 'kai' && (
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        Empirical Foundation:{' '}
                        <span className="font-normal">{activeScenario.graphSummary.kai.claim}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-mono text-[var(--faint)]">
                        Primary Citation: {activeScenario.graphSummary.kai.citation} · Verified arXiv/IEEE specs with SHA256 integrity.
                      </p>
                    </div>
                  )}
                  {selectedNode === 'vex' && (
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        Adversarial Attack Vector:{' '}
                        <span className="font-normal">{activeScenario.graphSummary.vex.claim}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                        Stress-Test Focus: {activeScenario.graphSummary.vex.attackVector} · Inter-lane debate triggered back to Kai.
                      </p>
                    </div>
                  )}
                  {selectedNode === 'lyra' && (
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        Quantitative Risk Calibration:{' '}
                        <span className="font-normal">{activeScenario.graphSummary.lyra.claim}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        Statistical Engine: {activeScenario.graphSummary.lyra.modelType} · Reconciles empirical claim vs adversarial failure probability.
                      </p>
                    </div>
                  )}
                  {selectedNode === 'nova' && (
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        Synthesized Executive Directive:{' '}
                        <span className="font-normal">{activeScenario.graphSummary.nova.directive}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        Consensus Hash: {activeScenario.graphSummary.nova.hash} · Mandatory minority dissent preserved for enterprise governance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================================
              UNIFIED CONSENSUS LEDGER & ACTION DOCK (Inside Frame)
              ================================================================= */}
          <div className="mt-6 rounded-2xl glass-card p-5 sm:p-6 transition-all shadow-sm">
            
            {/* Memo Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--line)] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink)]">
                  Consensus Action Memo Sealed · 98.2% Calibration
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-[var(--faint)]">
                  {activeScenario.graphSummary.nova.hash}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMemo}
                  className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-medium text-[var(--dim)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Memo Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Executive Memo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Memo Content Grid */}
            <div className="grid gap-5 md:grid-cols-2">
              
              {/* Verdict & Directive */}
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--faint)] block mb-1">
                    Synthesized Verdict
                  </span>
                  <p className="text-[13px] sm:text-[13.5px] font-medium text-[var(--ink)] leading-relaxed">
                    {activeScenario.graphSummary.nova.verdict}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--faint)] block mb-1">
                    Mandated Architectural Directive
                  </span>
                  <p className="text-[12.5px] text-[var(--dim)] leading-relaxed rounded-xl glass-input p-3">
                    {activeScenario.graphSummary.nova.directive}
                  </p>
                </div>
              </div>

              {/* Dissent & Governance Guarantee */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                    Formal Minority Dissent Retained
                  </span>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] backdrop-blur-md p-3 text-[12px] italic text-[var(--dim)] leading-relaxed">
                    &ldquo;{activeScenario.graphSummary.nova.dissent}&rdquo;
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-[10.5px] font-mono text-[var(--faint)]">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle size={13} weight="fill" />
                    EU AI Act Art. 14 Trace Compliant
                  </span>
                  <span>100% Trace Retained</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
