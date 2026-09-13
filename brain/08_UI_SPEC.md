# 08 — UI / UX Spec

Status: 🟢 ACTIVE

## Screen Inventory

| # | Screen name | Purpose | Entry points |
|---|---|---|---|
| 1 | Landing / Mission Launch | Hero + launch templates + recent missions | `/` |
| 2 | Live Mission Dashboard | Real-time agent telemetry while a mission runs | `/mission/[id]` |
| 3 | Workflow Builder | Drag-and-drop node graph to design a custom pipeline | `/builder` |
| 4 | Run Library | Saved missions + replay | `/history` |

## Navigation Flow

```
[Landing] -> [Live Mission Dashboard]
   |              |
   +-> [History]  +-> [Builder] (build custom -> launch -> dashboard)
```

## Design System

- **Color palette:**
  - Background base: `#070B14` (near-black navy)
  - Surface / panel: `#0D1424` (rgba glass)
  - Border: `rgba(148,163,184,0.12)`
  - Primary (cyan): `#22D3EE`
  - Accent (violet): `#8B5CF6`
  - Success (emerald): `#34D399`
  - Warning (amber): `#FBBF24`
  - Danger (rose): `#FB7185`
  - Text primary: `#E2E8F0` (slate-200), muted `#94A3B8` (slate-400)
- **Typography:** Space Grotesk (display/headings), Inter (body), JetBrains Mono (logs/telemetry/numbers).
- **Spacing scale:** 4/8/12/16/24/32/48 px.
- **Component library:** custom shadcn-style primitives (Button, Card, Badge, Progress, Dialog, Tooltip).
- **Dark mode:** always dark — the product IS a mission control aesthetic.

## Required States for Every Screen

- [x] **Loading:** skeleton shimmer cards + radial "spinning up swarm" indicator.
- [x] **Empty:** friendly empty state with CTA (e.g. "No missions yet — launch one").
- [x] **Error:** inline error panel with retry action.
- [x] **Success/populated:** happy path (live telemetry panels).
- [x] **Offline/simulation:** a "SIMULATION MODE" badge in header when no API key.

## Key Visual Elements

- **Agent orbit:** on the live dashboard, agent avatars orbit a central mission core with conic-gradient rings; active agent glows + progress ring.
- **Reasoning stream:** terminal-style black feed with colored role tags, cursor blink, auto-scroll.
- **Knowledge graph:** force-directed D3-style graph (implemented in SVG with custom physics) with pulsing nodes.
- **Telemetry panels:** live token counter that ticks, cost meter (est.), latency, per-agent bars.
- **Launch screen:** template cards with hover glow + "Launch Swarm" big button with animated rings.

## Accessibility Requirements

- Minimum tap target size: 40×40 px.
- Color contrast: WCAG AA (4.5:1) for body text.
- aria-labels on icon buttons, live regions (`aria-live="polite"`) on agent stream.

## Responsive Rules

- Breakpoints: 640px (mobile) / 1024px (tablet) / 1280px (desktop).
- Mobile: dashboard stacks vertically, builder becomes simple vertical pipeline.
- Desktop: 3-column mission layout (left stream / center orbit+graph / right analytics).