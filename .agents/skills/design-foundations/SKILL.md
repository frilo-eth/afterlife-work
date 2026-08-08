---
name: design-foundations
description: Apply the frilo-os token system (color, type, spacing, radii, elevation) to any UI work. Use this whenever styling anything, setting up a Tailwind/CSS config, choosing colors or fonts, creating design tokens, or whenever the user mentions tokens, theming, palette, typography, spacing, or brand consistency. Consult before writing any stylesheet or theme file.
---

# Design Foundations

Tokens are law. This skill wires them into code.

## Order of operations

1. Read `BRIEF.md` (repo root). No brief → run project-brief skill first.
2. Read `frilo-design-system/TOKENS.json` (primitives) and the brand file named in the brief.
3. Generate the platform mapping. Never inline raw values in components.

## Mappings

**Tailwind / CSS**: emit CSS custom properties on `:root` from the brand file (`--bg-base`, `--fg-primary`, `--accent-base`...), map core scale into the Tailwind theme. Components use semantic names only: `bg-[var(--bg-raised)]` or theme-extended `bg-raised`.

**React Native**: emit a `theme.ts` exporting typed token objects. Spacing via the core scale array, never magic numbers.

**Figma-bound work**: name styles exactly as the token path (`color/bg/base`, `type/display`) so handoff is a rename-free operation.

## Rules

- Semantic over literal. `accent.base`, never `#2447FF`, anywhere downstream.
- Dark-first: brands in this system default dark; if a light mode is required, add a `light` block to the brand file rather than inverting ad hoc.
- Contrast: fg.primary on bg.base must pass AA (4.5:1). Check when creating new brand files.
- One brand file per project. Cross-project component code stays brand-agnostic.

## External skills

better-colors (OKLCH) is the tool for CONSTRUCTING a new brand palette; better-typography for auditing type decisions. Output of that work gets written into the brand file, and from then on the brand file wins. Never let a polish skill introduce a color or font that isn't in tokens.

## Extending a brand

New semantic slot needed (e.g. `chart` colors)? Add it to the brand file AND note it in `frilo-design-system/COMPONENTS.md` if a component consumes it. Slots undocumented in system/ don't exist.
