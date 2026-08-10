'use client'

import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-lg font-medium">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || 'This page could not be loaded.'}
      </p>
      <Button variant="tertiary" leadingIcon={RefreshCcw} onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
