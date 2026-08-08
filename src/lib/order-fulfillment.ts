import { db } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'
import type { Order, Logo } from '@prisma/client'

export type OrderTier = 'summon' | 'revival' | 'afterlife'

export interface FileDelivery {
  type: string
  url: string
  name: string
}

interface OrderFulfillmentOptions {
  order: Order
  logo: Logo
  hasWordmark: boolean
}

export async function handleOrderFulfillment({ order, logo, hasWordmark }: OrderFulfillmentOptions) {
  const tier = order.tier as OrderTier

  // 1. Send admin notification
  await sendOrderConfirmationEmail({
    type: 'admin',
    template: 'NewOrderNotification',
    data: {
      orderId: order.id,
      logoTitle: logo.title,
      tier,
      amount: order.amount,
      hasWordmark,
      customerEmail: order.customerEmail
    }
  })

  // 2. Handle tier-specific logic
  switch (tier) {
    case 'summon': {
      if (!hasWordmark) {
        // Immediate delivery for SUMMON without wordmark
        const files = prepareFileDelivery(logo, order.stripeSessionId)
        await sendOrderConfirmationEmail({
          type: 'customer',
          template: 'OrderConfirmationWithFiles',
          to: order.customerEmail,
          data: {
            orderId: order.id,
            logoTitle: logo.title,
            files,
            tier,
            amount: order.amount
          }
        })
      } else {
        // Wordmark requires designer work
        await notifyDesigner({
          orderId: order.id,
          logoId: logo.id,
          tier,
          wordmark: order.wordmark || undefined,
          customerEmail: order.customerEmail
        })
        
        await sendOrderConfirmationEmail({
          type: 'customer',
          template: 'OrderConfirmationPendingWordmark',
          to: order.customerEmail,
          data: {
            orderId: order.id,
            logoTitle: logo.title,
            tier,
            amount: order.amount,
            estimatedDays: '5-7'
          }
        })
      }
      break
    }

    case 'revival': {
      const estimatedDays = hasWordmark ? '5-7' : '2-3'
      
      // Initial confirmation
      await sendOrderConfirmationEmail({
        type: 'customer',
        template: 'OrderConfirmationRevival',
        to: order.customerEmail,
        data: {
          orderId: order.id,
          logoTitle: logo.title,
          tier,
          amount: order.amount,
          estimatedDays,
          hasWordmark
        }
      })

      // Notify designer for revival package preparation
      await notifyDesigner({
        orderId: order.id,
        logoId: logo.id,
        tier,
        wordmark: order.wordmark || undefined,
        customerEmail: order.customerEmail
      })
      break
    }

    case 'afterlife': {
      // Send initial confirmation with next steps
      await sendOrderConfirmationEmail({
        type: 'customer',
        template: 'OrderConfirmationAfterlife',
        to: order.customerEmail,
        data: {
          orderId: order.id,
          logoTitle: logo.title,
          tier,
          amount: order.amount
        }
      })

      // Notify team for afterlife project setup
      await notifyTeam({
        orderId: order.id,
        logoId: logo.id,
        customerEmail: order.customerEmail,
        amount: order.amount
      })
      break
    }
  }
}

/**
 * Builds what the confirmation email links to.
 *
 * This deliberately returns a link to the download page rather than a signed
 * asset URL. Signed links are minted with a short TTL, and an email is often
 * read hours later — embedding one would hand the customer a dead link. The
 * download page re-mints a fresh signed URL on each visit, authorised by the
 * Stripe session id.
 *
 * The previous implementation fetched the logo id as a raw Cloudinary resource
 * and derived .ai/.pdf URLs by string-replacing the .svg extension. No such
 * assets existed, so every link it produced was broken.
 */
function prepareFileDelivery(logo: Logo, stripeSessionId: string): FileDelivery[] {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://afterlife.work'

  return [
    {
      type: 'package',
      url: `${baseUrl}/download/${logo.id}?session_id=${encodeURIComponent(stripeSessionId)}`,
      name: logo.sourcePackageName ?? `${logo.title} — source files`
    }
  ]
}

async function notifyDesigner({
  orderId,
  logoId,
  tier,
  wordmark,
  customerEmail
}: {
  orderId: string
  logoId: string
  tier: OrderTier
  wordmark?: string
  customerEmail: string
}) {
  const logo = await db.logo.findUnique({
    where: { id: logoId }
  })

  if (!logo) {
    throw new Error(`Logo not found: ${logoId}`)
  }

  await sendOrderConfirmationEmail({
    type: 'designer',
    template: 'NewDesignTask',
    data: {
      orderId,
      logoId,
      logoTitle: logo.title,
      tier,
      wordmark,
      customerEmail
    }
  })
}

async function notifyTeam({
  orderId,
  logoId,
  customerEmail,
  amount
}: {
  orderId: string
  logoId: string
  customerEmail: string
  amount: number
}) {
  const logo = await db.logo.findUnique({
    where: { id: logoId }
  })

  if (!logo) {
    throw new Error(`Logo not found: ${logoId}`)
  }

  await sendOrderConfirmationEmail({
    type: 'admin',
    template: 'NewAfterlifeProject',
    data: {
      orderId,
      logoId,
      logoTitle: logo.title,
      customerEmail,
      amount
    }
  })
} 