import { errorResponse, successResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return successResponse({ status: 'Database connection successful' })
  } catch (error) {
    return errorResponse({
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'DB_CONNECTION_ERROR'
    })
  }
} 