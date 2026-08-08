---
name: dialkit
description: Bridge to DialKit, a floating live-tuning control panel (sliders, color pickers, spring and easing editors) that binds directly to UI values at runtime. Use during active development when motion, spacing, or color values need tuning by feel before being written back as frilo tokens. Never for anything that ships to users.
---

# DialKit (live-tuning bridge)

DialKit is a dev-time panel, not a shipped UI component. It auto-detects
controls from a config object and lets you drag a spring, a duration, or a
color in the running app instead of guessing values and reloading.

## When to reach for it

- Tuning a spring or easing curve for `animation` or `micro-interactions`
  before committing a value to `TOKENS.json`.
- Dialing in a color or spacing value live against real content, before it
  gets written into a brand file.
- Never for a value that already has a token. If it is in `TOKENS.json` or a
  brand file, tune the token, not a one-off DialKit override.

## Install

```bash
npm install dialkit motion
```

Ships entry points for React, Solid, Svelte 5, and Vue 3 with an identical API
surface.

## Rules

- DialKit is removed before shipping. It is a tuning aid, not a runtime
  dependency — nothing it controls should still be reading from a DialKit panel
  in production.
- Once a value feels right, it gets written back into `TOKENS.json` (or the
  brand file) as the source of truth. DialKit's panel state is not persistence.

## Interaction with other skills

Feeds values into `animation` and `frilo-design-system`; doesn't replace
either. `micro-interactions` and Emil's craft rules still veto whatever gets
tuned, even if it feels good in the panel.
