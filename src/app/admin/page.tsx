'use client'

import React, { useEffect } from 'react'
import { Card, Badge } from '@nextui-org/react'
import { 
  DashboardStats, 
  RecentOrders, 
  RevenueChart,
  AnalyticsChart,
  SystemHealth,
  ResourceUsage,
  CostAnalysis
} from '@/components/admin'
import type { DashboardData, OrderTier, LogoStatus, OrderStatus, OrderWithLogo, AnalyticsItem } from '@/types/admin'
import { Twitter, Circle, HardDrive as HardDriveIcon, Cpu as CpuIcon, Database as DatabaseIcon, TrendingUp } from 'lucide-react'
import { Progress } from '@nextui-org/react'
import { fetchDashboardData } from '../actions/dashboard'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'

interface AnalyticsSection {
  title: string
  data: AnalyticsItem[]
}

// Default export for the main page component - redirects to logos
export default function AdminPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to logos page
    router.replace('/admin/logos')
  }, [router])
  
  // Show loading while redirecting
  return <LoadingScreen isLoading={true} />
}

// Renamed function and REMOVED the export keyword to avoid Next.js errors
function AdminDashboardContent() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl text-red-500">Failed to load admin dashboard</h2>
        <p className="text-foreground-muted">{error}</p>
      </div>
    )
  }
  if (!data) return null

  const transformedOrders = data.recentOrders.map((order: OrderWithLogo) => ({
    ...order,
    status: (order.tier === 'summon' ? 'SUMMONED' : 'REVIVED') as OrderStatus,
  }))

  const revenueData = data.revenueData

  const analyticsData = {
    revenue: { _sum: { amount: data.totalRevenue } },
    ordersByTier: [
      { tier: 'summon', _count: 15 },
      { tier: 'revival', _count: 8 }
    ],
    popularLogos: [],
    visitors: 1000,
    pageViews: 5000
  }

  const systemHealthData = data.systemHealthData

  const resourceMetrics = data.resourceMetrics

  const costMetrics = [
    {
      name: 'Storage Cost',
      current: 8500,
      previous: 7200,
      trend: 18,
      unit: 'currency'
    }
  ]

  return (
    <div className="space-y-6 mb-12">
      <DashboardStats 
        {...data} 
        submissionCount={data.pendingSubmissions}
        storageUsed={data.resourceMetrics.find(m => m.name === 'Storage')?.used || 0}
        twitterFollowers={2100} // Default value since we don't have real data
        dbSize={data.resourceMetrics.find(m => m.name === 'Database')?.used || 0}
      />

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-foreground-muted">Recent Orders</p>
            <span className="text-xs text-foreground-muted">Last 30 Days</span>
          </div>
          <RecentOrders orders={data.recentOrders} />
        </Card>
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-foreground-muted">Revenue Growth</p>
            <span className="text-xs text-foreground-muted">This Month</span>
          </div>
          <RevenueChart data={data.revenueData} />
        </Card>
      </div>

      {/* Third Row - Analytics */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-foreground-muted">Traffic Overview</h4>
            <span className="text-xs text-foreground-muted">Live</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{analyticsData.visitors}</div>
              <p className="text-sm text-foreground-muted">Total Visitors</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{analyticsData.pageViews}</div>
              <p className="text-sm text-foreground-muted">Page Views</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">32%</div>
              <p className="text-sm text-foreground-muted">Bounce Rate</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">127</div>
              <p className="text-sm text-foreground-muted">Live Users</p>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Countries', data: [
              { name: 'USA', value: 45 },
              { name: 'UK', value: 25 },
              { name: 'DE', value: 15 }
            ]},
            { title: 'Devices', data: [
              { name: 'Desktop', value: 68 },
              { name: 'Mobile', value: 28 },
              { name: 'Tablet', value: 4 }
            ]},
            { title: 'OS', data: [
              { name: 'macOS', value: 55 },
              { name: 'Windows', value: 35 },
              { name: 'Linux', value: 10 }
            ]},
            { title: 'Sources', data: [
              { name: 'Direct', value: 40 },
              { name: 'Social', value: 35 },
              { name: 'Search', value: 25 }
            ]}
          ].map(({ title, data }: AnalyticsSection) => (
            <Card key={title} className="p-4 bg-background/20 backdrop-blur-sm border border-border">
              <h4 className="text-sm text-foreground-muted mb-2">{title}</h4>
              <div className="space-y-2">
                {data.map((item: AnalyticsItem) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <Progress 
                      value={item.value} 
                      size="sm"
                      classNames={{
                        base: "max-w-full",
                        track: "bg-accent",
                        indicator: "bg-accent"
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-foreground-subtle">System Health</h4>
            <div className="flex items-center gap-2">
              <span className="bg-green-500/20 text-green-400 text-[10px] px-3 py-1 rounded-full">
                OPERATIONAL
              </span>
            </div>
          </div>
          <div className="grid gap-3">
            {systemHealthData.map(service => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle 
                    className={`w-2 h-2 ${
                      service.status === 'healthy' ? 'text-green-500' :
                      service.status === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} 
                    fill="currentColor"
                  />
                  <span className="text-sm">{service.name}</span>
                </div>
                <span className="text-xs text-foreground-muted">{service.latency}ms</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-foreground-muted">Resource Usage</h4>
            <span className="text-xs text-foreground-muted">Real-time</span>
          </div>
          <ResourceUsage metrics={resourceMetrics} />
        </Card>
        
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-foreground-muted">Cost Analysis</p>
            <span className="text-xs text-foreground-muted">Monthly</span>
          </div>
          <div className="w-full">
            <CostAnalysis metrics={costMetrics} burnRate={12500} estimatedAnnual={150000} />
          </div>
        </Card>
        
        <Card className="p-6 bg-background/20 backdrop-blur-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-foreground-muted">Socials</h4>
            <span className="text-xs text-foreground-muted">Overview</span>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-foreground-muted">Active Designers</p>
              <div className="text-2xl font-bold mt-1">{data.totalDesigners}</div>
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12%
              </div>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Twitter Audience</p>
              <div className="text-2xl font-bold mt-1">2.1k</div>
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +138 Followers
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 