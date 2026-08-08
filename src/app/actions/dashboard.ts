'use server'

import { prisma } from '@/lib/prisma'
import type { DashboardData, OrderWithLogo, LogoStatus } from '@/types/admin'

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const [
      orders,
      totalLogos,
      pendingSubmissions,
      totalRevenue,
      totalOrders,
      designerEmails,
      fulfilledThisMonth,
      specialOrders
    ] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          logoId: true,
          customerEmail: true,
          wordmark: true,
          domain: true,
          tier: true,
          amount: true,
          createdAt: true,
          updatedAt: true,
          stripeSessionId: true,
          logo: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              status: true,
              priceId: true
            }
          }
        }
      }),
      prisma.logo.count(),
      prisma.logo.count({ where: { status: 'REVIEW' } }),
      prisma.order.aggregate({ _sum: { amount: true } }),
      prisma.order.count(),
      prisma.logo.findMany({ select: { designerEmail: true }, distinct: ['designerEmail'] }),
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(new Date().setDate(1)) }
        }
      }),
      prisma.order.count({ where: { tier: 'revival' } })
    ])

    // Transform orders to include derived status
    const recentOrders = orders.map(order => ({
      ...order,
      status: order.tier === 'summon' ? 'SUMMONED' : 'REVIVED'
    })) as OrderWithLogo[]

    return {
      recentOrders,
      totalLogos,
      pendingSubmissions,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOrders,
      totalDesigners: designerEmails.length,
      fulfilledThisMonth,
      specialOrders,
      revenueData: [
        { date: new Date('2024-01-01'), amount: 1500, tier: 'summon' as const },
        { date: new Date('2024-01-15'), amount: 2500, tier: 'revival' as const },
        { date: new Date('2024-02-01'), amount: 3500, tier: 'summon' as const }
      ],
      analyticsData: {
        visitors: 1000,
        pageViews: 5000
      },
      systemHealthData: [
        { name: 'API', status: 'healthy' as const, latency: 45 },
        { name: 'Database', status: 'healthy' as const, latency: 85 },
        { name: 'Storage', status: 'warning' as const, message: 'High usage' }
      ],
      resourceMetrics: [
        {
          name: 'Storage',
          used: 450,
          total: 1000,
          unit: 'GB',
          icon: 'HardDrive' as const
        },
        {
          name: 'CPU Usage',
          used: 65,
          total: 100,
          unit: '%',
          icon: 'Cpu' as const
        },
        {
          name: 'Database',
          used: 8,
          total: 10,
          unit: 'GB',
          icon: 'Database' as const
        }
      ]
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    throw new Error('Failed to load dashboard data')
  }
} 