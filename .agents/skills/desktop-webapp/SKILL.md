---
name: desktop-webapp
description: Design and build desktop web applications (dashboards, admin panels, data tools, SaaS interfaces) using frilo-os desktop patterns. Use this whenever building app shells, sidebars, data tables, command palettes, multi-pane layouts, keyboard shortcuts, or whenever the user mentions dashboard, webapp, admin, SaaS UI, desktop layout, or data-dense interfaces. Consult before any desktop app screen work.
---

# Desktop Webapp

## Order of operations

1. Read `BRIEF.md` for framework and scope.
2. Read `frilo-design-system/PATTERNS.md` → Desktop webapps section. Binding.
3. Components per ui-components skill (sidebar nav, table, modal specs live there).

## Rules beyond patterns.md

- App shell first: sidebar (240/64 collapsible) + topbar + scrollable content region. Build the shell before any screen.
- Tables: sticky header, tabular numerals, right-aligned numbers, row actions on hover with a keyboard path, bulk select when actions apply to many.
- Command palette (cmd+k) once nav exceeds 10 destinations. Register every nav item and major action in it.
- Keyboard: visible focus everywhere, esc closes topmost layer, enter submits, shortcuts documented in a `?` overlay.
- Data freshness visible: last-updated stamps or live indicators on anything that changes server-side.
- Mutations: optimistic under 500ms expected latency, inline spinners otherwise, toasts confirm, undo where destructive.

## Density

Data-heavy views ship a density toggle (40px / 32px rows). Store the choice. Marketing pages never get dense; apps never get airy hero spacing.

## Checklist before shipping a view

Five content states designed (loading, empty, error, partial, ideal), keyboard walkthrough completed, 1280 and 1536 widths verified, sidebar collapse doesn't break the layout.
