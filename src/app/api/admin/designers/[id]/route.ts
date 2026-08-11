import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { normalizeTwitterHandle, normalizeWebsiteUrl } from '@/lib/slug'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { id } = params
    const body = await request.json()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const existing = await prisma.designer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Designer not found' }, { status: 404 })
    }

    const emailTaken = await prisma.designer.findFirst({
      where: { email, NOT: { id } },
      select: { id: true },
    })
    if (emailTaken) {
      return NextResponse.json(
        { error: 'Another designer already uses that email' },
        { status: 409 },
      )
    }

    const designer = await prisma.designer.update({
      where: { id },
      data: {
        name,
        email,
        twitter: normalizeTwitterHandle(typeof body.twitter === 'string' ? body.twitter : null),
        website: normalizeWebsiteUrl(typeof body.website === 'string' ? body.website : null),
        bio: typeof body.bio === 'string' && body.bio.trim() ? body.bio.trim() : null,
      },
    })

    return NextResponse.json({ designer })
  } catch (error) {
    console.error('Error updating designer:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update designer',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { id } = params

    const designer = await prisma.designer.findUnique({ where: { id } })
    if (!designer) {
      return NextResponse.json({ error: 'Designer not found' }, { status: 404 })
    }

    // Logos/submissions keep their rows; FK is ON DELETE SET NULL.
    await prisma.designer.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting designer:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete designer',
      },
      { status: 500 },
    )
  }
}
