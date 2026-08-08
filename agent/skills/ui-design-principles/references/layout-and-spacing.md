# Layout and spacing

## Grid anatomy

- **Columns**: vertical divisions. More columns, more layout options.
- **Gutters**: gaps between columns. Smaller gutter, denser page.
- **Margins**: the outer space between grid and screen edge. Not optional.
- **Rows and modules**: rarely used on the web. Column grids dominate.

## Choosing a grid type

| Type | Behavior | Use for |
| --- | --- | --- |
| Fluid | Columns stretch, gutters and margins fixed | Marketing pages, dashboards, anything content-led that should fill the viewport |
| Fixed | Columns and gutters fixed, margins absorb the change | Forms, articles, checkout, anything where stretching hurts readability |

A login form on a fluid grid becomes a 1200px wide input. That is the whole
argument for fixed grids.

## Building a column grid

Default to 12 columns. It divides by 6, 4, 3, 2 and 1. Never use 5, 7 or 11:
they only divide by themselves, so no even sub-layouts exist.

```
content = screen_width - (columns - 1) x gutter - 2 x margin
column  = content / columns
```

Worked example at 1440 with 12 columns, 20pt gutters, 160pt margins:

```
1440 - (11 x 20) - (2 x 160) = 900
900 / 12 = 75pt per column
```

Round up to a whole number if it does not divide cleanly. In Figma, only the
column count, gutter and margin need entering; the tool derives the rest.

Sketch a rough wireframe before committing to a column count. Two minutes of
boxes will tell you whether 12 is overkill.

## Mobile layout

Do not port the column grid down. Mobile needs two things:

1. **Margins**: 20 or 24pt. This is safe space. Nothing lives in it.
2. **A spacing scale**: base 4pt, so 4, 8, 12, 16, 20, 24, 28, 32 and up.

If a column grid genuinely helps a mobile layout, use 2 columns, occasionally 4.

## Spacing scales: hard vs soft

- **Hard grid**: every dimension and every gap snaps to the base unit. Rigid,
  slow, and fights real content.
- **Soft grid**: gaps come from the scale, element sizes do not have to. This is
  the default. Same consistency, far less friction.

Pick one and stay in it. If you keep needing a value between two scale steps,
the base is wrong: halve it rather than improvising exceptions.

Base 8pt for desktop, base 4pt for mobile. Larger steps can grow by 8 or 16 once
past roughly 48.

## Alignment

- Align text to **baselines**, not bounding boxes and not vertical centers. Two
  labels at different sizes centered against each other are visibly wrong once
  you draw the baseline.
- When stacking two text blocks with different line heights, align on the
  baseline of their first lines.
- Aligned elements read as related. Deliberate misalignment is a strong signal,
  so use it rarely and never by accident.

## White space

The most reliably underused property in UI.

- **Start too loose, then tighten.** Adding space to a cramped layout ends at
  "good enough". Removing it from a loose one ends at correct.
- **Do not fill space because it is empty.** Empty space is what makes the
  remaining content readable. A desktop form surrounded by nothing is fine.
- **Keep away from the edges.** Text never touches the viewport boundary. Only
  nav bars, footers and full-bleed media reach the edge.
- **Unbox product photos.** Cutting the background out of product shots buys
  white space for free on commerce layouts.
- Too much space is possible: it is reached when related elements stop reading as
  a group. That is the only real limit.

If a stakeholder asks to fill white space: show a respected competitor doing the
same thing, then explain that filling it moves attention away from the thing
they want clicked. If that fails, a soft background tint or an abstract shape
satisfies the request without adding noise.
