import { stripe } from '@/lib/stripe'

export async function GET() {
  // Test creating a simple session
  let testSession = null
  let error = null
  
  try {
    testSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Product',
            description: 'Test Session'
          },
          unit_amount: 1000, // $10.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success-test`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel-test`,
    })
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return Response.json({
    stripeInitialized: true,
    hasCheckout: true,
    hasSessions: true,
    testSession: testSession ? { 
      id: testSession.id,
      url: testSession.url 
    } : null,
    error
  })
} 