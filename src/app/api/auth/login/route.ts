import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { logAdminAccess } from '@/lib/admin-logger'
import { generateSession, verifyPassword } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = headers().get('x-forwarded-for') || 'unknown'

  console.log('Login attempt from IP:', ip)

  // Check rate limit
  if (!checkRateLimit(ip, true)) {
    console.log('Rate limit exceeded for IP:', ip)
    await logAdminAccess('login-blocked', ip, false)
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 },
    )
  }

  try {
    const { password } = await request.json()
    console.log('Attempting password verification')

    const isValid = await verifyPassword(password)
    console.log('Password verification result:', isValid)

    if (!isValid) {
      await logAdminAccess('login-failed', ip, false)
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    console.log('Generating session for successful login')
    const session = await generateSession('admin-user')

    cookies().set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    await logAdminAccess('login-success', ip, true)
    console.log('Login successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    await logAdminAccess('login-error', ip, false)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
