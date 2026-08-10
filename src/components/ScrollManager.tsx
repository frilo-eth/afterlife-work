'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function ScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    // Only reset scroll if not navigating to a hash
    if (!pathname.includes('#')) {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
