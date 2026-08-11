'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { STATUS_BADGE_COLOR, STATUS_LABEL } from '@/components/admin/LogoStatusDropdown'
import { Badge } from '@/components/ui/badge'
import { Elevated } from '@/lib/elevated'
import { useShape } from '@/lib/shape-context'
import { exitFallbackMs, spring } from '@/lib/springs'
import { cn } from '@/lib/utils'
import type { LogoStatus } from '@/types'

interface LogoThumbnailHoverProps {
  src: string
  title: string
  /** Marketplace status — shown as a Fluid badge on the floating card. */
  status?: LogoStatus
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Table thumb that opens a floating preview card on hover.
 * Works for any status (including HIDDEN) — admin can inspect without a public page.
 */
export function LogoThumbnailHover({
  src,
  title,
  status,
  size = 'md',
  className,
}: LogoThumbnailHoverProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const shape = useShape()
  const thumb = size === 'sm' ? 32 : 40

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (open) return
    const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.fast))
    return () => clearTimeout(id)
  }, [open])

  return (
    <TooltipPrimitive.Provider delayDuration={180} skipDelayDuration={200}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              'relative shrink-0 overflow-hidden rounded-md border border-border',
              'transition-[border-color] duration-80 hover:border-border-strong',
              'outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]',
              size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
              className,
            )}
            aria-label={`Preview ${title}${status ? ` (${STATUS_LABEL[status]})` : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt=""
              width={thumb}
              height={thumb}
              className="h-full w-full object-cover"
            />
          </button>
        </TooltipPrimitive.Trigger>

        {mounted && (
          <TooltipPrimitive.Portal forceMount>
            <TooltipPrimitive.Content
              side="right"
              align="center"
              sideOffset={12}
              forceMount
              className="z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, x: -4 }}
                animate={{
                  opacity: open ? 1 : 0,
                  scale: open ? 1 : 0.96,
                  x: open ? 0 : -4,
                }}
                transition={open ? spring.fast : spring.fast.exit}
                onAnimationComplete={() => {
                  if (!open) setMounted(false)
                }}
              >
                <Elevated
                  offset={2}
                  className={cn('w-56 overflow-hidden border border-border p-0', shape.container)}
                >
                  <div className="relative aspect-square bg-card">
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="224px"
                      className="object-cover"
                      priority={open}
                    />
                  </div>
                  <div className="space-y-2 border-t border-border px-3 py-2.5">
                    <p className="truncate text-label text-foreground">{title}</p>
                    {status && (
                      <Badge variant="dot" color={STATUS_BADGE_COLOR[status]} size="sm">
                        {STATUS_LABEL[status]}
                      </Badge>
                    )}
                  </div>
                </Elevated>
              </motion.div>
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        )}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
