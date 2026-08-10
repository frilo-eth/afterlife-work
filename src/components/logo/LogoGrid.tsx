'use client'

import { useEffect, useRef } from 'react'
import { LogoCard } from './LogoCard'
import { useProximityHover } from '@/hooks/use-proximity-hover'

// Only the fields the card actually renders. Kept structural so both the
// public catalog's trimmed rows and the admin's full Logo records satisfy it.
interface LogoGridItem {
  id: string
  title: string
  thumbnail: string
  tags: string[]
}

interface LogoGridProps {
  logos: LogoGridItem[]
  onLogoPress?: (id: string) => void
}

export function LogoGrid({ logos, onLogoPress }: LogoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // axis "xy" resolves the nearest card across rows and columns, which is what
  // a wrapping grid needs — a single-axis search picks the wrong card as soon
  // as the pointer sits between two rows.
  // axis "xy" resolves the nearest card across rows and columns, which is what
  // a wrapping grid needs — a single-axis search picks the wrong card as soon
  // as the pointer sits between two rows.
  const { activeIndex, handlers, registerItem, measureItems } = useProximityHover(
    containerRef,
    { axis: 'xy' }
  )

  // The grid reflows on resize and whenever filters change the item count.
  useEffect(() => {
    measureItems()
  }, [measureItems, logos.length])

  if (!logos?.length) {
    return null
  }

  return (
    <div
      ref={containerRef}
      {...handlers}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {logos.map((logo, index) => (
        <LogoCard
          key={logo.id}
          index={index}
          registerItem={registerItem}
          title={logo.title}
          thumbnail={logo.thumbnail}
          tags={logo.tags}
          isNearest={index === activeIndex}
          onSelect={() => onLogoPress?.(logo.id)}
        />
      ))}
    </div>
  )
}
