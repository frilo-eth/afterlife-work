---
name: ui-design-principles
description: Foundational UI craft rules with concrete numbers for layout grids, spacing scales, type scales, color palettes, shadows, gradients, buttons, forms, cards, icons, imagery, navigation, white space, microcopy and microinteractions. Use this whenever designing, reviewing, critiquing or building any interface, screen, component, landing page or app UI, and whenever asked why a design "feels off", "looks cheap", "looks unfinished" or "looks AI-generated". Also use before writing frontend code that renders UI, so the markup ships with correct spacing, type and state coverage instead of defaults. Trigger even when the request is casual ("make this look better", "clean up this screen") and even when no design tool is mentioned.
version: 1.0.0
source: Distilled and rewritten from Michael Filipiuk, "UI Design Principles", plus standard platform guidance (Apple HIG, Material, WCAG 2.1). No source text is reproduced.
---

# UI Design Principles

The grammar layer of interface design. Every rule here is a default with a number
attached, so a design can be checked rather than argued about.

Two operating modes:

- **Build**: producing a screen, component or frontend code. Follow the order of
  operations below, then verify against the checklist.
- **Critique**: reviewing an existing design. Run the checklist top to bottom,
  report violations as `[element] observed vs expected, and the fix`. Never give
  vague feedback like "needs more polish". Name the property and the value.

A rule can be broken. It has to be broken on purpose, and the reason has to be
stateable in one sentence.

## Order of operations

Skipping steps is what produces designs that look decorated instead of designed.

1. **Define the problem.** Who uses this, what task, on what device, what is the
   one action that matters on this screen.
2. **Decide personality before assets.** Playful to serious is one dial. Color
   saturation, corner radius, typeface class, icon roundness and copy tone all
   move it together. Pick a position, then pick assets that agree. See
   `references/voice-and-motion.md`.
3. **Structure in grayscale.** Layout, hierarchy and spacing first, using only
   neutrals. If it does not work in gray, color will not save it.
4. **Set the systems.** Spacing scale, type scale, color palette. Build them once
   up front, not per screen.
5. **Apply.** Assets onto structure.
6. **Cover the states.** Hover, pressed, focus, disabled, loading, empty, error,
   long content, missing image. Unfinished-looking work is almost always
   uncovered states.
7. **Present the reasoning.** Decisions explained beat screens delivered silently.

## Hierarchy: the only five levers

Attention is directed by size, weight, color, position and isolation. Nothing
else. If everything is emphasized, nothing is. Before adding an emphasis, remove
one somewhere else.

Grouping is read from proximity, alignment, and enclosure, in that order of
strength. Space groups content more cheaply than a border does. Reach for a
divider or a card only after spacing has failed.

## Non-negotiable numbers

Quick reference. Details and reasoning live in the reference files.

| Thing | Default |
| --- | --- |
| Spacing base | 4pt mobile, 8pt desktop, multiples only |
| Screen margins | 20 to 24pt mobile, 160 to 180pt at 1440 desktop |
| Web columns | 12 (never 5, 7 or 11), gutters 12 to 16pt |
| Body text | 16pt minimum, never below for reading or inputs |
| Body line height | font size x 1.6, matched parity (even with even) |
| Heading line height | x 1.3 mid sizes, x 1.0 to 1.1 display |
| Line length | 50 to 60 characters, hard ceiling 70 |
| Typefaces per product | 1, exceptionally 2 with obvious contrast |
| Weight gap between paired styles | skip at least one step (Regular to Bold) |
| Text color | never pure #000000, use a near-black neutral |
| Contrast | 4.5:1 body, 3:1 large text and UI boundaries |
| Button height | 40 to 60pt, never below 40 |
| Button label size | 16pt (floor 13, ceiling 20) |
| Tap target | 44 x 44pt minimum, always |
| Control visual size | 24pt for checkbox, radio, icon box |
| Shadow | high blur, 5 to 10% opacity, tinted not black |
| Motion | 150 to 300ms typical, 1000ms absolute ceiling |
| Visible nav items | 5 max mobile, 7 max desktop |
| Form fields before splitting into steps | 5 |

## Reference files

Read the one that matches the task. Do not load all of them.

| File | Covers |
| --- | --- |
| `references/layout-and-spacing.md` | Grids, columns, fluid vs fixed, spacing scales, alignment, white space |
| `references/typography.md` | Typeface selection, hand-built type scales, line height, tracking, alignment, pairing |
| `references/color.md` | Palette construction from a primary, tints, shades, neutrals, semantic colors, contrast |
| `references/depth.md` | Shadows, elevation, gradients, dark mode surfaces |
| `references/components.md` | Buttons, forms, inputs, cards, icons, navigation |
| `references/imagery.md` | Photos, overlays, consistency, illustrations, when not to use them |
| `references/voice-and-motion.md` | Personality, microcopy, empty and error states, microinteractions, easing |

## Audit checklist

Run this on any screen. Each failed line is a concrete fix, not an opinion.

**Structure**
- Every gap is a value from the spacing scale.
- Nothing touches the screen edge except full-bleed media and nav chrome.
- Elements that belong together are closer to each other than to anything else.
- Text blocks align on baselines, not bounding boxes or centers.

**Type**
- Every size comes from the scale. Count the distinct sizes: more than 6 on one
  screen usually means the scale is not being used.
- Body is 16pt or larger with line height near 1.6.
- Measure is under 70 characters.
- Paired styles differ by more than one weight step.
- No Light weight below body size.

**Color**
- Text is a near-black or scale neutral, not #000000.
- One primary carries the main action. Count the competing accent colors: more
  than one means the page has no focal point.
- Semantic colors are distinguishable from the primary.
- Body text passes 4.5:1. UI boundaries pass 3:1.

**Depth**
- Shadows are soft, tinted, and only on things that are interactive or elevated.
- No shadow on plain text or disabled controls.
- Dark mode elevates with lighter surfaces, never with light shadows.

**Components**
- Radius is consistent across every button, input and card.
- Every interactive element has a 44pt target regardless of visual size.
- Hover, pressed, focus and disabled exist for everything clickable.
- Button labels name the outcome. "Complete purchase", not "Continue".
- Forms are one column, labels persistent, optional marked rather than required.

**Content**
- No lorem ipsum. Realistic text, including the longest realistic string.
- Empty state, error state and loading state exist.
- Images have one focal point and a scrim wherever text sits on them.

## Failure modes

Named so they can be called out fast in a critique.

- **Flat emphasis.** Everything bold, colored or shadowed, so nothing reads first.
- **Arbitrary spacing.** Gaps like 13, 27, 41. Symptom of no scale.
- **Placeholder as label.** Label vanishes the moment the user types.
- **Optimistic content.** Designed against one short perfect string, breaks on
  real data.
- **Decoration mistaken for design.** Gradients, glows and 3D added to a screen
  whose hierarchy is broken. Fix the structure, then decide if the decoration is
  still wanted.
- **Preference over audience.** Choices justified by "I like it" rather than who
  is using the product.
- **State amnesia.** Only the default state exists. Product feels dead in use.

## Interaction with other skills

This skill is the general grammar. When a brand or product system is also in play
(`frilo-design-system` or a client's tokens), the system's tokens win on any
concrete value: scale, palette, radius, type. This skill still governs whatever
the system leaves undefined, and still applies as the audit layer, since a token
set does not stop a screen from having broken hierarchy.
