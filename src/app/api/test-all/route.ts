import { NextResponse } from 'next/server'
import { cleanDatabase, createTestLogo, getAllLogos } from '@/lib/db'

export async function GET() {
  try {
    // Step 1: Clean the database
    console.log('Cleaning database...')
    await cleanDatabase()
    
    // Step 2: Create test logo
    console.log('Creating test logo...')
    const created = await createTestLogo()
    
    // Step 3: Fetch all logos
    console.log('Fetching all logos...')
    const allLogos = await getAllLogos()
    
    // Step 4: Clean up again
    console.log('Final cleanup...')
    await cleanDatabase()

    return NextResponse.json({
      message: 'All tests completed successfully',
      testResults: {
        created,
        allLogos
      }
    })
  } catch (error) {
    console.error('Test sequence failed:', error)
    return NextResponse.json(
      { 
        error: 'Test sequence failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 