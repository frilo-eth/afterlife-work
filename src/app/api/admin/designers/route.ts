import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api-utils'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const designers = await prisma.designer.findMany({
      include: {
        _count: {
          select: {
            logos: true,
            submissions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      designers: designers.map(designer => ({
        ...designer,
        submissionCount: designer._count.logos + designer._count.submissions,
        _count: undefined
      }))
    })
  } catch (error) {
    console.error('Error fetching designers:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch designers',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
} 