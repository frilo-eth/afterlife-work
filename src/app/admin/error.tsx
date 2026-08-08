'use client'

import { Button } from '@nextui-org/react'
import { RefreshCcw } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-gray-600">{error.message}</p>
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