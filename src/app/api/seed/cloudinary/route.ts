import { errorResponse, successResponse } from '@/lib/api-utils'
import { seedFromCloudinary } from '@/lib/test-utils'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  // Only allow seeding in development or with correct API key
  const authHeader = request.headers.get('authorization')
  const isAuthorized = process.env.NODE_ENV === 'development' || 
                     authHeader === `Bearer ${process.env.SEED_SECRET}`
                     
  if (!isAuthorized) {
    return errorResponse({
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    }, 401)
  }

  try {
    console.log('Starting seeding process...')
    
    console.log('Cleaning existing data...')
    await prisma.logo.deleteMany()
    await prisma.price.deleteMany()
    
    console.log('Starting cloudinary seeding...')
    const result = await seedFromCloudinary()
    
    const count = await prisma.logo.count()
    console.log(`Seeding completed. Logo count: ${count}`)
    
    return successResponse(
      { success: true, count },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    return errorResponse({
      message: 'Seeding process failed',
      code: 'SEED_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}