'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

// Default export for the main page component - redirects to logos
export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to logos page
    router.replace('/admin/logos')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" label="Loading dashboard" />
    </div>
  )
}
