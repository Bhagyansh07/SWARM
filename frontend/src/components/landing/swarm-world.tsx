'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const roles = [
  { name: 'KAI', role: 'researcher', color: '#8be28b', position: [-2.4, 1.1, 0] as [number, number, number], shape: 'scan' },
  { name: 'LYRA', role: 'analyst', color: '#d7a05d', position: [2.4, 1.1, 0] as [number, number, number], shape: 'lens' },
  { name: 'VEX', role: 'critic', color: '#ef876f', position: [2.4, -1.1, 0] as [number, number, number], shape: 'judge' },
  { name: 'NOVA', role: 'synthesizer', color: '#8fc9ff', position: [-2.4, -1.1, 0] as [number, number, number], shape: 'core' },
];

function Agent({ item, index }: { item: (typeof roles)[number]; index: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * (index % 2 ? -0.16 : 0.16);
    ref.current.position.y = item.position[1] + Math.sin(clock.elapsedTime * 0.8 + index) * 0.05;
  });
  return (
    <group ref={ref} position={item.position}>
      {item.shape === 'scan' && <mesh><icosahedronGeometry args={[0.33, 1]} /><meshBasicMaterial color={item.color} wireframe /></mesh>}
      {item.shape === 'lens' && <mesh><octahedronGeometry args={[0.38, 0]} /><meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.3} /></mesh>}
      {item.shape === 'judge' && <mesh><boxGeometry args={[0.5, 0.5, 0.5]} /><meshBasicMaterial color={item.color} wireframe /></mesh>}
      {item.shape === 'core' && <mesh><tetrahedronGeometry args={[0.43, 0]} /><meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.4} /></mesh>}
      <pointLight color={item.color} intensity={0.65} distance={1.8} />
    </group>
  );
}

function WorldCamera() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.08, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.05, 0.04);
  });
  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.35]}>
        <sphereGeometry args={[0.58, 20, 20]} />
        <meshStandardMaterial color="#d7a05d" emissive="#d7a05d" emissiveIntensity={0.55} metalness={0.6} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.012, 8, 96]} />
        <meshBasicMaterial color="#d7a05d" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0.35, 0]}>
        <torusGeometry args={[1.35, 0.008, 8, 96]} />
        <meshBasicMaterial color="#68716d" transparent opacity={0.6} />
      </mesh>
      {roles.map((item, index) => <Agent key={item.role} item={item} index={index} />)}
      {roles.map((item, index) => {
        const next = roles[(index + 1) % roles.length];
        return <Line key={`${item.role}-link`} points={[item.position, next.position]} color="#d7a05d" transparent opacity={0.42} lineWidth={0.65} dashed dashSize={0.12} gapSize={0.12} />;
      })}
      <Line points={[[0, 0, -0.35], [-2.4, 1.1, 0]]} color="#8be28b" transparent opacity={0.38} lineWidth={0.45} />
      <Line points={[[0, 0, -0.35], [2.4, -1.1, 0]]} color="#ef876f" transparent opacity={0.38} lineWidth={0.45} />
    </group>
  );
}

export function SwarmWorld() {
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
          <span className="rack-index">constellation preview</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">4 specialist roles · one verdict</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
          {roles.map((item) => <div key={item.role} className="bg-[var(--paper)] px-3 py-3"><span className="font-display block text-[12px] font-bold uppercase text-[var(--ink)]">{item.name}</span><span className="font-mono mt-1 block text-[10px] uppercase text-[var(--faint)]">{item.role}</span></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[390px] overflow-hidden border-y border-[var(--line)] bg-[var(--field)]" aria-label="SWARM agent constellation preview">
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <p className="rack-index m-0">constellation / live protocol</p>
        <p className="font-mono m-0 mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">four minds · shared signal · one verdict</p>
      </div>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={['#101211']} />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={42} />
        <ambientLight intensity={0.32} />
        <pointLight position={[0, 0, 4]} intensity={1.1} color="#d7a05d" />
        <WorldCamera />
        <OrbitControls enablePan={false} minDistance={5.5} maxDistance={10} autoRotate autoRotateSpeed={0.18} />
      </Canvas>
    </div>
  );
}
