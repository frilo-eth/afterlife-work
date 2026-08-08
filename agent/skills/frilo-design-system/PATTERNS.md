# Patterns

Layout and platform rules. Skills reference sections by heading.

## Layout

- Max content width 1280, gutters space[5] mobile / space[7] desktop
- 12-col grid desktop, 4-col mobile
- Vertical rhythm: sections separated by space[9] (96) on marketing pages, space[7] (48) in apps
- Hero pattern: display type, one-line value prop in fg.secondary, single primary CTA

## Mobile experiences

- Thumb zone: primary actions in bottom third of viewport
- Bottom sheet over modal, always
- Pull-to-refresh on list views; skeleton screens over spinners
- Safe areas respected (env(safe-area-inset-*))
- Type never below sm (14); base (16) for inputs to kill iOS zoom
- Gestures need visible affordances (handles, edges); no invisible swipe-only actions

## Desktop webapps

- Sidebar nav + topbar for context/actions; content region owns its own scroll
- Keyboard first: every action reachable, cmd+k palette on anything with >10 destinations
- Density toggle if data-heavy (comfortable 40px rows / compact 32px)
- Empty states: one illustration or icon, one sentence, one CTA. Never blank.
- Optimistic UI for mutations under 500ms expected latency; otherwise inline loading state

## Motion

Profiles, selected by brand `motion-profile`:

- **restrained**: durations fast/base only, standard easing, opacity + 8px translate max. No bounce.
- **expressive**: spring easing on enter, reveal duration for hero moments, staggers at 40ms
- Universal: respect prefers-reduced-motion (fade only, instant duration). Exit animations 40% shorter than enter. Never animate layout properties; transform + opacity only.

## Content states

Every data view designs five states before shipping: loading, empty, error, partial, ideal. No exceptions.
