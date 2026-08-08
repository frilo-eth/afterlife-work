import { db } from '@/lib/db'
// Import the pre-configured server client rather than the bare SDK.
// cloudinary.config() mutates a module-level singleton, so importing the raw
// SDK here only worked when some *other* module had already configured it —
// which is not the case in the webhook's import graph. On a cold instance
// that made api.resource() throw "Must supply api_key".
import { cloudinary } from '@/lib/cloudinary-server'
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
        const files = await prepareFileDelivery(logo, 'basic')
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

async function prepareFileDelivery(logo: Logo, packageType: 'basic' | 'complete'): Promise<FileDelivery[]> {
  const files: FileDelivery[] = []
  
  // Get vector file from Cloudinary
  const vectorFile = await cloudinary.api.resource(logo.id, {
    resource_type: 'raw',
    type: 'upload'
  })

  // Basic package (.ai, .pdf, .svg)
  files.push(
    {
      type: 'ai',
      url: vectorFile.secure_url.replace('.svg', '.ai'),
      name: `${logo.title.toLowerCase().replace(/\s+/g, '-')}.ai`
    },
    {
      type: 'pdf',
      url: vectorFile.secure_url.replace('.svg', '.pdf'),
      name: `${logo.title.toLowerCase().replace(/\s+/g, '-')}.pdf`
    },
    {
      type: 'svg',
      url: vectorFile.secure_url,
      name: `${logo.title.toLowerCase().replace(/\s+/g, '-')}.svg`
    }
  )

  // Additional files for complete package
  if (packageType === 'complete') {
    files.push(
      {
        type: 'eps',
        url: vectorFile.secure_url.replace('.svg', '.eps'),
        name: `${logo.title.toLowerCase().replace(/\s+/g, '-')}.eps`
      },
      {
        type: 'figma',
        url: `https://www.figma.com/file/${logo.id}`,
        name: 'Open in Figma'
      }
    )
  }

  return files
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