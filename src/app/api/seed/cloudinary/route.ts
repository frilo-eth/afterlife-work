import { NextResponse } from 'next/server'
import { seedFromCloudinary } from '@/lib/test-utils'

export async function POST() {
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