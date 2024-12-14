'use client'

import { Button } from "@nextui-org/react"
import { useRouter } from 'next/navigation'

export default function BookCallPage() {
  const router = useRouter()
  
  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-8">Book a Call</h1>
        <p className="text-white/60 mb-8">
          For custom logo design and branding services, please schedule a consultation call.
        </p>
        <Button
          variant="light"
          onPress={() => router.push('/')}
        >
          Return Home
        </Button>
      </div>
    </main>
  )
} 