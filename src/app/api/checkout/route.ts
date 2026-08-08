import { NextResponse } from 'next/server'
import { createCheckoutSession, PRODUCTS, type ProductType, type PriceTier, type PriceId } from '@/lib/stripe'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get('userId')?.value
    const { productType, tier, returnUrl } = await request.json()

    if (!productType || !tier || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validProductType = productType as ProductType
    if (!(validProductType in PRODUCTS)) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      )
    }

    const product = PRODUCTS[validProductType]
    const validTier = tier as PriceTier
    
    if (!(validTier in product.prices)) {
      return NextResponse.json(
        { error: 'Invalid price tier' },
        { status: 400 }
      )
    }

    const price = product.prices[validTier] as { id: PriceId; amount: number }

    const session = await createCheckoutSession({
      priceId: price.id,
      customerId: userId,
      metadata: {
        productType,
        tier,
        userId: userId || 'anonymous'
      },
      successUrl: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 