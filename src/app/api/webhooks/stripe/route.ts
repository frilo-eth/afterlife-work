import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/stripe'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { LogoStatus } from '@prisma/client'
import { handleOrderFulfillment } from '@/lib/order-fulfillment'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    const { event } = await handleWebhook({
      payload: body,
      signature,
    })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { logoId, tier, wordmark, domain } = session.metadata || {}

        if (!logoId || !tier) {
          console.error('Missing metadata in session:', session.id)
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
        }

        // Start a transaction to ensure both operations succeed or fail together
        const [order, updatedLogo] = await db.$transaction([
          // Create the order
          db.order.create({
            data: {
              stripeSessionId: session.id,
              customerEmail: session.customer_details?.email || '',
              logoId,
              tier,
              amount: session.amount_total || 0,
              ...(wordmark ? { wordmark } : {}),
              ...(domain ? { domain } : {})
            }
          }),
          // Mark the logo as sold
          db.logo.update({
            where: { id: logoId },
            data: { status: LogoStatus.SOLD }
          })
        ])

        // Handle order fulfillment
        await handleOrderFulfillment({
          order,
          logo: updatedLogo,
          hasWordmark: Boolean(wordmark)
        })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Since we don't have a status field in the schema,
        // we might want to handle failed payments differently
        // For now, we'll just log it
        if (paymentIntent.metadata?.orderId) {
          console.error('Payment failed for order:', paymentIntent.metadata.orderId)
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 