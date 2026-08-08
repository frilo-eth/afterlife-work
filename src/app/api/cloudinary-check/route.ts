import { errorResponse, successResponse } from '@/lib/api-utils'
import { getCloudinaryLogos } from '@/lib/cloudinary-utils'

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return errorResponse({
      message: 'Only available in development mode',
      code: 'UNAUTHORIZED',
    }, 401)
  }

  try {
    console.log('Checking Cloudinary resources...')
    
    // Get environment variable status
    const envStatus = {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set',
    }
    
    console.log('Cloudinary environment variables:', envStatus)
    
    try {
      const logos = await getCloudinaryLogos()
      
      // Group by folders
      const folderGroups: Record<string, number> = {}
      for (const logo of logos) {
        const folder = logo.folder || 'root'
        folderGroups[folder] = (folderGroups[folder] || 0) + 1
      }
      
      return successResponse({
        success: true,
        logoCount: logos.length,
        folders: folderGroups,
        environment: envStatus,
        sampleLogos: logos.slice(0, 5).map(logo => ({
          public_id: logo.public_id,
          url: logo.secure_url,
        })),
      })
    } catch (cloudinaryError) {
      return errorResponse({
        message: 'Failed to fetch Cloudinary logos',
        details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
        environment: envStatus,
      })
    }
  } catch (error) {
    return errorResponse({
      message: 'Check failed',
      code: 'CHECK_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 