import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'

export async function GET() {
  const session = cookies().get('session')?.value

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Presence of the cookie is not proof of anything — the token has to be
  // verified, or a client can authenticate itself by setting any value.
  const isValid = await verifySession(session)

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
