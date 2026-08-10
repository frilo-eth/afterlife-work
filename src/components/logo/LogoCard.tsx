'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Skull } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listItem, respond } from '@/lib/motion'

interface LogoCardProps {
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
  title,
  thumbnail,
  tags,
  isNearest = false,
  onSelect
}: LogoCardProps) {
  const label = formatTitle(title)

  return (
    <motion.button
      type="button"
      variants={listItem}
      onClick={onSelect}
      aria-label={`View ${label}`}
      // The lift is the proximity signal: the nearest card rises before it is
      // clicked, so aim is corrected during the approach. Scale is deliberately
      // tiny — this is a hint, not an event.
      animate={{ y: isNearest ? -4 : 0, scale: isNearest ? 1.01 : 1 }}
      transition={respond}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border text-left',
        'bg-card transition-colors',
        isNearest ? 'border-foreground/25' : 'border-border'
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
    </motion.button>
  )
}
