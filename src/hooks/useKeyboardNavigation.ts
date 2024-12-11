'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useKeyboardNavigation = () => {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to go back
      if (e.key === 'Escape') {
        router.back()
      }

      // Arrow keys for navigation (when implementing gallery view)
      if (e.key === 'ArrowLeft') {
        // Previous logo
      }
      if (e.key === 'ArrowRight') {
        // Next logo
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])
} 