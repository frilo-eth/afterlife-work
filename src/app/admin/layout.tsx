'use client'

import type { ReactNode } from "react"
import type { Key } from "react"
import { Tabs, Tab } from "@nextui-org/react"
import { usePathname, useRouter } from "next/navigation"
import { AdminTabs } from '@/components/admin/AdminTabs'
import { AdminNav } from '@/components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const currentPath = pathname.split('/')[2] || ''
  
  const handleTabChange = (key: Key) => {
    router.push(key === 'dashboard' ? '/admin' : `/admin/${key}`)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900/50 to-black text-white">
      <AdminNav />
      <main className="container mx-auto px-6 relative">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        <Tabs 
          selectedKey={currentPath || 'logos'} 
          onSelectionChange={handleTabChange}
          className="mb-6"
        >
          {/* Remove or comment out the Dashboard tab */}
          {/* <Tab key="dashboard" title="Dashboard" /> */}
          <Tab key="logos" title="Logos" />
          <Tab key="submissions" title="Submissions" />
          <Tab key="orders" title="Orders" />
          <Tab key="designers" title="Designers" />
          {/* Add any other tabs you want to keep */}
        </Tabs>
        <div className="mt-6 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
} 