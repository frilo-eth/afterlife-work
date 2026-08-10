'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Reports how many children of a row fit on a single line.
 *
 * The row renders every item; this measures them and returns the count that
 * fits alongside a trailing control, so the caller can hide the remainder.
 * A fixed count cannot do this — the same eight pills fit comfortably on a
 * desktop and wrap to three rows on a phone, and the whole purpose of the
 * overflow control is that the row never wraps.
 *
 * Measurement runs against the rendered items rather than an estimate, so it
 * stays correct when a label is long, the font loads late, or the user zooms.
 */
export function useRowOverflow(itemCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trailingRef = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState(itemCount)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const items = Array.from(container.children).filter(
      child => child.getAttribute('data-row-item') === 'true'
    ) as HTMLElement[]

    if (items.length === 0) return

    const styles = window.getComputedStyle(container)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0

    // Reserve room for the trailing control so it never causes the wrap it
    // exists to prevent.
    const reserved = trailingRef.current
      ? trailingRef.current.getBoundingClientRect().width + gap
      : 0

    const available = container.clientWidth - reserved

    let used = 0
    let fits = 0
    for (const item of items) {
      const width = item.getBoundingClientRect().width
      const next = fits === 0 ? width : used + gap + width
      if (next > available) break
      used = next
      fits += 1
    }

    // Showing a single pill next to "All tags" is worse than showing none;
    // below two, the row reads as broken rather than truncated.
    setVisibleCount(previous => {
      const resolved = fits < 2 && items.length > 1 ? 0 : fits
      return previous === resolved ? previous : resolved
    })
  }, [])

  useEffect(() => {
    measure()

    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(container)

    // Labels shift when the webfont swaps in, which changes what fits.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(measure).catch(() => {})
    }

    return () => observer.disconnect()
  }, [measure, itemCount])

  return { containerRef, trailingRef, visibleCount, remeasure: measure }
}
