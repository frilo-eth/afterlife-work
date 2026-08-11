import { NextResponse } from 'next/server'
import { trackEvent } from '@/lib/track-event'

const ALLOWED = new Set([
  'logo_view',
  'submit_open',
  'submit_complete',
  'checkout_started',
  'checkout_completed',
  'checkout_failed',
  'subscribe',
])

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name : ''
    if (!ALLOWED.has(name)) {
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
    }

    await trackEvent({
      name,
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
      logoId: typeof body.logoId === 'string' ? body.logoId : null,
      path: typeof body.path === 'string' ? body.path : null,
      props:
        body.props && typeof body.props === 'object' && !Array.isArray(body.props)
          ? (body.props as Record<string, unknown>)
          : null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
