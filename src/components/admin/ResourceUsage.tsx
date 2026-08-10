'use client'

import { Progress } from '@nextui-org/react'
import { HardDrive, Cpu, Database } from 'lucide-react'

const ICONS = {
  HardDrive,
  Cpu,
  Database
}

interface ResourceMetric {
  name: string
  used: number
  total: number
  unit: string
  icon: keyof typeof ICONS
}

interface ResourceUsageProps {
  metrics: ResourceMetric[]
}

export function ResourceUsage({ metrics }: ResourceUsageProps) {
  const mockMetrics: ResourceMetric[] = [
    {
      name: 'Storage',
      used: 450,
      total: 1000,
      unit: 'GB',
      icon: 'HardDrive'
    },
    {
      name: 'CPU Usage',
      used: 65,
      total: 100,
      unit: '%',
      icon: 'Cpu'
    },
    {
      name: 'Database',
      used: 8,
      total: 10,
      unit: 'GB',
      icon: 'Database'
    }
  ]

  const metricsToShow = metrics.length > 0 ? metrics : mockMetrics

  return (
    <div className="space-y-6">
      {metricsToShow.map((metric) => {
        const Icon = ICONS[metric.icon]
        const percentage = (metric.used / metric.total) * 100
        const isWarning = percentage > 70
        const isDanger = percentage > 90

        return (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-foreground-subtle" />
                <span className="text-sm text-foreground">{metric.name}</span>
              </div>
              <span className="text-xs text-foreground-subtle">
                {metric.used}/{metric.total} {metric.unit}
              </span>
            </div>
            <Progress
              value={percentage}
              size="sm"
              radius="sm"
              classNames={{
                base: "max-w-full",
                track: "bg-secondary",
                indicator: "bg-accent"
              }}
            />
          </div>
        )
      })}
    </div>
  )
} 