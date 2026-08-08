---
name: transition-patterns
description: Remap step between the official transitions.dev skill (Jakub Antalik, installed via setup.sh) and frilo tokens. Use after transitions.dev's reveal/apply/refine/polish commands propose or insert a transition, to remap its variables onto frilo's token system before it ships. Also useful as a lookup when the user names a proven transition pattern (card resize, number pop-in, notification badge, text swap, dropdown, modal, panel reveal, page transition, icon swap).
---

# Transition Patterns (transitions.dev bridge)

The official `transitions.dev` skill (installed by `setup.sh`) owns discovery
and application: `reveal` lists the full catalog, `review` audits a project for
ad-hoc transitions, `apply` proposes and inserts one, `refine` and `polish`
tune it against existing motion. Call that skill first. This skill is what runs
after — the remap onto frilo's system.

## The nine patterns

| Pattern | Use for |
|---|---|
| Card resize | Cards/containers changing size on state change |
| Number pop-in | Counters, prices, stats updating (digit flip, blur, stagger) |
| Notification badge | Badge appearing on an icon (diagonal slide, spring) |
| Text states swap | Label/status text changing in place (blur crossfade) |
| Menu dropdown | Origin-aware dropdown open/close |
| Modal open/close | Centered modal with scale |
| Panel reveal | Side/inline panel open/close |
| Page side-by-side | Forward/back navigation between views |
| Icon swap | Icon morphing to another (scale + blur) |

## Workflow

1. Let the `transitions.dev` skill reveal, apply, or refine the pattern. Its
   snippets are semantic-variable based, ready for remapping, not a rewrite.
2. Remap its `:root` custom properties to frilo tokens: durations →
   `TOKENS.json` motion.duration, easings → motion.easing, colors → the brand
   file.
3. Keep the `t-*` class namespacing and the `prefers-reduced-motion` guard.
   Both survive the remap untouched.
4. Run the result through Emil's rules (`review-animations` if installed) and
   `micro-interactions`: frequency check, sub-300ms, origin correctness,
   interruption still apply. A pattern being proven doesn't exempt it from the
   frequency rule; a number pop-in on a value that updates every second gets
   deleted, not styled.

## Conflict rule

`transitions.dev` supplies the mechanism, frilo tokens supply the values,
Emil's craft rules and `micro-interactions`'s seven invariants supply the veto.
