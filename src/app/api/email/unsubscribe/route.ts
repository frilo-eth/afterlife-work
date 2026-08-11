import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

/**
 * One-click / link unsubscribe for Apple + Gmail bulk-sender requirements.
 */
async function suppress(email: string, source: string) {
  const normalized = email.trim().toLowerCase()
  if (!normalized?.includes('@')) return false

  console.info('[unsubscribe]', { email: normalized, source })

  try {
    if (redis.status === 'ready') {
      // 5 years — treat as durable opt-out
      await redis.setex(`email:suppress:${normalized}`, 60 * 60 * 24 * 365 * 5, source)
    }
  } catch (error) {
    console.error('[unsubscribe] failed to persist suppression', error)
  }

  return true
}

function parseEmail(request: Request, bodyEmail?: string) {
  const url = new URL(request.url)
  return (bodyEmail || url.searchParams.get('email') || '').trim()
}

export async function GET(request: Request) {
  const email = parseEmail(request)
  const ok = email ? await suppress(email, 'link') : false

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5;color:#111">
  <h1 style="font-size:1.25rem">You're unsubscribed</h1>
  <p>${ok ? 'You will no longer receive outreach email from Afterlife.' : 'Missing or invalid email address.'}</p>
  <p><a href="https://afterlife.work">afterlife.work</a></p>
</body></html>`

  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(request: Request) {
  // RFC 8058 one-click: providers POST with List-Unsubscribe=One-Click
  let bodyEmail: string | undefined
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      const json = (await request.json()) as { email?: string }
      bodyEmail = json.email
    } else if (contentType.includes('form')) {
      const form = await request.formData()
      const value = form.get('email')
      bodyEmail = typeof value === 'string' ? value : undefined
    }
  } catch {
    // Empty body is fine when email is in the query string.
  }

  const email = parseEmail(request, bodyEmail)
  const ok = email ? await suppress(email, 'one-click') : false

  return new NextResponse(null, { status: ok ? 202 : 400 })
}
