import { prisma } from '@/lib/prisma'

export type DesignerResolveInput = {
  designerId?: string | null
  designerName?: string | null
  designerEmail?: string | null
}

/**
 * Attach an existing designer by id, or create/find one by email when
 * name + email are provided for a new designer.
 */
export async function resolveDesignerForLogo(input: DesignerResolveInput) {
  const designerId = input.designerId?.trim() || null
  const designerName = input.designerName?.trim() || null
  const designerEmail = input.designerEmail?.trim().toLowerCase() || null

  if (designerId) {
    const existing = await prisma.designer.findUnique({ where: { id: designerId } })
    if (!existing) {
      throw new Error('Designer not found')
    }
    return existing
  }

  if (!designerEmail && !designerName) {
    return null
  }

  if (!designerEmail || !designerName) {
    throw new Error('New designer requires both name and email')
  }

  if (!designerEmail.includes('@')) {
    throw new Error('Designer email is invalid')
  }

  return prisma.designer.upsert({
    where: { email: designerEmail },
    create: {
      name: designerName,
      email: designerEmail,
    },
    update: {
      // Keep the stored name current when re-linking by email from add/edit.
      name: designerName,
    },
  })
}
