'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

/**
 * Storefront chrome stays off admin and login so those surfaces own their
 * own top bar instead of stacking under Afterlife Submit.
 */
export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideStorefrontChrome =
    pathname.startsWith('/admin') || pathname === '/login' || pathname.startsWith('/login/')

  if (hideStorefrontChrome) {
    return <>{children}</>
  }

  // Column shell so the footer sits at the bottom of the viewport on short
  // pages and after content on long ones. Header is position:fixed, so main
  // keeps the 4rem top offset.
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mt-16 flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
