import { NextResponse } from 'next/server'
import { Resend } from 'resend'

interface Domain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region: string;
}

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // First, list all domains
    const response = await resend.domains.list()
    console.log('Available domains:', response)

    // Handle the nested data structure
    if (!response?.data?.data || !Array.isArray(response.data.data)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No domains found or invalid response',
        response // Include the response for debugging
      })
    }

    const domains = response.data.data as Domain[]

    // Then verify each domain using its ID
    const results = await Promise.all(
      domains.map(async (domain) => {
        try {
          const result = await resend.domains.verify(domain.id)
          return { 
            domain: domain.name, 
            id: domain.id,
            status: domain.status,
            success: true, 
            result 
          }
        } catch (error) {
          console.error(`Failed to verify domain ${domain.name}:`, error)
          return { 
            domain: domain.name, 
            id: domain.id,
            status: domain.status,
            success: false, 
            error 
          }
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      results,
      message: 'Check the console for detailed domain information'
    })
  } catch (error) {
    console.error('Domain verification failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 