---
name: ui-components
description: Build UI components (buttons, inputs, cards, modals, tables, nav, toasts, badges) from the frilo-os component inventory. Use this whenever creating or modifying any interface element, building screens or pages, or whenever the user mentions a component by name, asks for a form, dashboard, landing section, or any visible UI. Always consult before writing component code.
---

# UI Components

Components come from the inventory, not from vibes.

## Order of operations

1. Read `BRIEF.md`. No brief → project-brief skill first.
2. Read `frilo-design-system/COMPONENTS.md` for the spec of what you're building.
3. Read `frilo-design-system/PATTERNS.md` section matching the platform (mobile / desktop).
4. Tokens via design-foundations mapping; semantic names only.

## Rules

- Component exists in inventory → follow its spec exactly (variants, sizes, states).
- Component missing → spec it in `frilo-design-system/COMPONENTS.md` FIRST (props, variants, states), then build. The doc is the API.
- All six interaction states implemented, always: default, hover, active, focus-visible, disabled, loading. Focus ring per inventory conventions.
- Accessibility floor: semantic HTML, labeled inputs, keyboard operable, 44px touch targets on mobile.
- Composition spacing per inventory rules (48 between sections, 24 inside cards, 12 between related controls). Resist inventing new gaps.
- One primary action per view. If you have two primary buttons, one of you is wrong.

## Anti-patterns

- Boolean prop soup (`isBig isGhost isDanger`). Use `variant` + `size`.
- Placeholder-as-label inputs.
- Spinner-only loading for anything list-shaped; use skeletons.
- px values copied from a screenshot instead of the token scale.
