import { headers } from 'next/headers'
import { stripe } from './stripe'

export async function verifyStripeWebhook(req: Request) {
  const body = await req.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing Stripe signature or webhook secret')
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    throw new Error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}
