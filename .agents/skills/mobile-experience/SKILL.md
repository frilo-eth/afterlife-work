---
name: mobile-experience
description: Design and build mobile experiences (responsive mobile web, PWA, React Native) using frilo-os mobile patterns. Use this whenever the work targets phones or small screens, building bottom sheets, tab bars, mobile nav, touch interactions, or whenever the user mentions mobile, iOS, Android, app screens, responsive breakpoints below md, or thumb reach. Consult before any mobile screen work.
---

# Mobile Experience

## Order of operations

1. Read `BRIEF.md` for platform targets and framework.
2. Read `frilo-design-system/PATTERNS.md` → Mobile experiences section. Those rules are binding.
3. Components per ui-components skill; mobile variants from the inventory (bottom sheet not modal, tab bar not sidebar).

## Rules beyond patterns.md

- Design at 390px width, verify at 320 and 430.
- Primary CTA lives in the bottom third; destructive actions never adjacent to primary ones.
- Lists virtualize past 50 items; every list ships skeleton, empty, and error states.
- Forms: one column, `inputmode` set correctly, autofocus first field only when the screen exists solely for that form.
- Sticky elements account for keyboard: bottom CTAs move above the keyboard or hide.
- Text inputs at type `base` (16) minimum; smaller invites iOS zoom.
- No hover-dependent behavior. Every hover affordance needs a touch equivalent.

## Navigation

- 5 tabs max, active state accent.base, labels always visible
- Deep screens: back affordance top-left AND swipe-back respected
- Modal flows (checkout, onboarding) get an explicit close, top-right

## Checklist before shipping a screen

Safe areas, keyboard behavior, 44px targets, reduced motion, offline/error state, dark background actually `bg.base` and not #000.
