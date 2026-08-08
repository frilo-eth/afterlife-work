# Component inventory

Single source of truth. Every skill that renders UI builds from these specs. Semantic token names only, never raw values.

## Conventions

- Props typed, defaults stated. Variants use `variant` + `size`, never boolean soup (`isPrimary isLarge isGhost` is banned).
- States every interactive component must define: default, hover, active, focus-visible, disabled, loading.
- Focus ring: 2px `accent.base` outline offset 2px. Non-negotiable, all platforms.
- Touch targets: min 44x44 on mobile, 32x32 desktop.

## Primitives

### Button
- variants: `primary` (accent.base bg), `secondary` (bg.raised + border.subtle), `ghost` (transparent, fg.secondary), `danger`
- sizes: sm (32h), md (40h), lg (48h); radius from brand `shape.buttons`
- loading state replaces label with spinner, preserves width

### Input / Textarea / Select
- bg.raised, border.subtle default, border.strong hover, accent.base focus
- error state: status.danger border + 12px helper text below
- labels always visible, no placeholder-as-label

### Card
- bg.raised, radius from brand `shape.cards`, elevation.sm, elevation.md on hover if interactive

### Badge / Tag
- xs type, radius.full, tinted status colors at 15% bg opacity

### Modal / Sheet
- desktop: centered modal, max-w 560, elevation.lg, overlay bg.base at 70%
- mobile: bottom sheet, drag handle, radius.xl top corners only

### Toast
- bottom-right desktop, top mobile. Auto-dismiss 5s, pause on hover. Max 3 stacked.

### Table
- desktop only above `md` breakpoint; collapses to card list below
- sticky header, row hover bg.overlay, sm type for data cells, mono font for numerals

### Nav
- desktop: left sidebar 240px collapsible to 64px icon rail
- mobile: bottom tab bar, max 5 items, active state uses accent.base

## Composition rules

- Spacing between sections: space[7] (48). Inside cards: space[5] (24). Between related controls: space[3] (12).
- One accent action per view. Everything else secondary or ghost.
- Numerals in data contexts always tabular (font-variant-numeric or mono).

## Extending

New component = add spec here first, then implement. If a project needs a variant, add it here with a `(project)` note. Promote to core when a second project uses it.
