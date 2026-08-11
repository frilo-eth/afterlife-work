'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Elevated } from '@/lib/elevated'
import { useShape } from '@/lib/shape-context'
import { exitFallbackMs, spring } from '@/lib/springs'
import { normalizeTwitterHandle } from '@/lib/slug'
import { cn } from '@/lib/utils'

export type DesignerHoverData = {
  name: string
  email?: string | null
  twitter?: string | null
  website?: string | null
  logos: { id: string; slug?: string; title: string; thumbnail: string }[]
}

function isFrilo(designer: DesignerHoverData): boolean {
  const haystack = [designer.name, designer.email, designer.website]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes('frilo')
}

/**
 * Signature name → floating profile: avatar, username, X handle, logos.
 */
export function DesignerHoverCard({
  designer,
  className,
}: {
  designer: DesignerHoverData
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const shape = useShape()
  const handle = normalizeTwitterHandle(designer.twitter)
  const frilo = isFrilo(designer)
  const initial = designer.name.trim().charAt(0).toUpperCase() || '?'
  const logos = designer.logos.slice(0, 3)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (open) return
    const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.fast))
    return () => clearTimeout(id)
  }, [open])

  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={200}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              'text-foreground transition-opacity duration-80 hover:opacity-70',
              'outline-none focus-visible:opacity-70',
              className,
            )}
          >
            {designer.name}
          </button>
        </TooltipPrimitive.Trigger>

        {mounted ? (
          <TooltipPrimitive.Portal forceMount>
            <TooltipPrimitive.Content
              side="top"
              align="start"
              sideOffset={10}
              forceMount
              className="z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                animate={{
                  opacity: open ? 1 : 0,
                  scale: open ? 1 : 0.96,
                  y: open ? 0 : 4,
                }}
                transition={open ? spring.fast : spring.fast.exit}
                onAnimationComplete={() => {
                  if (!open) setMounted(false)
                }}
              >
                <Elevated
                  offset={2}
                  className={cn('w-64 overflow-hidden border border-border p-3', shape.container)}
                >
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-1">
                      {frilo ? (
                        <Image
                          src="/frilo-avatar.jpg"
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="h-full w-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-label text-foreground-muted">
                          {initial}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-label font-medium text-foreground">
                        {designer.name}
                      </p>
                      {handle ? (
                        <a
                          href={`https://x.com/${handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-caption text-foreground-subtle transition-colors duration-80 hover:text-foreground"
                        >
                          @{handle}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {logos.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 gap-1">
                      {logos.map((logo) => (
                        <Link
                          key={logo.id}
                          href={`/${logo.slug || logo.id}`}
                          className="relative aspect-square overflow-hidden rounded-md bg-surface-1"
                          onClick={() => setOpen(false)}
                        >
                          {logo.thumbnail ? (
                            <Image
                              src={logo.thumbnail}
                              alt={logo.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </Elevated>
              </motion.div>
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        ) : null}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
