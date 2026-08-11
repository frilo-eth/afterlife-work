import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { CATALOG_TAG } from '@/lib/catalog'
import { assertManualStatusChange, isLogoStatus } from '@/lib/logo-status'
import { prisma } from '@/lib/prisma'
import { CACHE_KEYS, invalidateCache } from '@/lib/redis'

/**
 * Lightweight status-only update for the admin logos table.
 * Avoids the full edit pipeline (images, tags validation, Cloudinary).
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json().catch(() => null)
    const nextStatus = body?.status

    if (!isLogoStatus(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const existing = await prisma.logo.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    const allowed = assertManualStatusChange(existing.status, nextStatus)
    if (!allowed.ok) {
      return NextResponse.json({ error: allowed.message }, { status: 409 })
    }

    if (existing.status === nextStatus) {
      return NextResponse.json({ success: true, status: nextStatus })
    }

    const updated = await prisma.logo.update({
      where: { id: params.id },
      data: { status: nextStatus },
      select: { id: true, slug: true, status: true, updatedAt: true },
    })

    // Don't await cache work — status UI is already optimistic on the client.
    void Promise.all([
      invalidateCache(CACHE_KEYS.ALL_LOGOS),
      invalidateCache(CACHE_KEYS.LOGO_BY_ID(params.id)),
    ]).catch(() => {})

    revalidatePath('/admin/logos')
    revalidatePath(`/${updated.slug}`)
    revalidatePath(`/${params.id}`)
    revalidateTag(CATALOG_TAG)

    return NextResponse.json({
      success: true,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to update logo status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 },
    )
  }
}
