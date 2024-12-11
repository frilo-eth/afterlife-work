'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { monitoring } from '@/lib/monitoring'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error(error.message)
    monitoring.trackError({
      count: 1,
      type: error.name,
      message: error.message,
    })
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white text-black rounded-lg"
      >
        Try again
      </button>
    </div>
  )
} 