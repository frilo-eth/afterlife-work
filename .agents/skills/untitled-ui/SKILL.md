---
name: untitled-ui
description: Bridge to the Untitled UI React component and icon library (@untitledui/icons, CLI-installable base/application/marketing components). Use whenever a screen needs an icon and none exists yet in the project, or when a component from the frilo inventory needs an unstyled base to build on. Icons only ever come from a pack, never a one-off SVG.
---

# Untitled UI (icon + component bridge)

Untitled UI is a React + Tailwind + TypeScript library (React Aria underneath)
with a real CLI and a standalone icon package. It is not part of
`frilo-design-system` — it is raw material that gets restyled with frilo tokens
before anything ships.

## When to reach for it

- **Icons, always.** `ui-design-principles/references/components.md` is
  explicit: use a pack, not individual icons. `@untitledui/icons` is the
  default pack for this system unless a brand file names another.
- **Components, only as scaffolding.** If `frilo-design-system/COMPONENTS.md`
  has no spec for what's being built, an Untitled UI base component can be the
  starting shape — but it still needs a spec written in COMPONENTS.md before it
  ships (`ui-components` skill), and every raw value gets replaced with a
  token.

## Install

```bash
# icons only, into an existing React + Tailwind project
npm install @untitledui/icons

# full library init (Next.js)
npx untitledui@latest init --nextjs

# full library init (Vite)
npx untitledui@latest init --vite

# add one component after init
npx untitledui@latest add [component-name]
```

## Rules

- Icon bounding box stays 24 x 24pt per `ui-design-principles`; resize the box
  on import, never distort the glyph.
- Any Untitled UI component that ships gets its raw Tailwind classes replaced
  with frilo semantic tokens (`design-foundations` mapping) before merge. A hex
  code or an un-mapped spacing value copied from Untitled UI is a bug, not a
  shortcut.
- Don't install the full library just for icons. `npm install @untitledui/icons`
  alone covers the common case.

## Interaction with other skills

`ui-components` owns the final spec; this skill only supplies raw material.
`design-foundations` does the token remap. `ui-design-principles` sets the icon
sizing and pack-consistency rules this bridge has to satisfy.
