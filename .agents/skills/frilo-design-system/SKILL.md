---
name: frilo-design-system
description: The source of truth for the frilo design system - tokens, component specs, layout patterns, motion profiles. Use this whenever any design or UI work happens, whenever another frilo skill needs token values or component specs, or whenever the user mentions the design system, tokens, the component inventory, or brand files. Other frilo-* skills depend on this one; consult it first.
---

# Frilo Design System

This skill owns the system. Companion docs in this folder are the only place design values live.

## Files

- `TOKENS.json` — primitives: space, type, radius, motion, elevation, breakpoints
- `brands/*.json` — semantic slots per brand (colors, fonts, voice, shape, motion profile). BRIEF.md names which one applies.
- `COMPONENTS.md` — component inventory: variants, sizes, states, spacing law
- `PATTERNS.md` — layout, mobile, desktop, and motion rules

## Rules

1. Skills and code never contain raw design values. Semantic token names only, resolved from these files.
2. `BRIEF.md` at project root selects the brand file. No brief → run project-brief first.
3. Missing component or pattern → document it in COMPONENTS.md / PATTERNS.md first, then build.
4. New client → duplicate the closest `brands/*.json`, adjust, reference from BRIEF.md. Nothing else changes.

## For dependent skills

design-foundations, ui-components, animation, mobile-experience, and desktop-webapp all read from this folder. If installed via the skills CLI, they live as sibling skill folders; resolve companion docs from this skill's directory.
