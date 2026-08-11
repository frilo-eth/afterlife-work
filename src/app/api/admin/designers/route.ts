import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { normalizeTwitterHandle, normalizeWebsiteUrl } from '@/lib/slug'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const designers = await prisma.designer.findMany({
      include: {
        logos: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            logos: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      designers: designers.map((designer) => {
        const { _count, logos, ...rest } = designer
        return {
          ...rest,
          logos,
          logoCount: _count.logos,
          submissionCount: _count.logos + _count.submissions,
        }
      }),
    })
  } catch (error) {
    console.error('Error fetching designers:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch designers',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Email is invalid' }, { status: 400 })
    }

    const designer = await prisma.designer.upsert({
      where: { email },
      create: {
        name,
        email,
        twitter: normalizeTwitterHandle(typeof body.twitter === 'string' ? body.twitter : null),
        website: normalizeWebsiteUrl(typeof body.website === 'string' ? body.website : null),
        bio: typeof body.bio === 'string' && body.bio.trim() ? body.bio.trim() : null,
      },
      update: {
        name,
        twitter:
          typeof body.twitter === 'string' ? normalizeTwitterHandle(body.twitter) : undefined,
        website: typeof body.website === 'string' ? normalizeWebsiteUrl(body.website) : undefined,
        bio: typeof body.bio === 'string' && body.bio.trim() ? body.bio.trim() : undefined,
      },
    })

    return NextResponse.json({ designer }, { status: 201 })
  } catch (error) {
    console.error('Error creating designer:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create designer',
      },
      { status: 500 },
    )
  }
}
