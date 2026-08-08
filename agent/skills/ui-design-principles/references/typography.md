# Typography

## Selecting a typeface

Four tests, in order. A typeface has to pass all four.

1. **Legible.** Simple construction. If the letterforms are the interesting part
   of the screen, the copy is losing.
2. **Scalable.** Readable at 12pt, still composed at 72pt. Test both ends before
   committing.
3. **Enough weights.** 4 or 5 minimum. Fewer and no real hierarchy can be built.
4. **On personality.** Geometric and neo-grotesque sans read modern and neutral.
   Serifs read editorial, formal, or established. Script and handwritten fail as
   primary faces, always.

Sans serif is the default for interfaces. Serif is legitimate for long-form
reading or when the brand calls for it. Never pick a face because the client
likes it: pick it because it matches who is using the product.

## How many

One. A single family with a good weight range covers heading, body, label and
data. Two families means a rule about which goes where, and that rule will be
broken.

If two are unavoidable, make them obviously different (a geometric sans with a
high-contrast serif). Two similar sans faces read as a mistake, not a pairing.

## Building the scale

Modular ratios (golden, major third) produce beautiful scales with unusable
gaps. A 1.618 ratio jumps 16 to 26 and leaves nothing at 18 or 20, which is
exactly where interface text lives.

Build it by hand instead:

1. Set base at 16pt (17 on iOS, 16 on Android and web).
2. Step by 2 down to 10 and up to 20: `10 12 14 16 18 20`.
3. Step by 4 above that: `24 28 32`.
4. Step by 8 for display sizes if needed: `40 48`.

Result: dense where UI needs precision, sparse where it does not. Freeze it
before designing screens.

## Line height

- Body: `size x 1.6`, rounded.
- Mid headings (roughly 20 to 28): `x 1.3`.
- Display (32 and up): `x 1.0` to `x 1.1`.

**Match parity.** Even font size takes an even line height, odd takes odd.
Otherwise the text sits off-center inside its box by half a point, which
compounds across a layout.

12pt body becomes 19.2, so round to 20. Not 19.

## Measure

50 to 60 characters per line is the target. 70 is the ceiling. Past that, the
eye loses the line return.

Watch for rags: alternating long and short line endings force extra work on the
return. Centered text rags on both sides, which is why it only works for short
runs of two or three lines.

## Tracking

Default is 0 and it is usually correct.

- Large headings: -1% to -3% tightens the display sizes.
- All caps: +5% to +10%, since caps have no descender variety to help the eye.
- Body: leave it alone. Both directions hurt readability.

## Alignment

- **Left** for anything read left to right. Safe by default.
- **Center** only for short text: a hero line, an empty state, a dialog.
- **Right** only for cultural reasons or for numeric columns.
- **Justified** essentially never in UI. Rivers open up without hyphenation
  control.

## Weight as hierarchy

Size is not the only lever, and it is the expensive one. A 16pt Bold heading over
14pt Regular body creates hierarchy in less vertical space than a 28pt Regular
heading does.

**Skip a weight when pairing.** Regular body pairs with Bold heading, not with
Medium. Medium body pairs with ExtraBold. One step of difference is not read as
intentional.

Never use Light below body size. It looks refined at 48pt and turns to mush at
14pt.

Assign weights to the scale up front, so nothing is decided per screen:

```
12 Regular    caption, metadata
14 Regular    secondary body
16 Medium     body, inputs, button labels
20 SemiBold   section heading
28 Bold       page heading
```
