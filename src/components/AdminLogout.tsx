'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@nextui-org/react'
import { LogOut } from 'lucide-react'

export function AdminLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <Button
      variant="light"
      startContent={<LogOut size={18} />}
      onPress={handleLogout}
    >
      Logout
    </Button>
  )
} 