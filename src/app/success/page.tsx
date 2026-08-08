'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@nextui-org/react'
import Image from 'next/image'

interface OrderDetails {
  logoId: string
  tier: 'summon' | 'revival'
  wordmark?: boolean
  domain?: string
}

export default function SuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    async function verifySession() {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        setError('No session ID found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
        if (!response.ok) throw new Error('Failed to verify session')
        
        const data = await response.json()
        setOrderDetails(data)
      } catch (err) {
        setError('Failed to verify purchase')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [searchParams])

  if (loading) {
    return (
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">Verifying your purchase...</h1>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">Something went wrong</h1>
          <p className="text-white/60 mb-8">{error}</p>
          <Button onPress={() => router.push('/')}>Return Home</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <Image
            src="/parka.svg"
            alt="Afterlife Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
          It's Alive!
        </h1>
        
        <p className="text-white/60 mb-8">
          {orderDetails?.tier === 'summon' 
            ? "Your resurrected files await below. They've been carefully prepared for their new life."
            : "The resurrection process has begun. Keep an eye on your email for updates and delivery details."}
        </p>
        
        {orderDetails?.tier === 'summon' && (
          <Button 
            color="primary"
            size="lg"
            className="mb-8"
            onPress={() => router.push(`/download/${orderDetails.logoId}`)}
          >
            Download Files
          </Button>
        )}

        <Button 
          className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white text-sm h-9"
          size="sm"
          onPress={() => router.push('/')}
        >
          Return to Collection
        </Button>

        <p className="text-zinc-700 text-lg my-4">
          We&apos;ve sent you a confirmation email with all the details of your purchase.
        </p>
      </div>
    </main>
  )
} 