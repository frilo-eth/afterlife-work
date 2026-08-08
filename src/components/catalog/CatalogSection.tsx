'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilterBar } from '@/components/filters/FilterBar'
import { LogoGrid } from '@/components/logo/LogoGrid'
import type { FilterState } from '@/lib/types'
import type { CatalogLogo } from '@/lib/catalog'

interface CatalogSectionProps {
  logos: CatalogLogo[]
}

/**
 * Interactive half of the catalog. The logos arrive as props from the server
 * component, already filtered to AVAILABLE — this only narrows what is
 * already on screen, so there is no fetch and no loading state.
 */
export function CatalogSection({ logos }: CatalogSectionProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({ styles: [], search: '' })

  const visibleLogos = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return logos.filter(logo => {
      const matchesSearch =
        search === '' ||
        logo.title.toLowerCase().includes(search) ||
        logo.tags.some(tag => tag.toLowerCase().includes(search))

      const matchesStyle =
        filters.styles.length === 0 ||
        logo.tags.some(tag => filters.styles.includes(tag))

      return matchesSearch && matchesStyle
    })
  }, [logos, filters])

  return (
    <>
      <FilterBar onFiltersChange={setFilters} />

      <div className="container mx-auto px-4 py-24">
        <div className="space-y-4 mb-16">
          <span className="font-mono text-sm tracking-wider opacity-50 block uppercase">
            The Collection
          </span>

          <h2 className="text-3xl font-bold">
            Give new life to a forgotten symbol
          </h2>

          <p className="text-sm text-white/60">
            Lost logos waiting for resurrection
          </p>
        </div>

        {visibleLogos.length > 0 ? (
          <LogoGrid
            logos={visibleLogos}
            onLogoPress={id => router.push(`/${id}`)}
          />
        ) : (
          <p className="text-sm text-white/60">
            Nothing matches those filters. Try a different style or search term.
          </p>
        )}
      </div>
    </>
  )
}
