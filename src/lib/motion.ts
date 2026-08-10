/**
 * Motion vocabulary for the interface.
 *
 * Fluid Functionalism treats motion as information: every transition should
 * tell the user something about state, direction, or causality. Anything that
 * moves without saying something is noise, and noise makes the signal harder
 * to read.
 *
 * Two rules follow from that, and they are why this file exists:
 *
 * 1. Springs, not durations, for anything a user can interrupt. A duration
 *    based tween has to finish or snap; a spring absorbs a reversal mid flight
 *    and carries its existing velocity into the new direction, so a user who
 *    changes their mind sees the interface change its mind with them.
 *
 * 2. One named transition per kind of meaning. Naming these after intent
 *    rather than shape keeps call sites honest — you pick a spring because the
 *    element is arriving, not because 260 looked about right.
 */

import type { Transition, Variants } from 'framer-motion'

/** Something entering, expanding, or settling into a resting position. */
export const settle: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.9
}

/** A direct response to a pointer or key — fast, barely any overshoot. */
export const respond: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.6
}

/** Something leaving. Exits are quicker than entrances; nobody waits to leave. */
export const dismiss: Transition = {
  type: 'tween',
  duration: 0.14,
  ease: [0.32, 0.72, 0, 1]
}

/**
 * Standard enter/exit for surfaces that appear over the page.
 * The small upward travel communicates origin; it is not decoration.
 */
export const surface: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: settle },
  exit: { opacity: 0, y: 4, transition: dismiss }
}

/**
 * List entrance. The stagger encodes reading order — items resolve in the
 * order you would read them, which is why the delay is small enough to feel
 * like one gesture rather than a queue.
 */
export const list: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.02 }
  }
}

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: settle }
}

/**
 * Font weight as feedback.
 *
 * Weight shifts read as emphasis without moving anything, so they signal
 * "this is the one" during keyboard or proximity navigation without the
 * layout shift that a size change would cause. Requires a variable font to
 * interpolate smoothly; it degrades to a step change otherwise.
 */
export const weightShift = {
  rest: { fontVariationSettings: '"wght" 400' },
  active: { fontVariationSettings: '"wght" 620' }
} as const
