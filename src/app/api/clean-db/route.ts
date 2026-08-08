import { errorResponse, successResponse } from '@/lib/api-utils'
import { cleanDatabase } from '@/lib/db'

export async function GET() {
  try {
    await cleanDatabase()
    return successResponse({ message: 'Database cleaned successfully' })
  } catch (error) {
    return errorResponse({
      message: 'Failed to clean database',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'DB_CLEAN_ERROR'
    })
  }
} 