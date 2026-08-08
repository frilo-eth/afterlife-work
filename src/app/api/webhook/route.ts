import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import type { Stripe } from 'stripe'

export async function POST(request: Request) {
  const signature = await request.headers.get('stripe-signature')
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await request.text()

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse('Webhook Error: Missing secret', { status: 400 })
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata as {
          logoId: string
          tier: string
          wordmark?: string
          domain?: string
        }
        
        // Update logo status
        await prisma.logo.update({
          where: { id: metadata.logoId },
          data: { status: 'SOLD' }
        })

        // Create order record
        const order = await prisma.order.create({
          data: {
            logoId: metadata.logoId,
            tier: metadata.tier,
            wordmark: metadata.wordmark || null,
            customerEmail: session.customer_details?.email || '',
            amount: session.amount_total || 0,
            stripeSessionId: session.id
          }
        })

        // First, get the logo title
        const logo = await prisma.logo.findUnique({
          where: { id: metadata.logoId },
          select: { title: true }
        })

        if (!logo) {
          throw new Error('Logo not found')
        }

        // Send confirmation email with correct props
        await sendOrderConfirmationEmail({
          type: 'customer',
          template: 'OrderConfirmationWithFiles',
          to: session.customer_details?.email || '',
          data: {
            logoTitle: logo.title,
            amount: order.amount,
            tier: metadata.tier,
            orderId: session.id,
            wordmark: metadata.wordmark,
            domain: metadata.domain
          }
        })
        break
      }
    }

    return new NextResponse('Webhook processed', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
      { status: 400 }
    )
  }
}