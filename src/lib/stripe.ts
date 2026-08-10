import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const STRIPE_PRICE_REVIVAL = process.env.STRIPE_PRICE_REVIVAL
const STRIPE_PRICE_ECHO = process.env.STRIPE_PRICE_ECHO
const STRIPE_PRICE_RETAINER = process.env.STRIPE_PRICE_RETAINER

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set')
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export type PriceId = string

export interface ProductConfig {
  name: string
  description?: string
  prices: Record<
    string,
    {
      id: PriceId
      amount: number
    }
  >
}

export const PRODUCTS = {
  logos: {
    name: 'Logo',
    prices: {
      revival: {
        id: STRIPE_PRICE_REVIVAL || '',
        amount: 6500, // $65.00
      },
      echo: {
        id: STRIPE_PRICE_ECHO || '',
        amount: 12500, // $125.00
      },
    },
  },
  retainer: {
    name: 'Design Retainer',
    description: 'Monthly design retainer for custom work',
    prices: {
      monthly: {
        id: STRIPE_PRICE_RETAINER || '',
        amount: 100000, // $1,000.00
      },
    },
  },
} as const

export type ProductType = keyof typeof PRODUCTS
export type PriceTier = keyof (typeof PRODUCTS)[ProductType]['prices']

export async function createCheckoutSession({
  priceId,
  customerId,
  metadata = {},
  successUrl,
  cancelUrl,
}: {
  priceId: PriceId
  customerId?: string
  metadata?: Record<string, string>
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    customer_creation: customerId ? undefined : 'always',
  })
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function handleWebhook({
  signature,
  payload,
}: {
  signature: string
  payload: string | Buffer
}) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET)

    return { event }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    throw new Error('Invalid webhook signature')
  }
}
