'use client'

import { Button } from "@nextui-org/react"
import { useState } from "react"

export function SeedButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSeed = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/seed/cloudinary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': process.env.NEXT_PUBLIC_SEED_SECRET || ''
        }
      })
      
      if (!response.ok) {
        throw new Error('Seed failed')
      }
      
      const result = await response.json()
      console.log('Seed result:', result)
      window.location.reload()
    } catch (error) {
      console.error('Seed error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleSeed}
      isLoading={isLoading}
      color="primary"
      className="fixed bottom-4 right-4 z-50"
    >
      Seed Database
    </Button>
  )
} 