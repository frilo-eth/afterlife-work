'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputField } from '@/components/ui/input-group'
import { LOGO_TAGS } from '@/lib/constants'

interface FilterState {
  styles: string[]
  search: string
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void
}

/**
 * A toggle, not a dismissible chip.
 *
 * The active state previously carried a trailing X, which reads as its own
 * remove control but was decorative — the whole pill toggled, so the X was a
 * target that did nothing. State is carried by fill and weight instead, and
 * the button reports aria-pressed.
 *
 * Motion comes from the registry's Button: hover, press and icon weight are
 * already handled there, consistently with every other control on the page.
 */
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
      className="shrink-0 rounded-full"
    >
      {label}
    </Button>
  )
}

export const FilterBar = ({ onFiltersChange }: FilterBarProps) => {
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // Debounce the term, not the callback. Memoising a debounced function with
  // an empty dependency array captured the styles from first render, so a
  // search after a style change reported stale filters.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 250)
    return () => clearTimeout(id)
  }, [searchInput])

  const styles = useMemo(() => Array.from(selectedStyles), [selectedStyles])

  const onFiltersChangeRef = useRef(onFiltersChange)
  onFiltersChangeRef.current = onFiltersChange

  useEffect(() => {
    onFiltersChangeRef.current({ styles, search })
  }, [styles, search])

  const toggleFilter = useCallback((filter: string) => {
    setSelectedStyles(previous => {
      const next = new Set(previous)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSelectedStyles(new Set())
    setSearchInput('')
  }, [])

  const hasFilters = selectedStyles.size > 0 || searchInput.length > 0

  return (
    <div className="sticky top-16 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <InputGroup className="w-full shrink-0 [&_label]:sr-only lg:w-64">
            <InputField
              index={0}
              label="Search logos"
              placeholder="Search"
              icon={Search}
              value={searchInput}
              onChange={setSearchInput}
            />
          </InputGroup>

          {/*
            One line that scrolls, rather than wrapping into extra rows that
            push the collection down the page. The right edge fades so it is
            clear there is more, without spending a control on saying so.
          */}
          <div className="filter-scroller flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
            {LOGO_TAGS.map(style => (
              <FilterPill
                key={style}
                label={style}
                active={selectedStyles.has(style)}
                onToggle={() => toggleFilter(style)}
              />
            ))}

            {hasFilters && (
              <Button
                variant="ghost"
                size="md"
                onClick={clearAll}
                className="shrink-0 rounded-full text-foreground-muted"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
