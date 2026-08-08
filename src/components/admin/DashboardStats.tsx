import { Card } from '@nextui-org/react'
import { Database, HardDrive, Twitter } from 'lucide-react'

interface DashboardStatsProps {
  submissionCount: number
  storageUsed: number
  twitterFollowers: number
  dbSize: number
}

export function DashboardStats({ 
  submissionCount = 0,
  storageUsed = 0,
  twitterFollowers = 0,
  dbSize = 0
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Logo Submissions',
      value: submissionCount,
      icon: HardDrive,
      description: 'Total submissions',
      format: false
    },
    {
      label: 'Storage Used',
      value: storageUsed,
      icon: HardDrive,
      description: 'Total storage used',
      format: true
    },
    {
      label: 'Twitter Followers',
      value: twitterFollowers,
      icon: Twitter,
      description: 'Social reach',
      format: false
    },
    {
      label: 'Database Size',
      value: dbSize,
      icon: Database,
      description: 'Total database size',
      format: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const displayValue = stat.format ? `${stat.value.toFixed(2)} B` : stat.value
        return (
          <Card 
            key={stat.label}
            className="p-6 bg-black/20 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/5">
                <Icon className="w-6 h-6 text-white/90" />
              </div>
              <div>
                <p className="text-sm text-white/60">{stat.label}</p>
                <div className="text-2xl font-bold text-white/90">{displayValue}</div>
                <p className="text-xs text-white/40 mt-1">{stat.description}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
} 