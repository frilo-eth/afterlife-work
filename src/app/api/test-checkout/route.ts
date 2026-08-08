import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { calculatePrice } from '@/lib/price-constants'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function POST() {
  try {
    // 1. Get a test logo
    const testLogo = await prisma.logo.findFirst({
      where: { status: 'AVAILABLE' },
      include: { price: true }
    })
    
    if (!testLogo) throw new Error('No test logo found')

    // 2. Create a test checkout
    const amount = calculatePrice('summon', { wordmark: true })
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${testLogo.title} - SUMMON`,
            images: [testLogo.thumbnail]
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success-test`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel-test`,
    })

    return successResponse({ 
      url: session.url,
      amount: amount
    })
  } catch (error) {
    return errorResponse({
      message: 'Checkout test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 