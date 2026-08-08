import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Add your session verification logic here
  // This could be JWT verification, database check, etc.

  return NextResponse.json({ authenticated: true })
} 