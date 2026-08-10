import { LogoStatus } from '@prisma/client'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { db } from '@/lib/db'
import { handleOrderFulfillment } from '@/lib/order-fulfillment'
import { handleWebhook } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
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

        // Stripe delivers webhooks at least once, so this handler must be
        // safe to run twice for the same session. Without this check the
        // second delivery hits the unique constraint on stripeSessionId,
        // throws, and Stripe retries forever against an order that already
        // exists.
        const existingOrder = await db.order.findUnique({
          where: { stripeSessionId: session.id },
        })

        if (existingOrder) {
          console.info('Duplicate webhook delivery ignored for session:', session.id)
          return NextResponse.json({ received: true, duplicate: true })
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
              ...(domain ? { domain } : {}),
            },
          }),
          // Mark the logo as sold
          db.logo.update({
            where: { id: logoId },
            data: { status: LogoStatus.SOLD },
          }),
        ])

        // The payment has been taken and the order is recorded. A fulfilment
        // failure past this point must not fail the webhook: returning an
        // error would make Stripe retry, and the retry can no longer get past
        // the duplicate check above. Record the failure instead so it can be
        // replayed by hand.
        try {
          await handleOrderFulfillment({
            order,
            logo: updatedLogo,
            hasWordmark: Boolean(wordmark),
          })
        } catch (fulfillmentError) {
          const message =
            fulfillmentError instanceof Error
              ? fulfillmentError.message
              : 'Unknown fulfillment error'

          console.error('Fulfillment failed for order:', order.id, message)

          await db.checkoutLog
            .create({
              data: {
                type: 'FULFILLMENT_FAILED',
                logoId,
                tier,
                amount: order.amount,
                sessionId: session.id,
                error: message,
              },
            })
            .catch((logError: unknown) => {
              console.error('Could not record fulfillment failure:', logError)
            })
        }

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

    // A bad signature is permanent — retrying cannot fix it, so answer 400 and
    // let Stripe stop. Anything else (a database blip, a timeout) is worth
    // retrying, which requires a 5xx. Answering 400 for everything, as this
    // previously did, silently discarded recoverable failures.
    const isSignatureError = error instanceof Error && error.message === 'Invalid webhook signature'

    return NextResponse.json(
      { error: isSignatureError ? 'Invalid signature' : 'Webhook handler failed' },
      { status: isSignatureError ? 400 : 500 },
    )
  }
}
