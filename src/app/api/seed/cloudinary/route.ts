import { NextResponse } from 'next/server'
import { seedFromCloudinary } from '@/lib/test-utils'
import { headers } from 'next/headers'

const SEED_SECRET = process.env.SEED_SECRET

export async function POST() {
  const headersList = headers()
  const protectionBypass = headersList.get('x-vercel-protection-bypass')

  if (SEED_SECRET && protectionBypass !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await seedFromCloudinary()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Seed failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 