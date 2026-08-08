import { NextResponse } from 'next/server'
import { logServiceError } from '@/lib/monitoring'

export function handleApiError(error: unknown, service: string) {
  logServiceError(service, error)
  
  if (error instanceof Error) {
    switch (error.name) {
      case 'StripeError':
        return NextResponse.json({
          success: false,
          error: 'Payment processing error',
          code: 'STRIPE_ERROR'
        }, { status: 402 })
        
      case 'PrismaClientKnownRequestError':
        return NextResponse.json({
          success: false,
          error: 'Database error',
          code: 'DB_ERROR'
        }, { status: 500 })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }, { status: 500 })
    }
  }
  
  return NextResponse.json({
    success: false,
    error: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR'
  }, { status: 500 })
} 