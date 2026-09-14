'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { AgentStateDto, KnowledgeEdgeDto, KnowledgeNodeDto } from '@/lib/types';

const AGENT_COLORS: Record<string, string> = {
  researcher: '#8be28b',
  analyst: '#d7a05d',
  critic: '#ef876f',
  synthesizer: '#8fc9ff',
};

const AGENT_POSITION = [
  [-2.5, 1.25, 0],
  [2.5, 1.25, 0],
  [2.5, -1.25, 0],
  [-2.5, -1.25, 0],
] as const;

function AgentGlyph({ agent, index }: { agent: AgentStateDto; index: number }) {
  const group = useRef<THREE.Group>(null);
  const active = agent.status === 'working' || agent.status === 'thinking';
  const color = AGENT_COLORS[agent.role] ?? '#d7a05d';
  const [x, y, z] = AGENT_POSITION[index % AGENT_POSITION.length];

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse = active ? 1 + Math.sin(clock.elapsedTime * 4) * 0.08 : 1;
    group.current.scale.setScalar(pulse);
    group.current.rotation.y += active ? 0.012 : 0.002;
  });

  return (
    <group ref={group} position={[x, y, z]}>
      {agent.role === 'researcher' && <mesh><icosahedronGeometry args={[0.33, 1]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.15} wireframe /></mesh>}
      {agent.role === 'analyst' && <mesh><octahedronGeometry args={[0.38, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.15} /></mesh>}
      {agent.role === 'critic' && <mesh><boxGeometry args={[0.52, 0.52, 0.52]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.15} wireframe /></mesh>}
      {agent.role === 'synthesizer' && <mesh><tetrahedronGeometry args={[0.46, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.15} /></mesh>}
      <pointLight color={color} intensity={active ? 1.5 : 0.25} distance={2.4} />
    </group>
  );
}

function DataLinks({ agents }: { agents: AgentStateDto[] }) {
  const active = agents.some((agent) => agent.status === 'working' || agent.status === 'thinking');
  return (
    <group>
      {AGENT_POSITION.map((position, index) => {
        const next = AGENT_POSITION[(index + 1) % AGENT_POSITION.length];
        return <Line key={index} points={[position, next]} color={active ? '#d7a05d' : '#5b625f'} transparent opacity={active ? 0.8 : 0.35} lineWidth={active ? 1.2 : 0.6} dashed dashSize={0.12} gapSize={0.1} />;
      })}
    </group>
  );
}

function GraphCloud({ nodes, edges }: { nodes: KnowledgeNodeDto[]; edges: KnowledgeEdgeDto[] }) {
  const positions = useMemo(() => nodes.map((node, index) => {
    const angle = index * 2.39996;
    const radius = 0.45 + (node.group + 1) * 0.18;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(index * 1.7) * 0.4] as [number, number, number];
  }), [nodes]);

  return (
    <group>
      {edges.map((edge) => {
        const source = positions[nodes.findIndex((node) => node.id === edge.sourceId)];
        const target = positions[nodes.findIndex((node) => node.id === edge.targetId)];
        return source && target ? <Line key={edge.id} points={[source, target]} color="#68716d" transparent opacity={0.45} lineWidth={0.5} /> : null;
      })}
      {nodes.map((node, index) => (
        <mesh key={node.id} position={positions[index]}>
          <sphereGeometry args={[Math.max(0.035, Math.min(0.1, node.weight * 0.1)), 8, 8]} />
          <meshBasicMaterial color={node.kind === 'claim' ? '#ef876f' : node.kind === 'fact' ? '#8be28b' : '#d7a05d'} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ agents, nodes, edges }: { agents: AgentStateDto[]; nodes: KnowledgeNodeDto[]; edges: KnowledgeEdgeDto[] }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={42} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 4]} intensity={1.2} color="#d7a05d" />
      <DataLinks agents={agents} />
      {agents.slice(0, 4).map((agent, index) => <AgentGlyph key={agent.id} agent={agent} index={index} />)}
      <GraphCloud nodes={nodes} edges={edges} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.55]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#171a19" roughness={0.8} metalness={0.1} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={5} maxDistance={11} autoRotate autoRotateSpeed={0.25} />
    </>
  );
}

export function MissionScene({ agents, nodes, edges }: { agents: AgentStateDto[]; nodes: KnowledgeNodeDto[]; edges: KnowledgeEdgeDto[] }) {
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 640px)');
    const update = () => setFallback(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (fallback) {
    return (
      <div className="border border-[var(--line)] bg-[var(--paper-2)] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rack-index">low-power mission map</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">{agents.length} agents · {nodes.length} nodes · {edges.length} links</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
          {agents.slice(0, 4).map((agent) => <div key={agent.id} className="bg-[var(--paper)] px-3 py-3"><span className="font-display block text-[12px] font-bold uppercase text-[var(--ink)]">{agent.name}</span><span className="font-mono mt-1 block text-[10px] uppercase text-[var(--faint)]">{agent.phase}</span></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] border border-[var(--line)] bg-[var(--paper-2)]" aria-label="Live three-dimensional mission map">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={['#111312']} />
        <SceneContent agents={agents} nodes={nodes} edges={edges} />
      </Canvas>
    </div>
  );
}
