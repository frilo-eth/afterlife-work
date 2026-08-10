'use client'

import { ArrowRight, Skull } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LogoCardProps {
  /** Position in the grid, used to register with proximity tracking. */
  index: number
  registerItem: (index: number, element: HTMLElement | null) => void
  id: string
  title: string
  thumbnail: string
  tags: string[]
  /** True when this card is the pointer's nearest target. */
  isNearest?: boolean
}

const formatTitle = (title: string) =>
  title
    .replace(/[_\s]placeholder\d*.*$/, '')
    .replace(/^Logo_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

export function LogoCard({
  index,
  registerItem,
  id,
  title,
  thumbnail,
  tags,
  isNearest = false,
}: LogoCardProps) {
  const label = formatTitle(title)
  const ref = useRef<HTMLAnchorElement>(null)

  // Register with the grid's proximity tracker so it can measure this card.
  useEffect(() => {
    registerItem(index, ref.current)
    return () => registerItem(index, null)
  }, [index, registerItem])

  return (
    <Link
      ref={ref}
      href={`/${id}`}
      prefetch
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
          isNearest ? 'border-border-strong' : 'border-border',
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

        {/*
          Soft circle affordance — same geometry as the email submit control,
          but secondary fill so it doesn't compete with the mark itself.
        */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-3 right-3',
            'inline-flex h-9 w-9 items-center justify-center rounded-lg',
            'border border-border bg-card/80 text-foreground-muted backdrop-blur-sm',
            'transition-opacity duration-quick ease-settle',
            isNearest ? 'opacity-100' : 'opacity-0',
          )}
        >
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-label font-medium text-foreground">{label}</h3>
        <span className="shrink-0 text-caption text-foreground-subtle">
          {tags.slice(0, 2).join(' · ')}
        </span>
      </div>
    </Link>
  )
}
