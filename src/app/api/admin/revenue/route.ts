import { errorResponse, requireAdmin, successResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return errorResponse(
        {
          message: 'Start and end dates are required',
          code: 'MISSING_DATES',
        },
        400,
      )
    }

    const revenue = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    })

    const formattedRevenue = revenue.map((day) => ({
      date: day.createdAt.toISOString().split('T')[0],
      amount: day._sum.amount ?? 0,
    }))

    return successResponse({ revenue: formattedRevenue })
  } catch (error) {
    return errorResponse({
      message: 'Failed to fetch revenue data',
      code: 'REVENUE_FETCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
