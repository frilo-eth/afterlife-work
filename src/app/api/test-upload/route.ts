import { NextResponse } from 'next/server'
import { testUpload } from '@/lib/uploadFile'

export async function GET() {
  try {
    const result = await testUpload()
    return NextResponse.json({ 
      success: result,
      message: result ? 'Upload test passed' : 'Upload test failed'
    })
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 