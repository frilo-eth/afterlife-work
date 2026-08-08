import { errorResponse, successResponse } from '@/lib/api-utils'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia'
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return errorResponse({
      message: 'Session ID is required',
      code: 'MISSING_SESSION_ID'
    }, 400)
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return successResponse({ verified: true, session })
  } catch (error) {
    return errorResponse({
      message: 'Invalid session',
      code: 'INVALID_SESSION',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 400)
  }
} 