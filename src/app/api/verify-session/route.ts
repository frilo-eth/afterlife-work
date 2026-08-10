import { errorResponse, successResponse } from '@/lib/api-utils'
import { stripe } from '@/lib/stripe'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return errorResponse(
      {
        message: 'Session ID is required',
        code: 'MISSING_SESSION_ID',
      },
      400,
    )
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Only acknowledge sessions that were actually paid. Retrieving a session
    // is not proof of purchase — an abandoned or expired checkout resolves
    // here too.
    if (session.payment_status !== 'paid') {
      return errorResponse(
        {
          message: 'Payment not completed',
          code: 'PAYMENT_INCOMPLETE',
        },
        402,
      )
    }

    const { logoId, tier, wordmark, domain } = session.metadata || {}

    // Return only the fields the confirmation page renders. The full Stripe
    // session was previously echoed back, which exposed the customer's email,
    // billing address, and payment details to anyone holding a session id.
    return successResponse({
      logoId,
      tier,
      wordmark: Boolean(wordmark),
      domain: domain ?? null,
    })
  } catch (error) {
    return errorResponse(
      {
        message: 'Invalid session',
        code: 'INVALID_SESSION',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      400,
    )
  }
}
