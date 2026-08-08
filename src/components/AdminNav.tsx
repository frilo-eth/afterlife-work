'use client'

import { useRouter } from 'next/navigation'
import { Button, Link } from '@nextui-org/react'
import { LogOut } from 'lucide-react'
import NextLink from 'next/link'
import Image from 'next/image'

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
    <header className="fixed top-0 left-0 right-0 bg-black/80 z-50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <NextLink href="/admin" passHref legacyBehavior>
            <Link className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Afterlife Logo"
                width={32}
                height={32}
                priority
              />
              <span className="text-white/90 font-semibold">God Mode</span>
            </Link>
          </NextLink>
          
          <Button
            isIconOnly
            variant="light"
            onPress={handleLogout}
            className="bg-white/5 hover:bg-white/10"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
} 