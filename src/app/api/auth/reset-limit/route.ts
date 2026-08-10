import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { resetRateLimit } from '@/lib/rate-limit'

export async function POST(_request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const ip = headers().get('x-forwarded-for') || 'unknown'
  resetRateLimit(ip)

  return NextResponse.json({ success: true })
}
