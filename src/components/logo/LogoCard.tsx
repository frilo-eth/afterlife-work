'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Skull } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoCardProps {
  /** Position in the grid, used to register with proximity tracking. */
  index: number
  registerItem: (index: number, element: HTMLElement | null) => void
  title: string
  thumbnail: string
  tags: string[]
  /** True when this card is the pointer's nearest target. */
  isNearest?: boolean
  onSelect: () => void
}

const formatTitle = (title: string) =>
  title
    .replace(/[_\s]placeholder\d*.*$/, '')
    .replace(/^Logo_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

export function LogoCard({
  index,
  registerItem,
  title,
  thumbnail,
  tags,
  isNearest = false,
  onSelect
}: LogoCardProps) {
  const label = formatTitle(title)
  const ref = useRef<HTMLButtonElement>(null)

  // Register with the grid's proximity tracker so it can measure this card.
  useEffect(() => {
    registerItem(index, ref.current)
    return () => registerItem(index, null)
  }, [index, registerItem])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-label={`View ${label}`}
      className="group block w-full text-left"
    >
      {/*
        Title and tags sit below the frame rather than over it. Overlaying them
        required a gradient scrim to keep the text legible, which dimmed the one
        thing the card exists to show.
      */}
      <div
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-card',
          'transition-colors duration-quick ease-settle',
          isNearest ? 'border-border-strong' : 'border-border'
        )}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={label}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <Skull className="h-12 w-12 text-foreground-subtle" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {/*
          Weight marks the nearest card. A size change would reflow the row;
          weight reads as emphasis and costs nothing in layout.
        */}
        <h3
          className={cn(
            'text-label text-foreground transition-[font-weight] duration-quick ease-settle',
            isNearest ? 'font-semibold' : 'font-medium'
          )}
        >
          {label}
        </h3>
        <span className="text-caption text-foreground-subtle">
          {tags.slice(0, 2).join(' · ')}
        </span>
      </div>
    </button>
  )
}
