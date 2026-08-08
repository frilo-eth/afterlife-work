import { stripe } from '@/lib/stripe'
import { calculatePrice, type PriceTier } from '@/lib/price-constants'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-utils'
import { ensureDbConnection } from '@/lib/db-utils'

export async function POST(req: Request) {
  try {
    // Ensure DB connection
    await ensureDbConnection()
    
    const body = await req.json()
    console.log('Creating checkout with:', body)

    const { logoId, tier, options } = body
    
    if (!logoId || !tier) {
      return errorResponse({
        message: 'Logo ID and tier are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, 400)
    }

    // Debug log the environment
    console.log('Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      keyLength: process.env.STRIPE_SECRET_KEY?.length,
      hasUrl: !!process.env.NEXT_PUBLIC_URL,
      tier,
      logoId: logoId.substring(0, 8) // Log partial ID for privacy
    })

    const logo = await prisma.logo.findUnique({
      where: { 
        id: logoId,
        status: 'AVAILABLE'
      },
      include: { price: true }
    })

    if (!logo) {
      console.log('Logo not found:', logoId)
      return errorResponse({
        message: 'Logo not found or unavailable',
        code: 'LOGO_NOT_FOUND'
      }, 404)
    }

    const amount = calculatePrice(tier as PriceTier, options)
    console.log('Calculated amount:', amount * 100, 'cents')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Logo Purchase - ${tier.toUpperCase()}`,
            description: `${tier.toUpperCase()} package${options?.wordmark ? ' + Wordmark' : ''}${options?.domain ? ' + Domain' : ''}`
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/logos/${logoId}`,
      metadata: {
        logoId,
        tier,
        options: JSON.stringify(options)
      }
    })

    console.log('Session created:', {
      id: session.id,
      hasUrl: !!session.url
    })

    return successResponse({
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return errorResponse({
      message: 'Checkout failed',
      code: 'CHECKOUT_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
} 