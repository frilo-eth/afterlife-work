'use client'

import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { useRowOverflow } from '@/hooks/useRowOverflow'
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

function FilterPill({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <Button
      variant={active ? 'primary' : 'tertiary'}
      size="lg"
      aria-pressed={active}
      onClick={onToggle}
      className="shrink-0"
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
    setSelectedStyles((previous) => {
      const next = new Set(previous)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }, [])

  // Keep catalog order stable — reordering selected tags to the front made
  // the row jump left on every click.
  const orderedTags = LOGO_TAGS

  // How many actually fit on one line, measured. The row must never wrap —
  // that is the entire reason the overflow panel exists.
  const { containerRef, trailingRef, visibleCount } = useRowOverflow(orderedTags.length)

  return (
    <>
      <div className="sticky top-16 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
          <InputGroup className="w-full shrink-0 lg:w-56">
            <InputField
              index={0}
              label="Search logos"
              hideLabel
              placeholder="Search"
              icon={Search}
              value={searchInput}
              onChange={setSearchInput}
            />
          </InputGroup>

          <div
            ref={containerRef}
            className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden"
          >
            {orderedTags.map((style, index) => (
              <div
                key={style}
                data-row-item="true"
                // Every tag is measured, but only those that fit are shown.
                // Overflow items are taken out of flow rather than unmounted,
                // so they keep real dimensions for the next measurement — and
                // a display:contents wrapper would have no box to measure at
                // all.
                className={
                  index < visibleCount
                    ? 'shrink-0'
                    : 'pointer-events-none invisible absolute -z-10 shrink-0'
                }
                aria-hidden={index >= visibleCount}
              >
                <FilterPill
                  label={style}
                  active={selectedStyles.has(style)}
                  onToggle={() => toggleFilter(style)}
                />
              </div>
            ))}

            <div ref={trailingRef} className="ml-auto flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="lg"
                className="shrink-0"
                aria-haspopup="dialog"
                onClick={() => setTagsOpen(true)}
              >
                All tags
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*
        The full vocabulary, with weight. Counts matter here in a way they do
        not on the row: choosing among eighteen styles is a different task from
        nudging the eight already in front of you.
      */}
      <Dialog open={tagsOpen} onOpenChange={setTagsOpen}>
        <DialogContent placement="right" className="border border-border bg-background shadow-none">
          <DialogHeader>
            <DialogTitle>Tags</DialogTitle>
          </DialogHeader>

          <ul className="-mx-2 max-h-[60vh] overflow-y-auto">
            {LOGO_TAGS.map((tag) => {
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
                        : 'text-foreground-muted hover:bg-hover hover:text-foreground',
                    )}
                  >
                    <span className="text-label">{tag}</span>
                    {/* A leader line ties the name to its count across the gap. */}
                    <span
                      aria-hidden="true"
                      className="mb-1 min-w-4 flex-1 border-b border-border"
                    />
                    <span className="text-caption tabular-nums text-foreground-subtle">
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
