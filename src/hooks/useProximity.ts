'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseProximityOptions {
  /**
   * How far outside an element the pointer can be and still select it, in
   * pixels. Roughly a thumb's width — large enough to forgive an imprecise
   * approach, small enough that the nearest item is unambiguous.
   */
  radius?: number
  /** Set false to disable, e.g. for coarse pointers. */
  enabled?: boolean
}

/**
 * Tracks which child of a container the pointer is closest to.
 *
 * Fluid Functionalism calls for the nearest target to announce itself before
 * it is clicked, so aiming is corrected during the approach rather than after
 * a mis-click. Hover alone cannot do this: it only fires once the pointer is
 * already inside the box, which is too late to help.
 *
 * Returns the index of the nearest element, or null when the pointer is
 * beyond `radius` of everything.
 *
 * Only pointer devices that actually hover get this. On touch there is no
 * cursor to be near with, and firing it on tap would highlight an item the
 * user is already committing to.
 */
export function useProximity(
  itemCount: number,
  { radius = 120, enabled = true }: UseProximityOptions = {}
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [nearestIndex, setNearestIndex] = useState<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const clear = useCallback(() => setNearestIndex(null), [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled || itemCount === 0) return

    // Coarse pointers and reduced-motion users opt out.
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || !wantsMotion) return

    const handleMove = (event: PointerEvent) => {
      // Coalesce to one measurement per frame; pointermove outruns paint.
      if (frameRef.current !== null) return

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null

        const children = Array.from(container.children) as HTMLElement[]
        let closest: number | null = null
        let closestDistance = radius

        children.forEach((child, index) => {
          const rect = child.getBoundingClientRect()

          // Distance from the pointer to the rectangle, not to its centre:
          // a wide card should not lose to a small one just because its
          // midpoint sits further away.
          const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right)
          const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom)
          const distance = Math.hypot(dx, dy)

          if (distance < closestDistance) {
            closestDistance = distance
            closest = index
          }
        })

        setNearestIndex(prev => (prev === closest ? prev : closest))
      })
    }

    container.addEventListener('pointermove', handleMove)
    container.addEventListener('pointerleave', clear)

    return () => {
      container.removeEventListener('pointermove', handleMove)
      container.removeEventListener('pointerleave', clear)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [itemCount, radius, enabled, clear])

  return { containerRef, nearestIndex }
}
