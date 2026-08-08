import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [recentOrders, recentSubmissions] = await prisma.$transaction([
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { logo: true }
      }),
      prisma.logoSubmission.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    const events = [
      ...recentOrders.map(order => ({
        id: `order-${order.id}`,
        type: 'ORDER' as const,
        description: `New order for ${order.logo.title}`,
        timestamp: order.createdAt
      })),
      ...recentSubmissions.map(submission => ({
        id: `submission-${submission.id}`,
        type: 'SUBMISSION' as const,
        description: `New logo submission from ${submission.designerName}`,
        timestamp: submission.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Timeline fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
} 