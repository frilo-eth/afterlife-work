---
name: guideframe
description: Bridge to GuideFrame, a browser overlay tool (Figma-style column grids, rulers, draggable guides, DOM geometry inspector) for checking a built screen against its grid. Use after building a screen to verify alignment against the actual rendered DOM, or when a layout looks subtly off and eyeballing it isn't resolving it.
---

# GuideFrame (grid verification bridge)

A dev-time overlay, not a shipped dependency. Where
`ui-design-principles/references/layout-and-spacing.md` defines the grid math,
GuideFrame checks the built result actually landed on it.

## When to reach for it

- After building a screen from a `frilo-design-system` layout spec, to confirm
  columns, gutters, and margins landed where the math said they should.
- When a screen "looks off" and the cause isn't obvious — the geometry
  inspector gives exact box dimensions and padding instead of guessing from a
  screenshot.

## Install

```bash
npm install @guideframe/react   # React / Next.js
npm install @guideframe/core    # Svelte, Vue, Astro, or plain JS
```

```tsx
import { GuideframeGrid } from "@guideframe/react";

<GuideframeGrid rulers />;
```

## Rules

- Configure the overlay's column/gutter/margin values from the same numbers
  used to build the screen (`layout-and-spacing.md` § Building a column grid),
  not a generic default — otherwise it's checking against the wrong grid.
- Dev-only. Strip the import before shipping; it has no production purpose.

## Interaction with other skills

Verifies what `ui-design-principles` and `frilo-design-system/PATTERNS.md`
specify. Doesn't replace either — it's the audit tool, they're the source of
truth.
