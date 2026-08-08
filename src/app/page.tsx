'use client'

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { Hero } from "@/components/hero/Hero"
import { LogoGrid } from "@/components/logo/LogoGrid"
import { FilterBar } from "@/components/filters/FilterBar"
import { useRouter } from 'next/navigation'
import type { Logo } from '@/lib/types'
import type { FilterState } from "@/lib/types"
import { LoadingScreen } from '@/components/LoadingScreen'

export default function HomePage() {
  const [logos, setLogos] = useState<Logo[]>([])
  const [filteredLogos, setFilteredLogos] = useState<Logo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Prefetch callback
  const prefetchLogoPages = useCallback((logos: Logo[]) => {
    for (const logo of logos.slice(0, 4)) {
      router.prefetch(`/${logo.id}`)
    }
  }, [router])

  useEffect(() => {
    prefetchLogoPages(filteredLogos)
  }, [filteredLogos, prefetchLogoPages])

  // Fetch logos
  useEffect(() => {
    async function fetchLogos() {
      try {
        console.log('Fetching logos...')
        const response = await fetch('/api/logos')
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch logos: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received logos:', data)
        
        // Handle the new response format
        if (!data.logos || !Array.isArray(data.logos)) {
          console.error('Invalid data format:', data)
          throw new Error('Invalid data format received')
        }
        
        // Only get AVAILABLE logos for the homepage
        const availableLogos = data.logos.filter((logo: Logo) => logo.status === 'AVAILABLE')
        setLogos(availableLogos)
        setFilteredLogos(availableLogos)
      } catch (error) {
        console.error('Error fetching logos:', error)
        setError(error instanceof Error ? error.message : 'Failed to load logos')
      } finally {
        setLoading(false)
      }
    }

    fetchLogos()
  }, [])

  const handleLogoPress = (id: string) => {
    router.push(`/${id}`)
  }

  const handleFiltersChange = ({ styles, search }: FilterState) => {
    const filtered = logos.filter(logo => {
      const matchesSearch = search === "" || 
        logo.title.toLowerCase().includes(search.toLowerCase()) ||
        logo.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      
      const matchesStyle = styles.length === 0 || 
        logo.tags.some(tag => styles.includes(tag))
      
      return matchesSearch && matchesStyle
    })

    setFilteredLogos(filtered)
  }

  // Show loading state
  if (loading) {
    return <LoadingScreen isLoading={loading} />
  }

  // Show error state
  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>
  }

  if (!logos.length) {
    return <div>No logos available</div>
  }

  return (
    <div className="min-h-screen backdrop-blur-sm">
      <Hero />
      
      {/* Collection Section */}
      <section id="collection" className="min-h-screen bg-black/50">
        <FilterBar onFiltersChange={handleFiltersChange} />
        
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

          <LogoGrid logos={filteredLogos} onLogoPress={handleLogoPress} />
        </div>
      </section>
    </div>
  )
} 