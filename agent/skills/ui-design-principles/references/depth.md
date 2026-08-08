# Depth: shadows and gradients

## Shadows

A shadow is a claim about elevation. Only things that are actually raised or
actually interactive get to make it.

**Anatomy**: X offset, Y offset, blur, opacity, color.

### Rules

- **Soft, not hard.** High blur, low opacity (5 to 10%), positive Y. The default
  `0 4 4 25%` in every design tool is the tell of an untouched shadow.
- **Never pure black.** Black shadows look like dirt. Use a dark neutral from
  the palette, or the element's own hue darkened, which is what makes colorful
  buttons pop.
- **Elevation is a scale, not a value.** Define three or four levels and reuse
  them: resting card, hovered card, dropdown, modal. Higher elevation means
  larger Y and larger blur, not higher opacity.
- **Interactive things only.** Cards, buttons, menus, modals. Never on plain
  text, never on disabled controls, never on decorative shapes.
- **One exception on text**: a very subtle shadow behind button label text can
  rescue contrast on a bright filled button. Fixing the button color is better.
  Use the shadow only when the color is locked.

### Inner shadows

Almost always wrong. They read as a hole, which suggests something is recessed
and non-interactive. The rare legitimate case is a track: a slider groove, a
toggle channel, an inset well.

### Dark mode

Shadows barely register on dark surfaces, and light shadows read as glow, not
elevation. **Elevate with lighter surface color instead.** Higher elevation means
a lighter fill, stepping up through the neutral scale. Keep a real shadow only
for large floating surfaces like modals, and keep it very subtle.

## Gradients

Everything under light in the physical world is a gradient. That is why a
gradient reads as more real than a flat fill, and why a gradient element pulls
attention.

### Types

| Type | Notes |
| --- | --- |
| Linear | The workhorse. Backgrounds, buttons, scrims |
| Radial | Reads as a light source. Good for glows and faux-3D on rounded shapes |
| Angular / conic | Rare in product UI. Distracting unless it is the brand |
| Mesh | Decorative, generated. Backgrounds only, and sparingly |

### Making a good one

The reliable method: take one color, duplicate it, then shift the hue of the
copy by roughly 20 to 25. Small hue distance means a smooth blend.

Failure signature: two distant hues produce a desaturated gray band through the
middle where they cross. If the midpoint of a gradient looks muddy, the endpoints
are too far apart. Bring them closer or push the midpoint stop to one side.

### Restraint

Gradients earn attention because they are unusual on a screen. Put one on
everything and that advantage disappears, along with any hierarchy. One gradient
per view is usually the budget: the primary action, or the hero surface, not
both.
