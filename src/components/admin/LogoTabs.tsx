'use client'

import { useState } from 'react'
import { Tabs, Tab } from "@nextui-org/react"
import { LogoGrid } from '../logo/LogoGrid'
import type { Logo, LogoStatus } from '@/types'

interface LogoTabsProps {
  groupedLogos: Record<LogoStatus, Logo[]>
  onLogoPress?: (id: string) => void
}

const STATUS_COLORS: Record<LogoStatus, string> = {
  AVAILABLE: 'success',
  SOLD: 'primary',
  HIDDEN: 'danger',
  REVIEW: 'warning',
  DRAFT: 'default'
}

export function LogoTabs({ groupedLogos, onLogoPress }: LogoTabsProps) {
  const [selected, setSelected] = useState<string>('AVAILABLE')
  
  const totalCounts = Object.entries(groupedLogos).reduce((acc, [status, logos]) => {
    acc[status] = logos.length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex w-full flex-col">
      <Tabs 
        selectedKey={selected}
        onSelectionChange={key => setSelected(key as string)}
        color="primary"
        variant="bordered"
        classNames={{
          tabList: "gap-4 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-4 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        {Object.entries(groupedLogos).map(([status, logos]) => (
          <Tab
            key={status}
            title={
              <div className="flex items-center space-x-2">
                <span>{status}</span>
                <span className={`px-2 py-1 text-xs rounded-full bg-${STATUS_COLORS[status as LogoStatus]}/20`}>
                  {totalCounts[status]}
                </span>
              </div>
            }
          >
            <div className="pt-4">
              <LogoGrid 
                logos={logos} 
                onLogoPress={onLogoPress}
              />
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  )
} 