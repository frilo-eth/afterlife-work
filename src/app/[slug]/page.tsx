'use client'

import React from "react"
import { Button } from "@nextui-org/react"
import { ChevronLeft } from "lucide-react"
import { ImageGallery } from "@/components/logo/ImageGallery"
import { PricingSelectorTabs } from "@/components/ui/PricingSelectorTabs"
import { useState, useEffect } from "react"
import { loadStripe } from '@stripe/stripe-js'
import { useRouter, useParams } from 'next/navigation'
import type { Logo } from '@/lib/types'
import { Spinner } from "@nextui-org/react"
import { BookCallModal } from "@/components/modals/BookCallModal"
import { generatePublicReference } from '@/lib/utils'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const formatTitle = (title: string) => {
  return title
    .replace(/logo_/i, '')
    .replace(/_placeholder/i, '')
    .replace(/_[a-z0-9]+$/i, '')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

// Add debug mode constant
const DEBUG = process.env.NODE_ENV === 'development'

export default function LogoDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [logo, setLogo] = useState<Logo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [modalError, setModalError] = useState('')

  const handleSelect = async (tier: 'summon' | 'revival' | 'afterlife', options?: { wordmark?: string; domain?: string }) => {
    if (tier === 'afterlife') {
      try {
        setModalError('')
        setIsCallModalOpen(true)
      } catch (err) {
        console.error('Failed to open booking modal:', err)
        setError('Failed to open booking calendar. Please try again.')
      }
      return
    }

    if (!stripePromise) {
      setError('Stripe is not properly configured')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Starting checkout with:', { tier, options })
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoId: logo?.id,
          tier,
          options
        }),
      })

      const data = await response.json()
      console.log('Checkout response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      throw new Error('No checkout URL received')

    } catch (error) {
      console.error('Purchase error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setIsCallModalOpen(false)
    setModalError('')
  }

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true)
        if (DEBUG) console.log('Fetching logo with slug:', slug)
        
        // Skip fetching and show error for "teaser" slug
        if (slug === 'teaser') {
          throw new Error('This is a special route and not a logo')
        }
        
        const response = await fetch(`/api/logos/${slug}`)
        const data = await response.json()
        
        if (DEBUG) console.log('Logo data received:', data)
        
        if (!response.ok) throw new Error('Logo not found')
        setLogo(data)
      } catch (err) {
        if (DEBUG) console.error('Error fetching logo:', err)
        setError(err instanceof Error ? err.message : 'Failed to load logo')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchLogo()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner color="white" />
      </div>
    )
  }
  
  if (error) return <div className="text-red-500">{error}</div>
  if (!logo) return <div>Logo not found</div>

  if (DEBUG) console.log('Rendering logo:', logo)

  return (
    <div className="container mx-auto px-4 pt-8 pb-8">
      <div className="sticky top-16 z-30 bg-gradient-to-b from-black via-black/95 to-transparent pb-4 -mx-4 px-4 pt-4">
        <Button
          startContent={<ChevronLeft />}
          onPress={() => router.push('/')}
          className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white text-sm h-9"
          size="sm"
        >
          Back to Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={logo.images} title={formatTitle(logo.title)} />
          
          <div className="space-y-4">
            <span className="font-mono text-sm tracking-wider uppercase text-white/50">
              {logo ? generatePublicReference(logo.id) : ''}
            </span>
            <h1 className="text-4xl font-bold">{formatTitle(logo.title)}</h1>
            <div className="flex gap-2">
              {logo.tags?.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-white/60">{logo.description}</p>
          </div>
        </div>

        <div>
          <PricingSelectorTabs
            logo={logo}
            price={{
              summon: 1000,
              revival: 5000,
              afterlife: "Custom"
            }}
            onSelect={handleSelect}
          />
        </div>
      </div>

      <BookCallModal 
        isOpen={isCallModalOpen} 
        onClose={handleModalClose}
      />

      {modalError && (
        <div className="fixed bottom-4 right-4 bg-red-500/80 text-white px-4 py-2 rounded-lg">
          {modalError}
        </div>
      )}
    </div>
  )
} 