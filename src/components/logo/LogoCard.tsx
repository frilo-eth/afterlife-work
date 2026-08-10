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
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border text-left',
        // Prerendered content must be visible without JavaScript, so there is
        // no entrance animation here — a fade-in would hide the catalog until
        // hydration and carries no information anyway. Only the proximity
        // signal moves, and it degrades to "no lift" if JS never arrives.
        'bg-card will-change-transform',
        'transition-[transform,border-color] duration-quick ease-settle',
        isNearest
          ? 'border-foreground/25 -translate-y-1 scale-[1.01]'
          : 'border-border translate-y-0 scale-100'
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={label}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              'object-cover transition-[filter,transform] duration-settled ease-settle',
              isNearest ? 'scale-[1.03] brightness-110' : 'scale-100 brightness-100'
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <Skull className="h-12 w-12 opacity-30" />
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background/90 to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        {/*
          Weight, not size, marks the nearest card. A size change would reflow
          the row; weight reads as emphasis and costs nothing in layout.
        */}
        <h3
          className={cn(
            'mb-2 text-sm transition-[font-weight,color] duration-quick ease-settle',
            isNearest ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'
          )}
        >
          {label}
        </h3>

        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="rounded-full bg-foreground/10 px-2 py-1 text-xs text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
