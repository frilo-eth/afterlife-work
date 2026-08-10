/**
 * App-level motion vocabulary.
 *
 * The spring tiers themselves come from the @fluid registry (lib/springs),
 * so timing stays consistent with the components installed from it. This file
 * only adds what the registry does not ship: page-level variants for lists and
 * surfaces, expressed in terms of those tiers.
 *
 * Fluid Functionalism treats motion as information — every transition should
 * say something about state, direction, or causality. Anything that moves
 * without saying something is noise, and noise buries the signal.
 */

import type { Variants } from 'framer-motion'
import { spring } from './springs'

/**
 * List entrance. The stagger encodes reading order: items resolve in the order
 * you would read them, with a delay short enough to read as one gesture rather
 * than a queue.
 */
export const list: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.02 }
  }
}

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: spring.moderate }
}

/**
 * Surfaces that appear over the page. The small upward travel communicates
 * origin; it is not decoration. Exits are quicker than entrances — nobody
 * waits to leave.
 */
export const surface: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: spring.moderate },
  exit: { opacity: 0, y: 4, transition: { duration: spring.moderate.exit.duration } }
}
