'use client'

import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { DesignerHoverCard } from '@/components/logo/DesignerHoverCard'
import { ImageGallery } from '@/components/logo/ImageGallery'
import { PricingSelectorTabs } from '@/components/ui/PricingSelectorTabs'
import type { LogoDetail } from '@/lib/catalog'
import { AFTERLIFE_PRICE_LABEL } from '@/lib/price-constants'
import { generatePublicReference } from '@/lib/utils'

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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()

interface LogoDetailViewProps {
  logo: LogoDetail
}

/**
 * Interactive half of the product page. The logo itself is rendered by the
 * server; this owns checkout and its error states.
 */
export function LogoDetailView({ logo }: LogoDetailViewProps) {
  const [checkoutError, setCheckoutError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSelect = async (
    tier: 'summon' | 'revival' | 'afterlife',
    options?: { wordmark?: boolean | string; domain?: string },
  ) => {
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
        body: JSON.stringify({ logoId: logo.id, tier, options }),
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.message || 'We could not start checkout.')
      }

      window.location.href = data.url
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'We could not start checkout.')
      setIsRedirecting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8">
          {logo.status === 'SOLD' ? (
            <div className="rounded-xl border border-border bg-secondary p-6">
              <h2 className="mb-1 text-lg font-medium">This one has been revived</h2>
              <p className="text-sm text-foreground-muted">
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
                  summon: 2500,
                  revival: 5000,
                  afterlife: AFTERLIFE_PRICE_LABEL,
                }
              }
              onSelect={handleSelect}
            />
          )}

          <div className="space-y-3 px-1">
            <span className="block font-mono text-metadata uppercase tracking-wider text-foreground-subtle">
              {generatePublicReference(logo.id)}
            </span>
            <h1 className="text-heading-24 text-foreground">{formatTitle(logo.title)}</h1>
            {logo.tags && logo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {logo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-caption text-foreground-subtle"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {logo.description && (
              <p className="text-caption text-foreground-muted text-pretty">{logo.description}</p>
            )}
            {logo.designer ? (
              <p className="pt-1 text-caption text-foreground-muted">
                Designed by <DesignerHoverCard designer={logo.designer} />
              </p>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2">
          <ImageGallery images={logo.images} title={formatTitle(logo.title)} />
        </div>
      </div>

      {checkoutError && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 bg-red-500/80 text-foreground px-4 py-2 rounded-lg"
        >
          {checkoutError}
        </div>
      )}

      {isRedirecting && (
        <div className="fixed bottom-4 left-4 bg-accent text-foreground px-4 py-2 rounded-lg text-sm">
          Taking you to checkout…
        </div>
      )}
    </div>
  )
}
