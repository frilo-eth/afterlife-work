# Components

## Buttons

### Hierarchy of action, not of style

- **CTA**: the reason the page exists. Filled, primary color, largest. One per
  view.
- **Primary**: moves the user forward inside a flow. Continue, Save, Download.
  Filled.
- **Secondary**: the alternative the user might still want. Back, Cancel. Outline
  or tinted.
- **Tertiary**: situational, low frequency. Share, Bookmark. Text or icon, small.
- **VIB (very important button)**: any action that takes money, deletes data or
  is otherwise irreversible. It gets an explicit label and often a line of
  supporting copy. "Complete purchase", never "Continue".

Style follows importance: filled for CTA and primary, outline or tinted for
secondary, text for tertiary.

### Numbers

| Property | Value |
| --- | --- |
| Height | 40 to 60pt, never under 40 |
| Label size | 16pt (13 floor, 20 ceiling) |
| Horizontal padding (web) | 32pt, or whatever the grid alignment demands |
| Width (mobile) | Full width inside the margins, in most cases |
| Tap target | 44 x 44pt minimum, even for a 16pt icon |
| Radius | Consistent across the entire product |

Radius carries personality: 0 reads formal and editorial, 8 reads neutral,
fully rounded reads friendly and consumer. Pick once.

Grid alignment beats the 32pt padding rule. A form button that does not line up
with the fields above it looks wrong regardless of its padding.

### States

Default, hover, pressed, focus, disabled, and loading if the action is async.
Missing states are the single most common reason a build feels dead compared to
its mockup. Focus is not optional: it is the keyboard user's only cursor.

### Pairs

More important on the right, less important on the left. Most people are right
handed and reach the right side of a phone more easily. Never show a "Back"
button on the first step of a flow.

### Icons in buttons

An icon plus a label scans faster than either alone. Icon only is acceptable
when the icon is universally known (close, search, menu, play). The test: name
another shipped product using that icon without a label. If you cannot, label it.

## Forms

Goal: completion rate. Every decision either raises it or lowers it.

### Structure

- **One column.** Multi-column forms create ambiguity about reading order and
  cost more than they save.
- **Ask for less.** Every field is a chance to abandon. Cut anything not needed
  right now.
- **Split past 5 fields.** Break into steps with visible progress. Same number of
  fields, much smaller apparent commitment.
- **Group semantically.** Personal details, then address, then payment, separated
  by a larger gap from the scale. The reader gets three small tasks instead of
  nine fields.
- **Mark optional, not required.** Asterisks are learned notation, "(optional)"
  is not.
- **Say why** for anything sensitive (phone number, address, date of birth). An
  info icon with a short explanation raises completion.
- **Offer social or platform sign-in** where it fits. It removes the form.

### Text fields

- Keep the label visible above the field. A placeholder is not a label: it
  disappears exactly when the user needs it. Float the placeholder up into a
  label position if vertical space is tight.
- Field width should signal expected input length. A postal code field and a
  street address field should not be the same width.
- Keep them plain: a rectangle with a border. A white field with a drop shadow
  and no border reads as a button or a card.
- Icons inside fields help scanning. Use recognizable ones.
- Search bars are not form fields. They can be styled richer and need no label.
- States: inactive, focused, filled, success, error with message, disabled.

### Choosing the right control

| Options | Control |
| --- | --- |
| 2 to 4, pick one | Radio group |
| 5 or more, pick one | Dropdown |
| Any number, pick many | Checkboxes |
| Immediate effect, no submit | Switch |
| Imprecise numeric range | Slider, paired with numeric inputs for precision |

Long dropdowns need a search field inside them and a visible scrollbar. Without
the scrollbar, users do not know more options exist.

Checkboxes and radios: 24pt visual, 44pt target, and make the adjacent label
clickable too.

### Validation

- Validate inline, as soon as a field is complete. Not on submit.
- Never clear entered data on an error. It is a developer behavior but it is a
  design failure, so specify it.
- Error messages say what is wrong and how to fix it, next to the field that
  caused it.

## Cards

A card is a compressed version of the page it links to.

**Deciding contents**: list everything on the destination page, then keep only
what helps someone decide whether to open it. For a recipe: photo, title, time,
servings, difficulty. Not the ingredient list. More information is not more
useful, it is a harder scan.

**Anatomy**: media, heading, one line of supporting text, one data point (price,
date, rating), one action (button or icon).

**Rules**

- Cards must look clickable. Subtle elevation, a border, or a surface fill
  different from the background. Add a hover state.
- Test with hostile content: the longest title, no image, no description, a
  missing price. Specify truncation limits and a placeholder graphic.
- Build size variants up front (large, compact, list row) rather than squeezing
  one card into every context.
- One card style per product. Mixing shadowed, outlined and filled cards on one
  page reads as three different designers.

## Icons

- **Use a pack, not individual icons.** Consistency in stroke width, corner
  radius, optical size and level of detail is nearly impossible to reconstruct
  from mixed sources. If one icon must come from elsewhere, redraw it to match
  the stroke width and roundness of the set.
- **Bounding box** of 24 x 24pt is standard. Resize the box, not the glyph, so
  optical sizes stay consistent.
- **Two roles**: clarifying (labels a category or feature, not interactive) and
  interactive (it is a button, so it needs a 44pt target and a hover state).
- **Simple survives.** Detail that reads at 48pt turns to noise at 16pt. Test
  small before choosing.
- **Line vs filled**: both are safe. A common pattern is filled for the active
  nav item, line for the inactive ones. Do not mix styles otherwise.
- **Match stroke weight to text weight** when the icon set allows it. A 1.5pt
  stroke next to Medium text looks intentional. Do not distort an icon just to
  achieve this.
- **Label anything not universal.** Users learn icons the way they learn road
  signs, and a label is the lesson.

## Navigation

Three kinds, and most products use all three:

| Type | Form | Capacity |
| --- | --- | --- |
| Visible | Tab bar (mobile), text tabs or sidebar (desktop) | 5 mobile, 7 desktop |
| Hidden | Hamburger menu, drawer, sidebar | 7 items, then cognitive load rises |
| Contextual | Links, tags, chips inside content | Unlimited |

Choose visible whenever the count allows. It costs screen space and buys
permanent access, which is almost always the right trade. Go hidden only when
the item count forces it or when screen space is genuinely scarce.

### Mobile tab bar

- Height 60 to 84pt. Bottom of the screen, where the thumb is.
- Divide the width evenly per item, center the icon and label in each division.
- Push content toward the top of the bar so it clears the home indicator gesture
  area on modern iPhones.
- Labels: all or none, never some. Omitting them is a space decision, not an
  aesthetic one, and labels are always the safer choice.
- Deemphasize inactive items with opacity around 35% or a neutral color, and
  mark the active one with color, fill, or both.

### Desktop

- Text tabs sit top, next to the logo, and do not span the full width.
- Buttons go last in the tab row, never between text tabs. Space them from the
  button edge, not the button's text.
- Past 7 items, use a structured dropdown mega menu rather than adding tabs.
- Vertical sidebars suit dense web applications. Space items from the spacing
  scale rather than distributing them across the full height.

### Mobile drawer

70 to 80% of screen width, over a scrim of the dark neutral at 60 to 70%
opacity. Tapping the scrim closes it, so an explicit close button is optional.
Align items to the same margin used everywhere else in the app.

### Contextual

Make it look clickable: color, weight, an underline, or a chip. A "Read more"
that looks like body text will not be found.
