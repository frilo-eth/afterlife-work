import { errorResponse, requireAdmin, successResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { sendLogoApprovalNotification } from '@/lib/notifications'
import type { Logo, LogoStatus } from '@/types/index'
import { revalidateTag } from 'next/cache'
import { CATALOG_TAG } from '@/lib/catalog'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const logo = await prisma.logo.update({
      where: { id: params.id },
      data: { status: 'AVAILABLE' as LogoStatus },
      include: {
        price: true
      }
    })

    // Transform the Prisma result to match our Logo type
    const transformedLogo: Logo = {
      ...logo,
      status: logo.status as LogoStatus,
      // Use optional chaining to safely access designerEmail if it exists
      // or remove the property if it doesn't belong in the Logo type
      // @ts-ignore - We know this property exists at runtime
      designerEmail: logo.designerEmail || undefined,
      price: {
        id: logo.price.id,
        summon: logo.price.summon,
        revival: logo.price.revival,
        afterlife: logo.price.afterlife
      }
    }

    await sendLogoApprovalNotification(transformedLogo)

    revalidateTag(CATALOG_TAG)

    return successResponse({ logo: transformedLogo })
  } catch (error) {
    return errorResponse({
      message: 'Failed to approve logo',
      code: 'LOGO_APPROVE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 