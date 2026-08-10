'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputField } from '@/components/ui/input-group'
import { LOGO_TAGS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface FilterState {
  styles: string[]
  search: string
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void
}

// Defined at module scope. It previously lived inside FilterBar, which gave it
// a new identity on every render — React unmounted and remounted every pill on
// each keystroke, discarding focus and any in-flight transition.
function FilterPill({
  label,
  active,
  onToggle
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <Button
      variant={active ? 'primary' : 'tertiary'}
      size="md"
      aria-pressed={active}
      onClick={onToggle}
      trailingIcon={active ? X : undefined}
      className="rounded-full"
    >
      {label}
    </Button>
  )
}

export const FilterBar = ({ onFiltersChange }: FilterBarProps) => {
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  // Debounce the search term itself rather than the callback. The previous
  // version memoised a debounced function with an empty dependency array, so it
  // captured the styles from first render and reported stale filters whenever a
  // search followed a style change.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 250)
    return () => clearTimeout(id)
  }, [searchInput])

  const styles = useMemo(() => Array.from(selectedStyles), [selectedStyles])

  // Report upward whenever either half of the filter state settles.
  const onFiltersChangeRef = useRef(onFiltersChange)
  onFiltersChangeRef.current = onFiltersChange

  useEffect(() => {
    onFiltersChangeRef.current({ styles, search })
  }, [styles, search])

  const toggleFilter = useCallback((filter: string) => {
    setSelectedStyles(previous => {
      const next = new Set(previous)
      if (next.has(filter)) {
        next.delete(filter)
      } else {
        next.add(filter)
      }
      return next
    })
  }, [])

  return (
    <div className="sticky top-16 z-10 border-b border-border bg-background/50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex w-full items-end gap-2 md:w-auto">
              <InputGroup className="w-full md:w-56">
                <InputField
                  index={0}
                  label="Search"
                  placeholder="Search logos"
                  icon={Search}
                  value={searchInput}
                  onChange={setSearchInput}
                />
              </InputGroup>

              <Button
                variant="tertiary"
                size="lg"
                className="md:hidden"
                aria-expanded={showFilters}
                aria-controls="style-filters"
                leadingIcon={Filter}
                onClick={() => setShowFilters(current => !current)}
              >
                {selectedStyles.size > 0 ? String(selectedStyles.size) : 'Filters'}
              </Button>
            </div>

            {/*
              Hidden with the hidden attribute rather than zero opacity. The
              previous version faded the row out but left it in the layout and
              in the tab order, so keyboard users could still reach controls
              they could not see.
            */}
            <div
              id="style-filters"
              hidden={!showFilters}
              className={cn('flex-wrap gap-2', showFilters ? 'flex' : 'hidden', 'md:!flex')}
            >
              {LOGO_TAGS.map(style => (
                <FilterPill
                  key={style}
                  label={style}
                  active={selectedStyles.has(style)}
                  onToggle={() => toggleFilter(style)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
