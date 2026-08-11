'use client'

import { LogoCard } from './LogoCard'

// Only the fields the card actually renders. Kept structural so both the
// public catalog's trimmed rows and the admin's full Logo records satisfy it.
interface LogoGridItem {
  id: string
  slug?: string
  title: string
  thumbnail: string
  tags: string[]
}

interface LogoGridProps {
  logos: LogoGridItem[]
}

export function LogoGrid({ logos }: LogoGridProps) {
  if (!logos?.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          id={logo.id}
          slug={logo.slug}
          title={logo.title}
          thumbnail={logo.thumbnail}
          tags={logo.tags}
        />
      ))}
    </div>
  )
}
