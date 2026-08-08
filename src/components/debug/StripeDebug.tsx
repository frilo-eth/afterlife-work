'use client'

import { useState } from 'react'
import { Button } from '@nextui-org/react'

type TestResult = {
  stripeConnected: boolean
  testPrice: number
  sessionCreated: boolean
  sessionUrl: string | null
  env: {
    hasStripeKey: boolean
    hasPublicUrl: boolean
  }
}

export function StripeDebug() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testStripe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test-stripe')
      const data = await res.json()
      setResult(data)
      
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch (error) {
      setResult({ 
        stripeConnected: false,
        testPrice: 0,
        sessionCreated: false,
        sessionUrl: null,
        env: {
          hasStripeKey: false,
          hasPublicUrl: false
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <Button 
        onPress={testStripe}
        isLoading={loading}
      >
        Test Stripe Connection
      </Button>
      
      {result && (
        <pre className="mt-4 p-4 bg-zinc-800 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
} 