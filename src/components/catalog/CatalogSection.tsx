'use client'

import { useMemo, useState } from 'react'
import { FilterBar } from '@/components/filters/FilterBar'
import { LogoGrid } from '@/components/logo/LogoGrid'
import type { CatalogLogo } from '@/lib/catalog'
import type { FilterState } from '@/lib/types'

interface CatalogSectionProps {
  logos: CatalogLogo[]
}

/**
 * Interactive half of the catalog. The logos arrive as props from the server
 * component, already filtered to AVAILABLE — this only narrows what is
 * already on screen, so there is no fetch and no loading state.
 */
export function CatalogSection({ logos }: CatalogSectionProps) {
  const [filters, setFilters] = useState<FilterState>({ styles: [], search: '' })

  // Counted from the whole catalog, not the filtered view: a tag's weight is
  // a property of the collection, and recomputing it per filter would make the
  // numbers shift underneath the person reading them.
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const logo of logos) {
      for (const tag of logo.tags) counts[tag] = (counts[tag] ?? 0) + 1
    }
    return counts
  }, [logos])

  const visibleLogos = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return logos.filter((logo) => {
      const matchesSearch =
        search === '' ||
        logo.title.toLowerCase().includes(search) ||
        logo.tags.some((tag) => tag.toLowerCase().includes(search))

      const matchesStyle =
        filters.styles.length === 0 || logo.tags.some((tag) => filters.styles.includes(tag))

      return matchesSearch && matchesStyle
    })
  }, [logos, filters])

  return (
    <>
      <FilterBar onFiltersChange={setFilters} tagCounts={tagCounts} />

      <div className="container mx-auto px-4 py-10">
        {/*
          The grid follows the filters directly. A heading block between them
          restated what the filter row and the work itself already say, and put
          three lines of preamble between the control and its result. The
          heading stays for document structure.
        */}
        <h2 className="sr-only">The collection</h2>

        {visibleLogos.length > 0 ? (
          <LogoGrid logos={visibleLogos} />
        ) : (
          <p className="text-sm text-foreground-muted">
            Nothing matches those filters. Try a different style or search term.
          </p>
        )}
      </div>
    </>
  )
}
