'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * HeroBacklight — Ultra-Luxury Architectural Backlight & Ambient Nexus
 *
 * Implements:
 * 1. Volumetric optical backlight halo with subtle breathing luminescence.
 * 2. Harmonic geometric deliberation orbits (Kai, Vex, Lyra, Nova).
 * 3. Reactive mouse parallax underglow for physical optical depth.
 * 4. Zero text occlusion, zero jarring motion — pure calm architectural majesty.
 */
export function HeroBacklight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 28;
      targetY = (e.clientY / innerHeight - 0.5) * 18;
    };

    const update = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMousePos({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Dynamic Cursor-Tracking Ambient Backlight Orb */}
      <div
        className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 h-[520px] w-[750px] max-w-[90vw] rounded-full blur-[100px] transition-transform duration-700 ease-out opacity-70 dark:opacity-85"
        style={{
          transform: `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))`,
          background:
            'radial-gradient(circle, var(--backlight-core) 0%, var(--backlight-glow) 45%, transparent 75%)',
        }}
      />

      {/* Secondary Lateral Backlight Flares (Bilateral Symmetry) */}
      <div className="absolute left-[15%] top-[25%] h-[320px] w-[320px] rounded-full blur-[90px] opacity-40 dark:opacity-50 bg-gradient-to-br from-indigo-500/10 to-transparent" />
      <div className="absolute right-[15%] top-[25%] h-[320px] w-[320px] rounded-full blur-[90px] opacity-40 dark:opacity-50 bg-gradient-to-bl from-emerald-500/10 to-transparent" />

      {/* Architectural Geometric Deliberation Nexus */}
      <div
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] max-w-[95vw] max-h-[95vw] opacity-40 dark:opacity-55"
        style={{
          transform: `translate(calc(-50% + ${mousePos.x * 0.4}px), calc(-50% + ${mousePos.y * 0.4}px))`,
        }}
      >
        <svg
          viewBox="0 0 800 800"
          className="w-full h-full text-[var(--line-strong)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Boundary Ring */}
          <circle
            cx="400"
            cy="400"
            r="380"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-30"
          />

          {/* Orbit Ring 1 (Slow clockwise rotation) */}
          <g className="origin-center animate-[spin_160s_linear_infinite]">
            <circle
              cx="400"
              cy="400"
              r="290"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 6"
              className="opacity-40"
            />
            {/* Agent Node Beacon: Kai (Researcher) */}
            <circle cx="400" cy="110" r="4" fill="var(--ink)" className="opacity-80" />
            <circle cx="400" cy="110" r="10" stroke="var(--ink)" strokeWidth="1" className="opacity-30" />
          </g>

          {/* Orbit Ring 2 (Counter-clockwise rotation) */}
          <g className="origin-center animate-[spin_110s_linear_infinite_reverse]">
            <circle
              cx="400"
              cy="400"
              r="210"
              stroke="currentColor"
              strokeWidth="1.2"
              className="opacity-45"
            />
            {/* Agent Node Beacon: Vex (Adversarial Critic) */}
            <circle cx="190" cy="400" r="4" fill="var(--ink)" className="opacity-80" />
            <circle cx="190" cy="400" r="9" stroke="var(--ink)" strokeWidth="1" className="opacity-30" />
          </g>

          {/* Orbit Ring 3 (Clockwise rotation) */}
          <g className="origin-center animate-[spin_80s_linear_infinite]">
            <circle
              cx="400"
              cy="400"
              r="130"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="6 4"
              className="opacity-50"
            />
            {/* Agent Node Beacon: Lyra (Quant Analyst) */}
            <circle cx="530" cy="400" r="3.5" fill="var(--ink)" className="opacity-80" />
            {/* Agent Node Beacon: Nova (Executive Synthesizer) */}
            <circle cx="270" cy="400" r="3.5" fill="var(--ink)" className="opacity-80" />
          </g>

          {/* Center Crosshair Nexus */}
          <line x1="400" y1="360" x2="400" y2="440" stroke="currentColor" strokeWidth="1" className="opacity-40" />
          <line x1="360" y1="400" x2="440" y2="400" stroke="currentColor" strokeWidth="1" className="opacity-40" />
          <circle cx="400" cy="400" r="5" stroke="var(--ink)" strokeWidth="1.5" className="opacity-60" />
          <circle cx="400" cy="400" r="2" fill="var(--ink)" className="opacity-80" />
        </svg>
      </div>

      {/* Bottom Dissolve Vignette into Main Content */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--paper)] via-[var(--paper)]/80 to-transparent" />
    </div>
  );
}
