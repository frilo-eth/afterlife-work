'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputField } from '@/components/ui/input-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LOGO_TAGS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface FilterState {
  styles: string[]
  search: string
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void
  /** How many logos carry each tag, so the panel can show weight. */
  tagCounts?: Record<string, number>
}

// The row shows a fixed set and defers the rest to the panel. Deciding how
// many fit by measurement means reading layout on every resize and still
// clipping a pill at some width; a fixed count is stable, and the panel holds
// the full vocabulary.
const VISIBLE_TAGS = 8

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

export const FilterBar = ({ onFiltersChange, tagCounts }: FilterBarProps) => {
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [tagsOpen, setTagsOpen] = useState(false)

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

  // A tag chosen from the panel stays on the row even when it sits outside
  // the visible slice — otherwise an active filter would be invisible.
  const rowTags = useMemo(() => {
    const head: string[] = LOGO_TAGS.slice(0, VISIBLE_TAGS)
    return [...head, ...styles.filter(tag => !head.includes(tag))]
  }, [styles])

  const hasFilters = selectedStyles.size > 0 || searchInput.length > 0

  return (
    <>
      <div className="sticky top-16 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
          <InputGroup className="w-full shrink-0 [&_label]:sr-only lg:w-56">
            <InputField
              index={0}
              label="Search logos"
              placeholder="Search"
              icon={Search}
              value={searchInput}
              onChange={setSearchInput}
            />
          </InputGroup>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {rowTags.map(style => (
              <FilterPill
                key={style}
                label={style}
                active={selectedStyles.has(style)}
                onToggle={() => toggleFilter(style)}
              />
            ))}

            <Button
              variant="ghost"
              size="md"
              className="shrink-0 rounded-full"
              aria-haspopup="dialog"
              onClick={() => setTagsOpen(true)}
            >
              All tags
            </Button>

            {hasFilters && (
              <Button
                variant="ghost"
                size="md"
                onClick={clearAll}
                className="shrink-0 rounded-full text-foreground-subtle"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/*
        The full vocabulary, with weight. Counts matter here in a way they do
        not on the row: choosing among eighteen styles is a different task from
        nudging the eight already in front of you.
      */}
      <Dialog open={tagsOpen} onOpenChange={setTagsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tags</DialogTitle>
          </DialogHeader>

          <ul className="-mx-2 max-h-[60vh] overflow-y-auto">
            {LOGO_TAGS.map(tag => {
              const active = selectedStyles.has(tag)
              const count = tagCounts?.[tag] ?? 0
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleFilter(tag)}
                    disabled={count === 0 && !active}
                    className={cn(
                      'flex w-full items-baseline gap-3 rounded-md px-2 py-2 text-left',
                      'transition-colors duration-quick ease-settle',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      active
                        ? 'font-semibold text-foreground'
                        : 'text-foreground-muted hover:bg-hover hover:text-foreground'
                    )}
                  >
                    <span className="text-label">{tag}</span>
                    {/* A leader line ties the name to its count across the gap. */}
                    <span
                      aria-hidden="true"
                      className="mb-1 min-w-4 flex-1 border-b border-dashed border-border"
                    />
                    <span className="text-caption tabular-nums text-foreground-subtle">
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="self-start">
              Clear all
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
