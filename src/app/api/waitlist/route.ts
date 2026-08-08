import { subscribeToNewsletter } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, type = 'customer' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const response = await subscribeToNewsletter(email)

    if (!response.success) {
      return NextResponse.json(
        { error: response.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Successfully joined waitlist',
      success: true
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
} 