'use client'

import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { ImageGallery } from '@/components/logo/ImageGallery'
import { PricingSelectorTabs } from '@/components/ui/PricingSelectorTabs'
import { BookCallModal } from '@/components/modals/BookCallModal'
import { generatePublicReference } from '@/lib/utils'
import type { LogoDetail } from '@/lib/catalog'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const formatTitle = (title: string) =>
  title
    .replace(/logo_/i, '')
    .replace(/_placeholder/i, '')
    .replace(/_[a-z0-9]+$/i, '')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()

interface LogoDetailViewProps {
  logo: LogoDetail
}

/**
 * Interactive half of the product page. The logo itself is rendered by the
 * server; this owns checkout, the booking modal, and their error states.
 */
export function LogoDetailView({ logo }: LogoDetailViewProps) {
  const router = useRouter()
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSelect = async (
    tier: 'summon' | 'revival' | 'afterlife',
    options?: { wordmark?: string; domain?: string }
  ) => {
    if (tier === 'afterlife') {
      setCheckoutError('')
      setIsCallModalOpen(true)
      return
    }

    if (!stripePromise) {
      setCheckoutError('Payments are unavailable right now. Please try again later.')
      return
    }

    setIsRedirecting(true)
    setCheckoutError('')

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoId: logo.id, tier, options })
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.message || 'We could not start checkout.')
      }

      window.location.href = data.url
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'We could not start checkout.'
      )
      setIsRedirecting(false)
    }
  }

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
              {generatePublicReference(logo.id)}
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
          {logo.status === 'SOLD' ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-medium mb-1">This one has been revived</h2>
              <p className="text-sm text-white/60">
                It already found an owner and is no longer for sale.
              </p>
            </div>
          ) : (
            <PricingSelectorTabs
              logo={{ id: logo.id }}
              // Prices come from the logo's own Price record. They were
              // previously hardcoded here, so every logo showed the same
              // figures regardless of what was set in the database.
              price={
                logo.price ?? {
                  summon: 1000,
                  revival: 5000,
                  afterlife: 'Custom'
                }
              }
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>

      <BookCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

      {checkoutError && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 bg-red-500/80 text-white px-4 py-2 rounded-lg"
        >
          {checkoutError}
        </div>
      )}

      {isRedirecting && (
        <div className="fixed bottom-4 left-4 bg-white/10 text-white px-4 py-2 rounded-lg text-sm">
          Taking you to checkout…
        </div>
      )}
    </div>
  )
}
