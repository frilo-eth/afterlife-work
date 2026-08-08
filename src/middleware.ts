import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
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

  // Secure the admin API. Route handlers each call requireAdmin() as well —
  // this is the outer layer, so a handler that forgets the guard still fails
  // closed. Unauthenticated callers get a 401 rather than an HTML redirect.
  if (pathname.startsWith('/api/admin')) {
    const session = request.cookies.get('session')

    if (!session || !(await verifySession(session.value))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.next()
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
    // Pages: everything except Next internals, static assets, and /api.
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|fonts|images).*)',
    // The admin API is matched explicitly. The pattern above deliberately
    // excludes /api, which previously left these endpoints unguarded.
    '/api/admin/:path*',
  ],
}
