import { errorResponse, successResponse } from '@/lib/api-utils'
import { seedFromCloudinary } from '@/lib/test-utils'

export async function POST() {
  try {
    const result = await seedFromCloudinary()
    return successResponse(result)
  } catch (error) {
    return errorResponse({
      message: 'Seed operation failed',
      code: 'SEED_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 