'use client'

import { Card, Image, Button } from "@nextui-org/react"
import { ChevronLeft } from "lucide-react"
import { PricingTier } from "@/components/ui/PricingTier"
import { useState, useEffect } from "react"
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Logo {
  id: string
  title: string
  description: string
  images: string[]
  thumbnail: string
  tags: string[]
  status: 'AVAILABLE' | 'SOLD' | 'HIDDEN'
  price: {
    id: string
    summon: number
    revival: number
    afterlife: string
  }
}

export default function LogoDetailPage({ params }: { params: { slug: string } }) {
  const [logo, setLogo] = useState<Logo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePurchase = async (tier: 'summon' | 'revival' | 'afterlife') => {
    if (tier === 'afterlife') {
      router.push('/book-call')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoId: logo?.id,
          tier,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        console.log('Fetching logo with ID:', params.slug)
        const res = await fetch(`/api/logos/${params.slug}`)
        const data = await res.json()
        console.log('Fetched logo data:', data)
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch logo')
        }
        
        setLogo(data)
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchLogo:', error)
        setError(error instanceof Error ? error.message : 'Failed to load logo')
        setLoading(false)
      }
    }
    fetchLogo()
  }, [params.slug])

  if (loading) return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4 text-center">
        Loading...
      </div>
    </main>
  )

  if (error) return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="light" 
          onPress={() => router.push('/')}
          className="mt-4"
        >
          Return Home
        </Button>
      </div>
    </main>
  )

  if (!logo) return null

  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Gallery Section */}
          <div className="lg:col-span-2 space-y-6">
            {logo && logo.images[0] && (
              <Card className="bg-zinc-900/50 backdrop-blur-sm border border-white/10">
                <div className="relative aspect-video">
                  <Image
                    src={logo.images[0]}
                    alt={logo.title}
                    className="object-contain"
                    onError={() => {
                      console.error('Image failed to load:', logo.images[0])
                      // Handle error by showing placeholder or fallback image
                    }}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Info & Pricing */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{logo.title}</h1>
              <div className="flex gap-2 mb-6">
                {logo.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs px-2 py-1 rounded-full bg-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-white/60">{logo.description}</p>
            </div>
            
            {/* Pricing Tiers */}
            <div className="space-y-4">
              <PricingTier
                title="Summon"
                price={logo.price.summon}
                features={[
                  "Exclusive use licence",
                  "All editable formats"
                ]}
                onSelect={() => handlePurchase('summon')}
                loading={loading}
              />
              <PricingTier
                title="Revival"
                price={logo.price.revival}
                features={[
                  "Exclusive use licence",
                  "All editable formats",
                  "Logomark Guidelines",
                  "Editable Logotype",
                  "Typography"
                ]}
                highlighted
                onSelect={() => handlePurchase('revival')}
                loading={loading}
              />
              <PricingTier
                title="Afterlife"
                price={logo.price.afterlife}
                features={[
                  "Personalized Spiritual Session",
                  "Custom applications",
                  "Branding sprint",
                  "Website design sprint",
                  "Marketing collateral sprint"
                ]}
                onSelect={() => handlePurchase('afterlife')}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="light"
        startContent={<ChevronLeft />}
        onPress={() => router.push('/')}
        className="mb-8"
      >
        Back to Collection
      </Button>
    </main>
  )
} 