import type { Logo, Price } from '@prisma/client'

export type LogoStatus = 'AVAILABLE' | 'SOLD' | 'HIDDEN' | 'REVIEW' | 'DRAFT'
export type OrderStatus = 'SUMMONED' | 'REVIVED'
export type OrderTier = 'summon' | 'revival' | 'afterlife'

export interface LogoWithDetails extends Omit<Logo, 'designerEmail' | 'status'> {
  price: Price
  designerEmail: string | null
  status: LogoStatus
  wordmark?: string
}

export interface AnalyticsItem {
  name: string
  value: number
}

export interface OrderWithLogo {
  id: string
  logoId: string
  customerEmail: string
  amount: number
  tier: OrderTier
  wordmark: string
  domain: string
  stripeSessionId: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  logo: {
    designerEmail: string
    status: LogoStatus
    price: number
    title: string
    thumbnail: string
    description: string
    images: string[]
    tags: string[]
    id: string
    createdAt: Date
    updatedAt: Date
    priceId: string
  }
}

export interface TimelineEvent {
  id: string
  type: 'ORDER' | 'SUBMISSION' | 'APPROVAL' | 'DESIGNER'
  description: string
  timestamp: Date
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  latency?: number
  message?: string
}

export interface ResourceMetric {
  name: string
  used: number
  total: number
  unit: string
  icon: 'HardDrive' | 'Cpu' | 'Database'
}

export interface RevenueDataPoint {
  date: Date
  amount: number
  tier: OrderTier
}

export interface DashboardData {
  recentOrders: OrderWithLogo[]
  totalLogos: number
  pendingSubmissions: number
  totalRevenue: number
  totalOrders: number
  totalDesigners: number
  fulfilledThisMonth: number
  specialOrders: number
  revenueData: RevenueDataPoint[]
  analyticsData: {
    visitors: number
    pageViews: number
  }
  systemHealthData: ServiceStatus[]
  resourceMetrics: ResourceMetric[]
}
