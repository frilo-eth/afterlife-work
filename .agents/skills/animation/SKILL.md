---
name: animation
description: Apply frilo-os motion tokens and profiles when writing animation code. Use whenever adding transitions, enter/exit animations, micro-interactions, or whenever the user mentions animation, motion, easing, Framer Motion, or GSAP. This skill supplies the VALUES (durations, easings, profiles); Emil Kowalski's skills supply the craft rules. Use both together.
---

# Animation (frilo-os bridge)

Division of labor:

- **This skill** owns the numbers: durations, easings, springs from `frilo-design-system/TOKENS.json`, and the brand's motion profile (restrained | expressive) from BRIEF.md.
- **emilkowalski/skills** owns the judgment: whether to animate at all, easing direction, origin correctness, interruptibility, frequency rules. If installed (they should be, see setup.sh), defer to `emil-design-eng` while writing and `review-animations` before shipping.

## Order of operations

1. Read `BRIEF.md` for the motion profile.
2. Read `frilo-design-system/TOKENS.json` motion block.
3. Apply Emil's decision framework (animate at all? frequency? easing direction?) with frilo token values plugged in.

## Where the two systems meet

- Emil says sub-300ms UI. Frilo tokens comply: instant 80 / fast 160 / base 240. `slow` (400) and `reveal` (600) are for rare hero moments only, which he also permits.
- Emil says ease-out on enter. Frilo `decel` and `standard` curves are the compliant picks. Never ship `accel` on an entrance.
- Restrained profile is stricter than Emil's floor: max 8px translate, no bounce, staggers capped at 3 items.
- Conflict rule: Emil's craft rules win on judgment, frilo tokens win on values. If a token value violates a craft rule, flag it as a token bug rather than hardcoding around it.

## Curve selection (the Easing Blueprint)

Same author as `emilkowalski/skills` — this is his `animations.dev` easing
lesson, not a competing source. It sharpens "ease-out on enter" above into a
per-context lookup. Frilo only ships three named curves (`standard`, `decel`,
`accel`) plus a `spring`, so this is the mapping from his five contexts onto
what's actually in `TOKENS.json`.

| Context | Curve | Frilo token |
| --- | --- | --- |
| User-initiated enter: dropdown, modal, sheet opening | ease-out | `decel` (or `standard` when a softer feel is wanted) |
| Element already on screen repositioning or morphing | ease-in-out | No token exists yet. Approximate with `standard` and flag it as a token gap — don't hand-type a curve to fill it |
| Anything else | ease-in | Avoid. Reserve acceleration for exits, and even there prefer `accel` over a hand-picked ease-in |
| Marquee, progress fill, or anything modelling constant real-world motion | linear | Raw `linear` keyword — the one legitimate case for not using a named curve. Duration still comes from `TOKENS.json` |
| Hover color/opacity | CSS default `ease` | `standard` at `fast` (160ms) is the closest token match |

One concrete number worth keeping as-is: button press feedback is `scale(0.97)`
on `:active`. Its source duration (150ms) rounds to frilo's `fast` (160ms) —
ship the token, not the raw 150.

## Non-delegable frilo rules

- Durations/easings from tokens only; a hand-typed cubic-bezier is a finding.
- transform + opacity only.
- prefers-reduced-motion degrades to opacity fades at `instant`.
- Exit at ~60% of enter duration.
