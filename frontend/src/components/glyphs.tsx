import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  className: 'glyph',
  'aria-hidden': true,
};

export const GlyphScan = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 8V5.5C3 4.7 3.7 4 4.5 4H7" />
    <path d="M17 4h2.5c.8 0 1.5.7 1.5 1.5V8" />
    <path d="M21 16v2.5c0 .8-.7 1.5-1.5 1.5H17" />
    <path d="M7 20H4.5A1.5 1.5 0 0 1 3 18.5V16" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M9.5 9.5 7.5 7.5M14.5 9.5l2-2M9.5 14.5l-2 2M14.5 14.5l2 2" />
  </svg>
);

export const GlyphLens = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m15.5 15.5 4.5 4.5" />
    <path d="M8 11l2 2 3.5-4" />
  </svg>
);

export const GlyphJudge = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 20h16" />
    <path d="M8 20h8l-1-9H9l-1 9Z" />
    <path d="M7.5 11H4l.8-3c.6-1 1.5-1.6 2.7-1.6 1 0 2 .3 2.7 1M16.5 11H20l-.8-3c-.6-1-1.5-1.6-2.7-1.6-1 0-2 .3-2.7 1" />
    <path d="M9.5 6.4c0-1.4 1.1-2.4 2.5-2.4s2.5 1 2.5 2.4v.1c0 .4-.1.8-.3 1.1l-.3.5h-3.8l-.3-.5a3.5 3.5 0 0 1-.3-1.1V6.4Z" />
    <path d="M12 20v-3" />
  </svg>
);

export const GlyphCore = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const GlyphHub = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="5" cy="5" r="1.8" />
    <circle cx="19" cy="5" r="1.8" />
    <circle cx="5" cy="19" r="1.8" />
    <circle cx="19" cy="19" r="1.8" />
    <path d="M10.2 10.4 6.6 6.4M13.8 10.4 17.4 6.4M10.2 13.6 6.6 17.6M13.8 13.6l3.6 4" />
  </svg>
);

export const GlyphArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const GlyphClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const GlyphChip = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="7" y="7" width="10" height="10" />
    <path d="M10 2v5M14 2v5M10 17v5M14 17v5M2 10h5M2 14h5M17 10h5M17 14h5" />
  </svg>
);

export const GlyphGraph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <circle cx="12" cy="11" r="2" />
    <path d="m7.4 16.8 4.2-4M10.4 9.6l6.4-2.4M17 8l.6 7.8M14 11l2.2 5.4" />
  </svg>
);

export const GlyphTerm = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="M7 10l3 2.5L7 15M11.5 15H17" />
  </svg>
);

export const GlyphRoster = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="9" r="3" />
    <path d="M4 20c.5-3 2.2-4.5 5-4.5s4.5 1.5 5 4.5" />
    <path d="M15.5 6.5a3 3 0 0 1 0 5M16 15.8c1.7.4 2.9 1.6 3.4 4.2" />
  </svg>
);

export const GlyphPulse = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M2 12h5l2-5 4 10 2-5h7" />
  </svg>
);

export const Glyph = { scan: GlyphScan, lens: GlyphLens, judge: GlyphJudge, core: GlyphCore, hub: GlyphHub };