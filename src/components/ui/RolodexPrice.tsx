'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/utils'

interface RolodexPriceProps {
  value: string
  className?: string
}

/**
 * Character-by-character vertical reel. When the tier pill slides, each glyph
 * that changed rolls out of the old slot and into the new one — a rolodex,
 * not a fade. Shared width from tabular numerals keeps neighbouring digits
 * from shifting the line as they flip.
 */
export function RolodexPrice({ value, className }: RolodexPriceProps) {
  return (
    <span
      aria-live="polite"
      className={cn('inline-flex items-baseline tabular-nums tracking-tight', className)}
    >
      {value.split('').map((char, index) => (
        <span
          key={index}
          className="relative inline-block overflow-hidden"
          style={{ height: '1.15em' }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={char}
              initial={{ y: '70%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-70%', opacity: 0 }}
              transition={spring.moderate}
              className={cn(
                'inline-block',
                // Non-digit glyphs ($, commas) still need a box so the reel
                // height stays consistent across the whole price string.
                char === ' ' ? 'w-[0.25em]' : undefined,
              )}
            >
              {char === ' ' ? '\u00a0' : char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
