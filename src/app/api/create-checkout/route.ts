import { errorResponse, successResponse } from '@/lib/api-utils'
import { logCheckoutEvent } from '@/lib/checkout-logger'
import { ensureDbConnection } from '@/lib/db-utils'
import { calculatePrice, type PriceTier } from '@/lib/price-constants'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { trackEvent } from '@/lib/track-event'

export async function POST(req: Request) {
  let logoId: string | undefined
  let tier: string | undefined

  try {
    await ensureDbConnection()

    const body = await req.json()
    console.log('Creating checkout with:', body)

    logoId = body.logoId
    tier = body.tier
    const { options } = body

    if (!logoId || !tier) {
      return errorResponse(
        {
          message: 'Logo ID and tier are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        400,
      )
    }

    if (!['summon', 'revival', 'afterlife'].includes(tier)) {
      return errorResponse(
        {
          message: 'Invalid pricing tier',
          code: 'INVALID_TIER',
        },
        400,
      )
    }

    console.log('Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      keyLength: process.env.STRIPE_SECRET_KEY?.length,
      hasUrl: !!process.env.NEXT_PUBLIC_URL,
      tier,
      logoId: logoId.substring(0, 8),
    })

    const logo = await prisma.logo.findUnique({
      where: {
        id: logoId,
        status: 'AVAILABLE',
      },
      include: { price: true },
    })

    if (!logo) {
      console.log('Logo not found:', logoId)
      return errorResponse(
        {
          message: 'Logo not found or unavailable',
          code: 'LOGO_NOT_FOUND',
        },
        404,
      )
    }

    const amount = calculatePrice(tier as PriceTier, options)
    const isSubscription = tier === 'afterlife'
    console.log('Calculated amount:', amount * 100, 'cents', { isSubscription })

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isSubscription
                ? `Afterlife — ${logo.title}`
                : `Logo Purchase - ${tier.toUpperCase()}`,
              description: isSubscription
                ? 'Monthly brand partnership'
                : `${tier.toUpperCase()} package${options?.wordmark ? ' + Wordmark' : ''}${options?.domain ? ' + Domain' : ''}`,
            },
            unit_amount: amount * 100,
            ...(isSubscription ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${logoId}`,
      metadata: {
        logoId,
        tier,
        options: JSON.stringify(options ?? {}),
      },
    })

    console.log('Session created:', {
      id: session.id,
      hasUrl: !!session.url,
    })

    void logCheckoutEvent({
      type: 'CHECKOUT_STARTED',
      logoId,
      tier,
      amount: Math.round(amount * 100),
      sessionId: session.id,
    }).catch(() => {})

    void trackEvent({
      name: 'checkout_started',
      logoId,
      sessionId: session.id,
      props: { tier, amount: Math.round(amount * 100) },
    })

    return successResponse({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    if (logoId && tier) {
      void logCheckoutEvent({
        type: 'CHECKOUT_FAILED',
        logoId,
        tier,
        amount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }).catch(() => {})
      void trackEvent({
        name: 'checkout_failed',
        logoId,
        props: { tier, error: error instanceof Error ? error.message : 'Unknown' },
      })
    }
    return errorResponse(
      {
        message: 'Checkout failed',
        code: 'CHECKOUT_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    )
  }
}
