import { NextResponse } from 'next/server'
import { cleanDatabase } from '@/lib/db'

export async function GET() {
  try {
    await cleanDatabase()
    return NextResponse.json({ message: 'Database cleaned successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clean database' },
      { status: 500 }
    )
  }
} 