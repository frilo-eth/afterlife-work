import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

const PRICE_TIERS = {
  summon: 1000,
  revival: 5000
} as const

type PriceTier = keyof typeof PRICE_TIERS

export async function POST(req: Request) {
  try {
    const { logoId, tier } = await req.json()
    
    if (!PRICE_TIERS[tier as PriceTier]) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Logo License - ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
            },
            unit_amount: PRICE_TIERS[tier as PriceTier] * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/logo/${logoId}`,
      metadata: {
        logoId,
        tier
      }
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
} 