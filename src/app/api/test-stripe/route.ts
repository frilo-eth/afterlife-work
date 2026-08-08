import { stripe } from '@/lib/stripe'
import { errorResponse, successResponse } from '@/lib/api-utils'
import { calculatePrice } from '@/lib/price-constants'

type TestResponse = {
  stripeConnected: boolean
  testPrice: number
  sessionCreated: boolean
  sessionUrl: string | null
  env: {
    hasStripeKey: boolean
    hasPublicUrl: boolean
  }
}

export async function GET() {
  try {
    // 1. Test Stripe connection
    const testCustomer = await stripe.customers.list({
      limit: 1
    })
    
    // 2. Test price calculation
    const testPrice = calculatePrice('summon', { wordmark: true })
    
    // 3. Test session creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Product',
            description: 'Test checkout session'
          },
          unit_amount: testPrice,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success-test`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel-test`,
    })

    return successResponse<TestResponse>({
      stripeConnected: true,
      testPrice,
      sessionCreated: !!session.id,
      sessionUrl: session.url,
      env: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublicUrl: !!process.env.NEXT_PUBLIC_URL
      }
    })

  } catch (error) {
    console.error('Stripe test failed:', error)
    return errorResponse({
      message: 'Stripe test failed',
      code: 'STRIPE_TEST_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 