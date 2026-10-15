'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Glyph } from '@/components/glyphs';
import { FieldLabel, Textarea } from '@/components/ui';
import { AGENT_ROSTER } from '@/lib/types';
import { api } from '@/lib/api';
import type { AgentRole } from '@/lib/types';
import {
  CheckCircle,
  Cpu,
  Plus,
  RocketLaunch,
  Sparkle,
  Trash,
  WarningCircle,
} from '@phosphor-icons/react/dist/ssr';

function roleOf(node: Node): AgentRole | null {
  const r = node.data?.role as AgentRole | undefined;
  return r && r in AGENT_ROSTER ? r : null;
}

function AgentNodeView({ data, selected }: NodeProps<Node>) {
  const role = roleOf(data as unknown as Node);
  const meta = role ? AGENT_ROSTER[role] : null;
  const G = meta ? Glyph[meta.avatar as keyof typeof Glyph] : undefined;

  return (
    <div
      className={`relative w-[190px] rounded-2xl border p-3.5 shadow-md backdrop-blur-xl transition-all ${
        selected
          ? 'border-[var(--ink)] ring-2 ring-[var(--line-strong)] bg-[var(--paper-3)]'
          : 'border-[var(--line-strong)] bg-[var(--paper-2)] hover:border-[var(--ink)]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-[var(--ink)]" />
      <div className="flex items-center justify-between">
        <span className="font-display text-[13.5px] font-bold text-[var(--ink)]">
          {meta?.name ?? 'Agent'}
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--paper-3)] text-[var(--ink)] border border-[var(--line)]">
          {G ? <G width={14} height={14} /> : <Cpu size={14} />}
        </span>
      </div>
      <p className="font-mono mt-1 text-[10px] uppercase tracking-wider text-[var(--faint)]">
        {role ?? 'Specialist'}
      </p>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-[var(--ink)]" />
    </div>
  );
}

function StartNodeView() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--paper-2)] px-4 py-2 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-[var(--ink)] animate-pulse" />
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
        Input Brief
      </span>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-[var(--ink)]" />
    </div>
  );
}

function EndNodeView() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--paper-2)] px-4 py-2 shadow-sm">
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-[var(--ink)]" />
      <Sparkle size={13} className="text-[var(--ink)]" weight="fill" />
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
        Converged Verdict
      </span>
    </div>
  );
}

const nodeTypes = {
  agent: AgentNodeView,
  start: StartNodeView,
  end: EndNodeView,
};

function computeOrder(nodes: Node[], edges: Edge[]): AgentRole[] | null {
  const agents = nodes.filter((n) => roleOf(n));
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  const idToRole = new Map(agents.map((n) => [n.id, roleOf(n)!]));
  for (const n of agents) {
    adjacency.set(n.id, []);
    indegree.set(n.id, 0);
  }
  for (const e of edges) {
    if (adjacency.has(e.source) && adjacency.has(e.target)) {
      adjacency.get(e.source)!.push(e.target);
      indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
    }
  }
  const queue = agents.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  if (queue.length !== 1) return null;
  const order: string[] = [];
  const seen = new Set<string>();
  while (queue.length) {
    const cur = queue.shift()!;
    if (seen.has(cur)) return null;
    seen.add(cur);
    order.push(cur);
    for (const nx of adjacency.get(cur) ?? []) {
      indegree.set(nx, indegree.get(nx)! - 1);
      if (indegree.get(nx) === 0) queue.push(nx);
    }
  }
  if (order.length !== agents.length) return null;
  return order.map((id) => idToRole.get(id)!);
}

function BuilderCanvas() {
  const router = useRouter();
  const [name, setName] = useState('Custom Multi-Agent Orchestration');
  const [prompt, setPrompt] = useState('Investigate microservices latency bottlenecks and cross-examine root causes.');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: 'start', type: 'start', position: { x: 30, y: 200 }, data: {} } satisfies Node,
    { id: 'end', type: 'end', position: { x: 740, y: 200 }, data: {} } satisfies Node,
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((es) =>
        addEdge(
          {
            ...c,
            markerEnd: { type: MarkerType.ArrowClosed, color: 'currentColor' },
            style: { stroke: 'var(--ink)', strokeWidth: 1.5 },
          },
          es
        )
      ),
    [setEdges]
  );

  const addAgent = (role: AgentRole) => {
    const id = `${role}-${Date.now()}`;
    const count = nodes.filter((n) => n.type === 'agent').length;
    setNodes((ns) => [
      ...ns,
      {
        id,
        type: 'agent',
        position: { x: 200 + (count % 3) * 190, y: 150 + Math.floor(count / 3) * 120 },
        data: { role },
      } satisfies Node,
    ]);
    if (nodes.length === 2) {
      setEdges((es) => [
        ...es,
        {
          id: `e-start-${id}`,
          source: 'start',
          target: id,
          markerEnd: { type: MarkerType.ArrowClosed, color: 'currentColor' },
          style: { stroke: 'var(--ink)', strokeWidth: 1.5 },
        },
      ]);
    }
  };

  const removeAgent = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  };

  const agentNodes = useMemo(() => nodes.filter((n) => roleOf(n) !== null), [nodes]);
  const order = useMemo(() => computeOrder(agentNodes, edges), [agentNodes, edges]);

  const deploy = async () => {
    if (busy) return;
    if (!order || order.length < 2) {
      setError('Pipeline must connect at least two agents in a clear sequential line without loops.');
      return;
    }
    if (prompt.trim().length < 5) {
      setError('Please provide a substantive mission brief.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await api.launch({
        name: name.trim() || 'Custom Pipeline',
        template: 'deep_research',
        prompt: prompt.trim(),
        config: { agents: order },
      });
      router.push(`/mission/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pipeline deployment failed.');
      setBusy(false);
    }
  };

  const addable = (Object.keys(AGENT_ROSTER) as AgentRole[]).filter((r) => r !== 'orchestrator');

  return (
    <div className="pb-20 pt-8 animate-in fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--faint)]">
            Interactive Architecture Canvas
          </span>
          <h1 className="font-display mt-2 text-[30px] font-extrabold tracking-tight text-[var(--ink)] sm:text-[36px]">
            Visual Workflow Orchestration
          </h1>
          <p className="mt-1 text-[14px] text-[var(--dim)]">
            Construct custom multi-agent reasoning chains by wiring specialized agents from input brief to converged verdict.
          </p>
        </div>

        {/* Palette Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {addable.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => addAgent(r)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-3.5 py-1.5 font-mono text-[11px] text-[var(--ink)] transition-all hover:border-[var(--line-strong)] hover:bg-[var(--paper-3)] cursor-pointer"
            >
              <Plus size={12} weight="bold" />
              <span>{AGENT_ROSTER[r].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Flow Canvas + Config Panel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
        <div>
          <div className="relative h-[480px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-sm">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { stroke: 'var(--ink)', strokeWidth: 1.5 },
              }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--line-strong)" />
            </ReactFlow>
          </div>

          {/* Node cleanup chips */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {agentNodes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => removeAgent(n.id)}
                className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-2.5 py-1 font-mono text-[10px] text-[var(--dim)] transition-all hover:border-rose-500/40 hover:text-rose-500 cursor-pointer"
              >
                <Trash size={11} />
                <span>Remove {roleOf(n) ? AGENT_ROSTER[roleOf(n)!].name : ''}</span>
              </button>
            ))}
            {agentNodes.length === 0 && (
              <span className="font-mono text-[11px] text-[var(--faint)]">
                Click agent buttons above to add nodes to canvas.
              </span>
            )}
          </div>
        </div>

        {/* Right Configuration Drawer */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-6 shadow-sm flex flex-col gap-4">
          <div>
            <FieldLabel id="pname">Workflow Identifier</FieldLabel>
            <input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field w-full rounded-xl px-3.5 py-2 text-[14px] text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] outline-none"
            />
          </div>

          <div>
            <FieldLabel id="pbrief">Mission Brief</FieldLabel>
            <Textarea
              id="pbrief"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-[13.5px] leading-relaxed"
            />
          </div>

          {/* Pipeline Verification Status */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              order
                ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                : 'border-amber-500/20 bg-amber-500/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2">
              {order ? (
                <CheckCircle size={15} className="text-emerald-500" weight="fill" />
              ) : (
                <WarningCircle size={15} className="text-amber-500" weight="fill" />
              )}
              <span
                className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
                  order ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {order ? 'Valid Sequential Line' : 'Connect Nodes in Order'}
              </span>
            </div>

            <p className="font-mono mt-1.5 text-[12px] text-[var(--dim)]">
              {order
                ? order.map((r) => AGENT_ROSTER[r].name).join(' → ')
                : 'Wire: Input Brief → Agent 1 → Agent 2 → Converged Verdict'}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3 text-[12px] text-rose-500">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => void deploy()}
            disabled={busy || !order}
            className="key flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-bold cursor-pointer disabled:opacity-40"
          >
            <RocketLaunch size={16} weight="bold" />
            <span>{busy ? 'Deploying Custom Pipeline...' : 'Deploy Pipeline Collective'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 px-4 sm:px-6">
        <BuilderCanvas />
      </main>
    </ReactFlowProvider>
  );
}