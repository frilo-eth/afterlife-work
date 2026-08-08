import { errorResponse, successResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  // Only allow in development or with correct API key
  const authHeader = request.headers.get('authorization')
  const bypassHeader = request.headers.get('x-vercel-protection-bypass')
  const isAuthorized = process.env.NODE_ENV === 'development' || 
                     authHeader === `Bearer ${process.env.SEED_SECRET}` ||
                     bypassHeader === process.env.NEXT_PUBLIC_SEED_SECRET

  if (!isAuthorized) {
    return errorResponse({
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    }, 401)
  }

  try {
    console.log('Starting gallery cleanup process...')
    
    // Find all logos
    const allLogos = await prisma.logo.findMany({
      include: {
        gallery: true
      }
    })
    
    console.log(`Found ${allLogos.length} total logos`)
    
    // Identify likely gallery images that were added as logos
    const galleryPatternLogos = allLogos.filter(logo => 
      logo.images[0].includes('/logos/gallery/') ||
      logo.thumbnail.includes('/logos/gallery/')
    )
    
    console.log(`Found ${galleryPatternLogos.length} logos with gallery image patterns`)
    
    // For each logo with gallery pattern
    const results = await Promise.all(galleryPatternLogos.map(async (galleryLogo) => {
      // Find a potential parent logo
      const possibleMainLogos = allLogos.filter(mainLogo => 
        !mainLogo.images[0].includes('/logos/gallery/') &&
        !mainLogo.thumbnail.includes('/logos/gallery/') &&
        // Use title similarity as a heuristic to find the parent logo
        mainLogo.title.replace(' ', '').toLowerCase().includes(
          galleryLogo.title.replace(' ', '').toLowerCase()
        )
      )
      
      if (possibleMainLogos.length > 0) {
        const mainLogo = possibleMainLogos[0]
        
        // Create gallery entry for the main logo
        await prisma.logoGallery.create({
          data: {
            logoId: mainLogo.id,
            imageUrl: galleryLogo.images[0]
          }
        })
        
        // Delete the gallery image that was added as a logo
        await prisma.logo.delete({
          where: {
            id: galleryLogo.id
          }
        })
        
        return {
          success: true,
          galleryLogoId: galleryLogo.id,
          mainLogoId: mainLogo.id,
          action: 'moved_and_deleted'
        }
      }
      
      return {
        success: false,
        galleryLogoId: galleryLogo.id,
        action: 'no_matching_main_logo'
      }
    }))
    
    const successCount = results.filter(r => r.success).length
    
    // Set response headers in NextResponse instead of as a second argument
    const response = successResponse({
      success: true, 
      processed: galleryPatternLogos.length,
      fixed: successCount,
      results
    })
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Gallery cleanup failed:', error)
    return errorResponse({
      message: 'Gallery cleanup failed',
      code: 'CLEANUP_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 