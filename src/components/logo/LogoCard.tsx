'use client'

import { ArrowRight, Skull } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoCardProps {
  id: string
  /** Pretty public path — `/agave-sunshine`. Falls back to id for legacy rows. */
  slug?: string
  title: string
  thumbnail: string
  tags: string[]
}

const formatTitle = (title: string) =>
  title
    .replace(/[_\s]placeholder\d*.*$/, '')
    .replace(/^Logo_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

export function LogoCard({ id, slug, title, thumbnail, tags }: LogoCardProps) {
  const label = formatTitle(title)
  const href = `/${slug || id}`

  return (
    <Link href={href} prefetch aria-label={`View ${label}`} className="group block w-full text-left">
      {/*
        Title and tags sit below the frame rather than over it. Overlaying them
        required a gradient scrim to keep the text legible, which dimmed the one
        thing the card exists to show.
      */}
      <div
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-card',
          'border-border transition-colors duration-quick ease-settle',
          'group-hover:border-border-strong',
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
          Only on this card's hover — not gallery-wide proximity.
        */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-3 right-3',
            'inline-flex h-9 w-9 items-center justify-center rounded-lg',
            'border border-border bg-card/80 text-foreground-muted backdrop-blur-sm',
            'opacity-0 transition-opacity duration-quick ease-settle',
            'group-hover:opacity-100',
          )}
        >
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-label font-medium text-foreground">{label}</h3>
        {tags.length > 0 ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-metadata text-foreground-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
