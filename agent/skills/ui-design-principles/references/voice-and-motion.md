# Personality, language and motion

## Personality

The connective layer. Typeface, color, radius, imagery and copy all move the
same dial, and a design fails when they disagree: a serif face over saturated
colors and cartoon illustration reads as confused, not eclectic.

Decide the position first, then choose assets that agree.

| Lever | Playful | Serious |
| --- | --- | --- |
| Saturation | High | Muted, low |
| Typeface | Rounded or geometric sans | Serif or neutral grotesque |
| Corner radius | Large, pill | Small or zero |
| Icon style | Rounded, filled | Sharp, line |
| Imagery | Illustration | Photography |
| Copy | Contractions, direct address, humor | Full forms, restrained, precise |

Three reference positions:

- **Playful**: vibrant, rounded, illustrated, informal. Consumer, young
  audiences, education, games. Wrong for anything that needs to be trusted with
  money.
- **Serious**: muted, sharp, photographic, formal. Finance, legal, health,
  luxury. Wrong for anything that needs to feel approachable.
- **Neutral**: unstyled, high legibility, minimal decoration. Safe anywhere,
  evokes nothing in particular. The correct choice for most tools and the
  default for B2B software.

The decision is about the audience, never about the designer's taste. Personal
preference is the most common reason a design misses its market.

## Microcopy

Long-form copy belongs to a copywriter. Microcopy, meaning buttons, labels,
dialogs, empty states and errors, belongs to the designer and nobody else will
write it.

### Buttons

Name the outcome. Specific, but not a sentence.

| Weak | Better | Too much |
| --- | --- | --- |
| Next | Next step | Go to the next step |
| Favorite | Add to favorites | Add this product to favorites |
| Submit | Create account | Submit my account creation form |

### Dialogs

Never create a double negative. "Cancel your subscription?" answered by
[Cancel] [Yes] is unusable: both buttons mean cancel.

Label the buttons with the actions themselves:

```
Cancel your subscription?
[ Keep subscription ]  [ Cancel subscription ]
```

Where space allows, name the specific object: "Delete invoice-2026-03.pdf?"
removes any doubt about what is being destroyed.

### Errors

Say what happened and what to do about it. "No internet connection" is a
statement. "No internet connection. Try restarting your router." is help.

### Tone

Contractions ("that's", "don't") read human. Drop them for formal products.
Prefer plain words over sophisticated ones: the goal is comprehension by
everyone, not admiration by a few.

### Never ship lorem ipsum

Placeholder Latin hides every real problem: length, tone, line breaks, whether
the layout survives a long product name. Write plausible content, even if it is
throwaway. For long-form regions, paste real text from a comparable published
article and tell the client it is placeholder.

## Motion

### Animation vs microinteraction

- **Animation**: happens on its own. Ambient, decorative, or transitional.
- **Microinteraction**: responds to a deliberate user action. It is feedback, and
  feedback is the point.

Almost all valuable motion in a product is the second kind. A like turning red,
a switch sliding, a tab icon filling, a skeleton loader, a toast confirming a
send. Each one answers "did that work?".

### Duration

- Typical: 150 to 300ms.
- Ceiling: 1000ms. Past that the interface feels slow no matter how pretty.
- Never extend a duration so an animation can be admired. The user is trying to
  get somewhere.

### Easing

| Curve | Behavior | Use |
| --- | --- | --- |
| Linear | Constant speed | Progress indicators and loops only. Nothing in the physical world moves this way |
| Ease out | Fast start, slow finish | Entrances and most UI responses. Feels immediate |
| Ease in | Slow start, fast finish | Exits, elements leaving the screen |
| Ease in out | Slow at both ends | Movement between two on-screen positions |

Ease out is the default for anything responding to input, because the interface
appears to react instantly and then settle.

### What to animate

State changes users cause: toggles, checkboxes, tab switches, button hover and
press, card hover elevation, content loading, submission confirmation.

### What to avoid

Dribbble-grade motion mostly does not ship. Complex 3D and long choreographed
sequences are expensive to build, heavy to load, and slow on the devices most
users have. Motion that ships is short, cheap and constant.
