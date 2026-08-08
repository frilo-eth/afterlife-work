'use client'

import { Button } from '@nextui-org/react'
import { RefreshCcw } from 'lucide-react'

export default function ErrorPage({
  error: errorMessage,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <Button 
        color="primary"
        startContent={<RefreshCcw size={20} />}
        onPress={() => reset()}
      >
        Try again
      </Button>
    </div>
  )
} 