import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const [recentOrders, recentReviews] = await prisma.$transaction([
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { logo: true },
      }),
      prisma.logo.findMany({
        take: 10,
        where: { status: 'REVIEW' },
        orderBy: { createdAt: 'desc' },
        include: { designer: true },
      }),
    ])

    const events = [
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        type: 'ORDER' as const,
        description: `New order for ${order.logo.title}`,
        timestamp: order.createdAt,
      })),
      ...recentReviews.map((logo) => ({
        id: `submission-${logo.id}`,
        type: 'SUBMISSION' as const,
        description: `New logo submission${logo.designer?.name ? ` from ${logo.designer.name}` : ''}: ${logo.title}`,
        timestamp: logo.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Timeline error:', error)
    return NextResponse.json({ error: 'Failed to load timeline' }, { status: 500 })
  }
}
