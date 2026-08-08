import { prisma } from './prisma'

export async function logCheckoutEvent(event: {
  type: 'CHECKOUT_STARTED' | 'CHECKOUT_COMPLETED' | 'CHECKOUT_FAILED'
  logoId: string
  tier: string
  amount: number
  error?: string
  sessionId?: string
}) {
  console.log('[Checkout Event]', {
    timestamp: new Date().toISOString(),
    ...event
  })
  
  await prisma.checkoutLog.create({
    data: {
      type: event.type,
      logoId: event.logoId,
      tier: event.tier,
      amount: event.amount,
      error: event.error,
      sessionId: event.sessionId
    }
  })
} 