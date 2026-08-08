---
name: adopt
description: Onboard an EXISTING project into the frilo-os system - audit current design values, reverse-engineer a brand token file, generate a retrofit BRIEF.md, and produce a drift report with migration plans. Use whenever frilo-os skills are installed into a codebase that predates them, whenever the user says adopt, retrofit, onboard, initial audit, or asks how an existing project can benefit from the skills. Run once per existing project, before any other frilo skill does build work.
---

# Adopt (retrofit an existing project)

New projects start with project-brief. Existing projects start here. Read-only until step 5; nothing gets rewritten during the audit.

## Workflow

1. **Inventory reality.** Scan the codebase for design values in the wild: colors (hex/rgb/hsl/oklch), font families and sizes, spacing values, radii, durations and easings, shadows, breakpoints. Note frequency and where each lives (config, CSS vars, inline, hardcoded in components).

2. **Reverse-engineer the brand file.** Cluster what you found into the brand schema (see frilo-design-system/brands/frilo.json for shape): the dominant values become the semantic slots, near-duplicates get flagged (`#0A0C12` and `#0a0d13` are one token and one bug). Write `frilo-design-system-adopted-brand.json` as a PROPOSAL; the user confirms slot assignments before it's blessed.

3. **Generate a retrofit BRIEF.md** via the project-brief template, marked `Mode: retrofit`, pointing at the proposed brand file. Ask only what the codebase can't answer (audience, primary action, motion profile).

4. **Drift report.** Compare reality against frilo standards and write `ADOPTION.md`:
   - Hardcoded values that should be tokens (count + worst offenders)
   - Off-scale values (spacing not on the 4px scale, rogue radii, hand-typed cubic-beziers)
   - Contrast failures against AA
   - Component-state gaps (missing focus-visible, disabled, loading states)
   - Missing content states (views without empty/error/loading)
   Order by user-visible impact, not by count.

5. **Emit migration plans**, shadcn/improve style: self-contained, one concern each, executable by a cheaper model. Plan 1 is always "wire tokens + replace hardcoded values"; it unlocks every other skill. Deeper judgment passes (better-interface, review-animations) run AFTER tokens are wired, on a system that can express fixes properly.

## Rules

- Never bulk-rewrite during adoption. Audit → confirm brand file → migrate via plans.
- Existing visual identity wins over frilo defaults: adoption captures what IS, the drift report says what's inconsistent WITHIN it. Changing the identity is a redesign, offered separately, never smuggled in.
- If the project already has a token system, map it instead of replacing it; the brand file can point at existing variables.
