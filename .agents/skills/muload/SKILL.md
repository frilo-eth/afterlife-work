---
name: muload
description: Bridge to muload, a paid library of 43 loading and streaming motion patterns purpose-built for AI interfaces (token streaming, retrieval, tool calls, agent runs). Use when building the loading or in-progress state for an AI feature and no frilo or shadcn primitive covers the specific AI-shaped wait. Ordinary spinners and skeletons stay on frilo tokens; don't reach for this for those.
---

# muload (AI loader bridge)

Ordinary loading states (a button spinner, a page skeleton) stay inside
`frilo-design-system` and `micro-interactions` — don't reach for muload for
those. muload exists for the AI-shaped waits that don't have a good generic
pattern: a token stream rendering, an embedding lookup, a tool call in flight.

## When to reach for it

- The wait is specific to an AI operation. `ai-interface-patterns` and
  `ai-ux-rules` rules 15-32 govern the requirements: fill latency with the real
  step, never a rotating quip, scope runs past 10 seconds.
- No frilo or shadcn primitive already covers the shape of the wait.

## Install

```bash
pnpm dlx shadcn@latest add @muload/token-stream
```

Paid product (lifetime license). Targets React, React Native, SwiftUI, and
Lottie exports.

## Rules

- Durations and easings still resolve to frilo `TOKENS.json` after import — a
  muload pattern is a mechanism, not a values source, the same relationship
  `transition-patterns` has with transitions.dev.
- Must still pass `ai-ux-rules` 16 (real step in the user's vocabulary), 21
  (spinner vs. progress by known/unknown duration), and 31 (per-item progress
  for batches). A pretty loader that violates those rules is a regression, not
  an upgrade.

## Interaction with other skills

`ai-ux-rules` and `ai-interface-patterns` govern whether and how to show
progress at all; this skill only supplies the visual mechanism once that's
decided. `micro-interactions` still owns interruption, reduced motion, and
layout stability for whatever gets installed.
