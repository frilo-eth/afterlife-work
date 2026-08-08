'use client'

import { Tabs, Tab } from "@nextui-org/react"
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Image as ImageIcon
} from 'lucide-react'
import { DashboardStats } from './DashboardStats'
import { LogosTable } from './LogosTable'
import { useState, useEffect } from 'react'
import type { Logo, LogoWithDetails } from '@/types'

const tabs = [
  { 
    key: 'dashboard', 
    label: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
  },
  { 
    key: 'logos', 
    label: 'Logos', 
    href: '/admin/logos', 
    icon: ImageIcon,
  }
]

export const AdminTabs = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [logos, setLogos] = useState<LogoWithDetails[]>([])
  const currentTab = tabs.find(tab => pathname === tab.href)?.key || 'dashboard'

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/logos')
        const data = await response.json()
        if (data.logos) {
          setLogos(data.logos as LogoWithDetails[])
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error)
      }
    }

    fetchLogos()
  }, [])

  return (
    <Tabs 
      aria-label="Admin sections"
      selectedKey={currentTab}
      onSelectionChange={(key) => {
        const tab = tabs.find(t => t.key === key)
        if (tab) router.push(tab.href)
      }}
      classNames={{
        base: "w-fit",
        tabList: "p-1 gap-1 h-11 rounded-lg",
        cursor: "bg-neutral-800",
        tab: "h-9 px-3 data-[selected=true]:bg-neutral-800 rounded-md",
        tabContent: "text-neutral-400 group-data-[selected=true]:text-neutral-100"
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          title={
            <div className="flex items-center gap-2">
              <tab.icon size={18} />
              <span className="text-sm font-medium">{tab.label}</span>
            </div>
          }
        />
      ))}
    </Tabs>
  )
} 