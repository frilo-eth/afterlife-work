'use client'

import { motion } from 'framer-motion'
import { LogoCard } from './LogoCard'
import { useProximity } from '@/hooks/useProximity'
import { list } from '@/lib/motion'

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
  const { containerRef, nearestIndex } = useProximity(logos.length)

  if (!logos?.length) {
    return null
  }

  return (
    <motion.div
      ref={containerRef}
      variants={list}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {logos.map((logo, index) => (
        <LogoCard
          key={logo.id}
          title={logo.title}
          thumbnail={logo.thumbnail}
          tags={logo.tags}
          isNearest={index === nearestIndex}
          onSelect={() => onLogoPress?.(logo.id)}
        />
      ))}
    </motion.div>
  )
}
