# Design Brief

## Direction

Scholarly Neon — a focused English-learning workspace where ink-dark surfaces and editorial type are cut by violet/cyan light.

## Tone

Refined tech-editorial: restrained density for a study tool, with one bold signature (cursor-tracked light) instead of scattered decoration.

## Differentiation

The interface reacts to the learner's pointer — a flashlight washes the page and card borders ignite under the cursor, making study feel alive without noise.

## Color Palette

| Token      | OKLCH         | Role                          |
| ---------- | ------------- | ----------------------------- |
| background | 0.16 0.02 265 | dark ink canvas               |
| foreground | 0.95 0.01 265 | primary text                  |
| card       | 0.20 0.025 265| elevated module surfaces      |
| primary    | 0.62 0.24 293 | violet — CTAs, active nav     |
| accent     | 0.75 0.15 210 | cyan — badges, highlights     |
| muted      | 0.26 0.03 265 | secondary surfaces            |

Light mode mirrors the same hues at L≈0.98 / 0.94 with foreground L≈0.19.

## Typography

- Display: Space Grotesk — hero headline, section headings, nav wordmark; tight tracking.
- Body: DM Sans — paragraphs, labels, UI text; mono JetBrains Mono for timers/counters.
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-4xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base md:text-lg`.

## Elevation & Depth

Three-tier surface hierarchy (background → card → popover) with subtle/elevated/floating shadows; depth comes from layered surfaces, not gradients.

## Structural Zones

| Zone    | Background          | Border    | Notes                                  |
| ------- | ------------------- | --------- | -------------------------------------- |
| Header  | `bg-card/80` blur   | `border-b`| sticky, active nav pill in primary     |
| Content | `bg-background`     | —         | sections alternate `bg-muted/30`       |
| Footer  | `bg-muted/40`       | `border-t`| muted links, small type                |

## Spacing & Rhythm

Spacious: `py-16 md:py-24` section gaps, `gap-6` card grids, `p-6` card padding, 4px micro-spacing base.

## Component Patterns

- Buttons: pill radius, primary violet with neon hover glow, accent cyan secondary, ghost tertiary.
- Cards: `rounded-2xl` (14px), `bg-card`, subtle border, glow-card pointer border + inner spotlight.
- Badges: pill, cyan tinted (`bg-accent/15 text-accent`) for CEFR B1/B2/C1 level tags.

## Motion

- Entrance: `page-enter` fade + 10px rise, 0.4s `cubic-bezier(0.22,1,0.36,1)`.
- Hover: `hover-lift` translateY(-4px) + elevated shadow, 0.3s smooth.
- Decorative: cursor flashlight radial layer, glow-card border ignition, float/pulse-glow ambient.

## Constraints

- Dark + light themes, toggle persisted to localStorage, no flash on first paint.
- Glow + flashlight disabled on touch devices and under `prefers-reduced-motion`.
- Mobile-first responsive; keyboard accessible with visible focus rings.
- Token-only styling: no raw hex/rgb in components.

## Signature Detail

The cursor-tracked flashlight plus pointer-following card border glow — a "light follows you" study environment.
