import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifySession } from './auth'

export type ApiError = {
  message: string
  code?: string
  details?: string
  environment?: Record<string, string> // Replace any with appropriate type
}

export type ApiSuccess<T = unknown> = {
  success: true
  data?: T
  [key: string]: unknown // Replace any with unknown
}

export type ApiHandler = (req: Request) => Promise<NextResponse> | NextResponse

/**
 * Create a standardized success response
 */
export function successResponse<T = unknown>(data: ApiSuccess<T> | unknown, options: { headers?: Record<string, string>, status?: number } = {}) {
  // Ensure status is a valid HTTP status code (default to 200)
  const status = options.status && options.status >= 200 && options.status < 600 
    ? options.status 
    : 200;
  
  // Ensure data has success property
  const responseData = {
    success: true,
    ...(typeof data === 'object' ? data : { data })
  };
  
  return NextResponse.json(responseData, { 
    status,
    headers: options.headers
  });
}

/**
 * Create a standardized error response
 */
export function errorResponse(error: ApiError, status = 400) {
  // Ensure status is a valid HTTP status code
  const safeStatus = status >= 400 && status < 600 ? status : 400;
  
  return NextResponse.json(
    {
      success: false,
      ...error,
    },
    { status: safeStatus }
  )
}

export const protectApiRoute = (handler: ApiHandler) => async (req: Request) => {
  const headersList = headers()
  const session = headersList.get('Authorization')?.replace('Bearer ', '')
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const isValid = await verifySession(session)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    
    return handler(req)
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}