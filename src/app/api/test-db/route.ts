import { NextResponse } from 'next/server'
import { createTestLogo } from '@/lib/db'

export async function GET() {
  try {
    const result = await createTestLogo()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Database test failed' },
      { status: 500 }
    )
  }
} 