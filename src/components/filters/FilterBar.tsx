'use client'

import React, { useState, useCallback, useEffect } from "react"
import { Input, Button } from "@nextui-org/react"
import { Search, X, Filter } from "lucide-react"
import { debounce } from "lodash"
import { LOGO_TAGS } from "@/lib/constants"

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  styles: string[];
  search: string;
}

export const FilterBar = ({ onFiltersChange }: FilterBarProps) => {
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set([]))
  const [searchQuery, setSearchQuery] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Modified scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) { // mobile only
        const scrolled = window.scrollY > 50 // Reduced threshold
        setIsCollapsed(scrolled)
        if (scrolled) {
          setTimeout(() => setShowFilters(false), 300)
        } else {
          setShowFilters(true)
          setIsCollapsed(false) // Ensure we reset collapse state
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    updateFilters(selectedStyles, value)
  }

  const toggleFilter = (filter: string) => {
    const newSet = new Set(selectedStyles)
    
    if (newSet.has(filter)) {
      newSet.delete(filter)
    } else {
      newSet.add(filter)
    }
    
    setSelectedStyles(newSet)
    updateFilters(newSet, searchQuery)
  }

  const updateFilters = (styles: Set<string>, search: string) => {
    onFiltersChange({
      styles: Array.from(styles),
      search: search
    })
  }

  const FilterPill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Button
      size="sm"
      variant={active ? "solid" : "bordered"}
      className={`
        rounded-full px-4 h-10 text-sm transition-all
        ${active 
          ? 'bg-white text-black hover:bg-white/90' 
          : 'bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white'
        }
      `}
      endContent={active && <X size={14} className="ml-1" />}
      onPress={onPress}
    >
      {label}
    </Button>
  )

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      handleSearch(value)
    }, 300),
    []
  )

  return (
    <div className="sticky top-16 z-10 backdrop-blur-md border-b border-white/10 bg-black/50">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                classNames={{
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-transparent",
                    "border border-white/10",
                    "h-10",
                    "px-3",
                    "!rounded-lg"
                  ]
                }}
                placeholder="Search"
                value={searchQuery}
                onValueChange={debouncedSearch}
                startContent={<Search size={16} className="text-white/50" />}
                className="w-full md:w-48"
              />
              
              <Button
                className="md:hidden h-10 px-3 bg-transparent border border-white/10 hover:bg-white/10"
                onPress={toggleFilters}
                style={{ 
                  opacity: isCollapsed ? 1 : showFilters ? 0 : 1
                }}
              >
                <Filter size={16} className="text-white/50" />
                {selectedStyles.size > 0 && (
                  <span className="ml-1 text-sm">
                    {selectedStyles.size}
                  </span>
                )}
              </Button>
            </div>
            
            <div 
              className={`
                flex flex-wrap gap-2
                md:!flex md:!opacity-100 md:!h-auto
                ${showFilters ? 'opacity-100 h-auto' : 'opacity-0 h-0'}
                transition-all duration-300 ease-in-out
              `}
            >
              {LOGO_TAGS.map((style) => (
                <FilterPill
                  key={style}
                  label={style}
                  active={selectedStyles.has(style)}
                  onPress={() => toggleFilter(style)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 