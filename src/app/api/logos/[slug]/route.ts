import { errorResponse, successResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const logo = await prisma.logo.findUnique({
      where: {
        id: params.slug,
      },
      include: {
        price: true,
        gallery: true,
      },
    })

    if (!logo) {
      return errorResponse(
        {
          message: 'Logo not found',
          code: 'LOGO_NOT_FOUND',
        },
        404,
      )
    }

    // Transform the logo to include gallery images in the images array
    const transformedLogo = {
      ...logo,
      // Include the main thumbnail as the first image, then add all gallery images
      images: [logo.thumbnail, ...logo.gallery.map((item) => item.imageUrl)].filter(Boolean), // Filter out any null/undefined values
    }

    return successResponse(transformedLogo)
  } catch (error) {
    return errorResponse({
      message: 'Failed to fetch logo',
      code: 'LOGO_FETCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
