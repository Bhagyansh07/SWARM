'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MarkerType,
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
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { ArrowNote } from '@/components/landing/showcase';
import { Button, FieldLabel, Textarea } from '@/components/ui';
import { AGENT_ROSTER } from '@/lib/types';
import { api } from '@/lib/api';
import type { AgentRole } from '@/lib/types';

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
      className="font-mono w-[170px] border px-3 py-2.5 text-left"
      style={{
        background: 'var(--paper-2)',
        borderColor: selected ? 'var(--signal)' : 'var(--line-strong)',
        color: 'var(--ink)',
      }}
    >
      <p className="m-0 flex items-center justify-between gap-2 text-[12px] font-semibold text-[var(--ink)]">
        <span className="truncate">{meta?.name ?? 'agent'}</span>
        {G ? <G width={15} height={15} /> : null}
      </p>
      <p className="m-0 mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">{role ?? ''}</p>
    </div>
  );
}

function StartNodeView() {
  return (
    <div className="border bg-[var(--paper-2)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ borderColor: 'var(--ok)', color: 'var(--ok)' }}>
      start
    </div>
  );
}

function EndNodeView() {
  return (
    <div className="border bg-[var(--paper-2)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ borderColor: 'var(--signal)', color: 'var(--signal)' }}>
      verdict
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
  const [name, setName] = useState('Custom pipeline');
  const [prompt, setPrompt] = useState('Give the swarm a mission brief.');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: 'start', type: 'start', position: { x: 40, y: 210 }, data: {} } satisfies Node,
    { id: 'end', type: 'end', position: { x: 760, y: 210 }, data: {} } satisfies Node,
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback((c: Connection) => setEdges((es) => addEdge({ ...c, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--line-strong)' } }, es)), [setEdges]);

  const addAgent = (role: AgentRole) => {
    const id = `${role}-${Date.now()}`;
    const count = nodes.filter((n) => n.type === 'agent').length;
    setNodes((ns) => [...ns, { id, type: 'agent', position: { x: 220 + (count % 3) * 190, y: 160 + Math.floor(count / 3) * 130 }, data: { role } } satisfies Node]);
    if (nodes.length === 2) {
      setEdges((es) => [...es, { id: `e-start-${id}`, source: 'start', target: id, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--line-strong)' } }]);
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
      setError('Pipeline needs at least two agents in a single line — no cycles, no forks.');
      return;
    }
    if (prompt.trim().length < 3) {
      setError('Write a mission brief first.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await api.launch({ name: name.trim() || 'Custom pipeline', template: 'deep_research', prompt: prompt.trim(), config: { agents: order } });
      router.push(`/mission/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deploy failed.');
      setBusy(false);
    }
  };

  const addable = (Object.keys(AGENT_ROSTER) as AgentRole[]).filter((r) => r !== 'orchestrator');

  return (
    <div className="pb-16 pt-8">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="rack-index m-0">09 · workflow builder</p>
          <h1 className="font-display m-0 mt-2 text-[26px] font-black uppercase tracking-[0.06em] text-[var(--ink)]">Assemble the line</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {addable.map((r) => (
            <button
              key={r}
              onClick={() => addAgent(r)}
              className="font-mono cursor-pointer border border-[var(--line-strong)] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--dim)] hover:border-[var(--signal)] hover:text-[var(--signal)]"
            >
              + {AGENT_ROSTER[r].name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="relative">
          <div className="relative h-[440px] overflow-hidden border border-[var(--line)] bg-[var(--paper)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: 'var(--line-strong)', strokeWidth: 1 } }}
            >
              <Background variant={BackgroundVariant.Lines} gap={28} color="oklch(0.34 0.006 60 / 0.1)" />
            </ReactFlow>
          </div>
          <ArrowNote label="Add agents from the palette, then wire them start → verdict. The line order becomes the swarm’s turn order." align="right" className="top-8 hidden xl:block" />
          <div className="flex items-center gap-3 pt-3">
            {agentNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => removeAgent(n.id)}
                className="font-mono cursor-pointer border border-[var(--line)] px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--faint)] hover:border-[var(--bad)] hover:text-[var(--bad)]"
              >
                remove {roleOf(n) ? AGENT_ROSTER[roleOf(n)!].name : ''}
              </button>
            ))}
            {agentNodes.length === 0 && <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--faint)]">canvas empty</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel id="pname">Mission name</FieldLabel>
            <input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field w-full px-3 py-2 text-[14px] text-[var(--ink)] outline-none"
            />
          </div>
          <div>
            <FieldLabel id="pbrief">Mission brief</FieldLabel>
            <Textarea id="pbrief" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          <div
            className="border px-3 py-2"
            style={{ borderColor: order ? 'var(--line-strong)' : 'var(--bad)' }}
          >
            <p className="font-mono m-0 text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Turn order</p>
            <p className="font-mono mt-1.5 text-[13px] text-[var(--dim)]">
              {order ? order.map((r) => AGENT_ROSTER[r].name).join(' → ') : 'invalid pipeline'}
            </p>
          </div>
          {error && <p className="font-mono m-0 text-[12px] text-[var(--bad)]">{error}</p>}
          <Button onClick={deploy} disabled={busy || !order} className="inline-flex items-center justify-center gap-2">
            {busy ? (
              <>
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                Deploying
              </>
            ) : (
              'Deploy pipeline'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <div className="bg-grid flex min-h-screen flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5">
          <BuilderCanvas />
        </main>
        <Footer />
      </div>
    </ReactFlowProvider>
  );
}