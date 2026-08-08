---
name: project-brief
description: Generate the BRIEF.md that kicks off every design/build project in the frilo-os system. Use this whenever a new project, client, landing page, app, or design engagement starts, whenever the user mentions a brief, kickoff, new client, or project setup, or whenever another frilo-os skill is invoked and no BRIEF.md exists in the repo root. Always run this before any UI work on a fresh project.
---

# Project Brief

The entry point. Output is a `BRIEF.md` at repo root that every other skill reads first. No BRIEF.md, no build.

## Process

1. Check repo root for existing `BRIEF.md`. If present, read it and stop; you're done.
2. Gather inputs: client one-pager, verbal description, or interview the user with the questions below. If info exists in context, don't re-ask.
3. Resolve the brand: existing file in `frilo-design-system/brands/`, or create a new one by duplicating the closest brand file and adjusting.
4. Write `BRIEF.md` using the template.

## Interview (only ask what's missing)

- Project name, client, one-sentence goal
- Platform targets: mobile / desktop webapp / marketing site / all
- Brand: existing token file or new? If new: palette direction, type direction, motion profile (restrained | expressive)
- Audience and the one action they must take
- Constraints: framework, deadline, existing codebase, accessibility bar
- Anti-references: what it must NOT look like

## Output

Write `BRIEF.md` at project root using `BRIEF-TEMPLATE.md` in this folder. Keep it under a page. A brief nobody reads is decoration.
