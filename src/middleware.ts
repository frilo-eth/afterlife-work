import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const { pathname } = request.nextUrl

  // Special handling for the teaser route
  if (pathname === '/teaser') {
    // Allow access to the teaser route directly
    return NextResponse.next()
  }

  // Special handling for the [slug] route when slug is 'teaser'
  if (pathname.match(/^\/teaser$/)) {
    return NextResponse.next()
  }
  
  // Apply rate limiting to all API routes
  if (pathname.startsWith('/api')) {
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  // Secure admin routes
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('session')
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const isValid = await verifySession(session.value)
      if (!isValid) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Check if we want to show the teaser (controlled by environment variable)
  // This can be toggled with SHOW_TEASER=true in your .env file
  const showTeaser = process.env.SHOW_TEASER === 'true'
  
  if (showTeaser && pathname === '/') {
    // Add view=main parameter check
    const { searchParams } = request.nextUrl
    const viewParam = searchParams.get('view')
    
    if (viewParam !== 'main') {
      return NextResponse.redirect(new URL('/teaser', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|fonts|images).*)',
  ],
} 