import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CACHE_KEYS, getFromCache, warmUpCache } from '@/lib/redis'
import type { LogoStatus, LogoWithDetails } from '@/types'

export async function GET() {
  try {
    // Try to get logos from cache first
    const cachedLogos = await getFromCache<LogoWithDetails[]>(CACHE_KEYS.ALL_LOGOS)

    if (cachedLogos) {
      return NextResponse.json(
        {
          logos: cachedLogos,
          groupedLogos: groupLogosByStatus(cachedLogos),
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=59',
          },
        },
      )
    }

    // If not in cache, fetch from database with all related data
    const logos = await prisma.logo.findMany({
      include: {
        price: true,
        gallery: true,
        designer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform the data to match LogoWithDetails type
    const transformedLogos = logos.map((logo) => ({
      ...logo,
      createdAt: logo.createdAt.toISOString(),
      updatedAt: logo.updatedAt.toISOString(),
      price: logo.price
        ? {
            ...logo.price,
            createdAt: logo.price.createdAt.toISOString(),
            updatedAt: logo.price.updatedAt.toISOString(),
          }
        : null,
      gallery: logo.gallery.map((g) => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
      designer: logo.designer
        ? {
            id: logo.designer.id,
            name: logo.designer.name,
            email: logo.designer.email,
          }
        : null,
    })) as LogoWithDetails[]

    // Group logos by status
    const groupedLogos = groupLogosByStatus(transformedLogos)

    // Warm up the cache with transformed data
    await warmUpCache(transformedLogos)

    return NextResponse.json(
      {
        logos: transformedLogos,
        groupedLogos,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=59',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching logos:', error)
    return NextResponse.json({ error: 'Failed to fetch logos' }, { status: 500 })
  }
}

// Helper function to group logos by status
function groupLogosByStatus(logos: LogoWithDetails[]): Record<LogoStatus, LogoWithDetails[]> {
  const grouped = logos.reduce(
    (acc, logo) => {
      const status = logo.status as LogoStatus
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(logo)
      return acc
    },
    {} as Record<LogoStatus, LogoWithDetails[]>,
  )

  // Ensure all status groups exist
  const allStatuses: LogoStatus[] = ['AVAILABLE', 'SOLD', 'REVIEW', 'DRAFT', 'HIDDEN', 'TRASH']
  for (const status of allStatuses) {
    if (!grouped[status]) {
      grouped[status] = []
    }
  }

  return grouped
}
