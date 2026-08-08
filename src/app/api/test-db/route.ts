import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const count = await prisma.logo.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      logoCount: count 
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 