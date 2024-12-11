'use client'

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/collection/Sidebar"
import { LogoGrid } from "@/components/logo/LogoGrid"
import { FilterBar } from "@/components/filters/FilterBar"
import { logos } from "@/lib/data/logos"
import type { Logo } from "@/lib/types"

export const CollectionLayout = () => {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeIndustry, setActiveIndustry] = useState("")
  const [activeStyle, setActiveStyle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter logos based on active filters
  const filteredLogos = useMemo(() => {
    return logos.filter((logo: Logo) => {
      // Search query filter
      if (searchQuery && !logo.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Industry filter
      if (activeIndustry && !logo.tags.includes(activeIndustry)) {
        return false
      }

      // Style filter
      if (activeStyle && !logo.tags.includes(activeStyle)) {
        return false
      }

      return true
    })
  }, [logos, searchQuery, activeIndustry, activeStyle])

  const handleLogoClick = (id: string) => {
    router.push(`/logo/${id}`)
  }

  return (
    <div className="flex">
      <Sidebar 
        className="w-64 fixed h-[calc(100vh-4rem)] top-16 left-0 border-r border-white/10"
        activeCategory={activeCategory}
        activeIndustry={activeIndustry}
        activeStyle={activeStyle}
        onCategoryChange={setActiveCategory}
        onIndustryChange={setActiveIndustry}
        onStyleChange={setActiveStyle}
      />
      
      <main className="flex-1 ml-64">
        <FilterBar onSearch={setSearchQuery} />
        <div className="p-6">
          <LogoGrid 
            logos={filteredLogos}
            onLogoClick={handleLogoClick}
          />
        </div>
      </main>
    </div>
  )
} 