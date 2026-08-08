# Color

## Vocabulary

- **Hue**: the color itself.
- **Saturation**: pure color at 100, gray at 0.
- **Lightness**: black to white.
- **Shade**: hue plus black, so lower lightness.
- **Tint**: hue plus white, so higher lightness.

## Start with neutrals

Design the screen in white, near-black and gray first. Color applied to a
structure that already works is a decision. Color applied to fix a structure
that does not work is a patch.

**Never use #000000 for text.** The contrast against white is harsher than the
eye wants. Use a near-black from the neutral scale.

## Choosing the primary

Color carries meaning before anyone reads a word. Pick on audience, not taste.

| Hue | Reads as | Common in | Watch for |
| --- | --- | --- | --- |
| Blue | Trust, calm, security | Finance, social, enterprise | The most used hue in software, hard to stand out |
| Red | Urgency, energy, appetite | Media, sports, entertainment | Collides with error states |
| Yellow | Optimism, warmth, visibility | Food, travel, creative | Painful at high saturation on light backgrounds |
| Orange | Enthusiasm, action | Commerce, sports, creative | Collides with warning states |
| Green | Health, growth, nature | Fitness, banking, food | Collides with success states |
| Purple | Premium, rare, distinctive | Luxury, tech, entertainment | Rare in nature and in UI, which is exactly why it stands out |

If the primary hue collides with a semantic color, shift the semantic hue enough
to separate them while keeping it obviously green, amber or red.

## Building the palette

Do this once per project, before screens.

1. **Primary.** Buttons, links, focus rings, selected states, active nav.
2. **Secondary (optional).** Secondary actions. Most projects do not need one.
3. **Semantic.** Success (green), warning (amber or orange), error (red). Also
   define their tint backgrounds for banners.
4. **Tints.** Raise lightness in 10% steps for backgrounds, hover fills and
   selected rows. Use 5% steps only where a real need appears.
5. **Shades.** Lower lightness in 10% steps for pressed states, text on tinted
   backgrounds, borders.
6. **Neutrals.** Take the primary hue, set saturation to about 20 and lightness
   to 10 for the darkest neutral, then step lightness up by 10 to white. A
   trace of the primary hue keeps grays warm or cool in agreement with the
   brand. Set saturation to 0 if a truly neutral gray is wanted.
7. **Assign roles.** Write down what each color is for: primary for the main
   action, darkest neutral for headings, mid neutral for body, lightest for
   surfaces. The 60/30/10 rule is not useful here, since a real palette has more
   than three colors and the split just restates "background, text, accent".

Most of a good interface is neutral. The palette is mostly grays with one hue
doing the work.

## What not to do

Four-swatch generator palettes fail in production. They lack neutrals, lack
tints and shades, carry no reasoning about audience, and look wrong the moment
they meet real UI. They are inspiration, not systems.

Monochromatic palettes (one hue plus its tints and shades) are the most reliable
starting point: tints for surfaces, the hue for actions, shades for text. Nothing
competes.

## Contrast and accessibility

- Body text: 4.5:1 minimum.
- Large text (roughly 24pt, or 19pt bold) and UI component boundaries: 3:1.
- Roughly 1 in 20 people have some form of color vision deficiency, so color can
  never be the only carrier of meaning. Pair it with an icon, a label or a shape.
- Check contrast in the design tool, not by eye. A screen that reads fine on a
  calibrated display can be unusable on an old phone in daylight.
- Disabled states are exempt from contrast minimums, but if users have to guess
  whether a control is disabled or just low contrast, it has failed anyway.
