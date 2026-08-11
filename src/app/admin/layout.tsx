'use client'

import { Activity, LayoutDashboard, Package, Receipt, Users } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminNav } from '@/components/AdminNav'
import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'

const SECTIONS = [
  { key: 'overview', label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { key: 'logos', label: 'Logos', href: '/admin/logos', icon: Package },
  { key: 'orders', label: 'Orders', href: '/admin/orders', icon: Receipt },
  { key: 'designers', label: 'Designers', href: '/admin/designers', icon: Users },
  { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: Activity },
] as const

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const segment = pathname.split('/')[2]
  const currentKey = !segment ? 'overview' : segment
  const selectedIndex = Math.max(
    0,
    SECTIONS.findIndex((section) => section.key === currentKey),
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />

      <main className="container relative mx-auto px-4 pt-24 pb-16">
        <nav aria-label="Admin sections" className="mb-8">
          <TabsSubtle
            selectedIndex={selectedIndex}
            onSelect={(index) => {
              const next = SECTIONS[index]
              if (next) router.push(next.href)
            }}
            activeLabel
          >
            {SECTIONS.map((section, index) => (
              <TabsSubtleItem
                key={section.key}
                index={index}
                icon={section.icon}
                label={section.label}
              />
            ))}
          </TabsSubtle>
        </nav>

        {children}
      </main>
    </div>
  )
}
