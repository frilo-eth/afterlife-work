import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
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

/**
 * Guard for admin-only route handlers.
 *
 * Returns a 401 response when the caller is not an authenticated admin, or
 * `null` when the request may proceed. Route handlers must check the return
 * value and bail out before doing any work:
 *
 *   const denied = await requireAdmin()
 *   if (denied) return denied
 *
 * This is enforced per route on purpose. Middleware alone is not sufficient —
 * its matcher previously excluded `/api`, which left every admin endpoint
 * publicly callable while the admin pages appeared protected.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = cookies().get('session')?.value

  if (!session) {
    return errorResponse({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  try {
    const isValid = await verifySession(session)
    if (!isValid) {
      return errorResponse({ message: 'Invalid session', code: 'UNAUTHORIZED' }, 401)
    }
  } catch {
    return errorResponse({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  return null
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