import { Database, HardDrive, Twitter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardStatsProps {
  submissionCount: number
  storageUsed: number
  twitterFollowers: number
  dbSize: number
}

// Sizes arrive in bytes; showing "1234567.00 B" is technically true and
// practically unreadable, so they are scaled to the nearest sensible unit.
const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = -1
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

export function DashboardStats({
  submissionCount = 0,
  storageUsed = 0,
  twitterFollowers = 0,
  dbSize = 0,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Logo submissions',
      value: String(submissionCount),
      icon: HardDrive,
      description: 'Total submissions',
    },
    {
      label: 'Storage used',
      value: formatBytes(storageUsed),
      icon: HardDrive,
      description: 'Across Cloudinary',
    },
    {
      label: 'Twitter followers',
      value: String(twitterFollowers),
      icon: Twitter,
      description: 'Social reach',
    },
    {
      label: 'Database size',
      value: formatBytes(dbSize),
      icon: Database,
      description: 'Total database size',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-secondary p-3">
                  <Icon className="h-6 w-6 text-foreground/90" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="text-2xl font-bold text-foreground/90">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
