'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function AdminNav() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/admin" className="text-heading-24 text-foreground">
            Afterlife
            <span className="ml-2 text-caption font-normal text-foreground-subtle">Admin</span>
          </Link>

          <Button variant="ghost" size="icon-sm" aria-label="Log out" onClick={handleLogout}>
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  )
}
