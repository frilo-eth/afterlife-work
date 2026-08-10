'use client'

import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || 'The logo list could not be loaded.'}
      </p>
      <Button variant="primary" leadingIcon={RefreshCcw} onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
