import { errorResponse, successResponse } from '@/lib/api-utils'
import { cleanDatabase, createTestLogo, getAllLogos } from '@/lib/db'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const results = {
    db: false,
    stripe: false,
    email: false,
    details: {} as Record<string, unknown>
  }
  
  try {
    // Test DB
    const dbCount = await prisma.logo.count()
    results.db = true
    results.details.dbCount = dbCount
    
    // Test Stripe
    const stripeProducts = await stripe.products.list({ limit: 1 })
    results.stripe = true
    results.details.stripeProductCount = stripeProducts.data.length
    
    // Test Email
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: 'Afterlife <orders@afterlife.work>',
      to: process.env.ADMIN_EMAIL || '',
      subject: 'Test Email',
      text: 'Test successful'
    })
    
    if (error) throw error
    results.email = true
    results.details.emailId = data?.id
    
    return NextResponse.json({
      success: true,
      results,
      message: 'All services tested successfully'
    })
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      results,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: results.details
    }, { status: 500 })
  }
}