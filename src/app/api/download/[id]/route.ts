import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Returns the downloadable assets for a purchased logo.
 *
 * Authorization is the Stripe checkout session id, passed as `session_id`.
 * It is unguessable and already in the customer's possession after checkout,
 * which avoids requiring accounts. The session must correspond to a recorded
 * Order for this specific logo — holding a session id for one purchase does
 * not grant access to another logo's files.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionId = new URL(request.url).searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'A session_id is required to access downloads.' },
      { status: 400 }
    )
  }

  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        logo: {
          include: { gallery: true }
        }
      }
    })

    // Same response for "no such order" and "order is for a different logo",
    // so this cannot be used to probe which sessions or logos exist.
    if (!order || order.logoId !== params.id) {
      return NextResponse.json(
        { error: 'No purchase found for this download.' },
        { status: 404 }
      )
    }

    const { logo } = order

    // Assets currently attached to the logo record. Source vectors (.ai/.eps)
    // are not modelled per logo yet, so a freshly paid order legitimately has
    // nothing to hand over until a designer attaches the package.
    const files = [
      ...(logo.thumbnail ? [{ url: logo.thumbnail, type: 'preview' }] : []),
      ...logo.images.map(url => ({ url, type: 'image' })),
      ...logo.gallery.map(item => ({ url: item.imageUrl, type: 'gallery' }))
    ].map(file => ({
      ...file,
      filename: `${logo.title.toLowerCase().replace(/\s+/g, '-')}-${file.type}${
        file.url.match(/\.[a-z0-9]+$/i)?.[0] ?? ''
      }`
    }))

    return NextResponse.json({
      orderId: order.id,
      logoId: logo.id,
      title: logo.title,
      tier: order.tier,
      files,
      // Signals to the UI that the purchase is valid but the source package
      // has not been attached, rather than pretending delivery is complete.
      sourceFilesPending: files.length === 0
    })
  } catch (error) {
    console.error('Download lookup failed:', error)
    return NextResponse.json(
      { error: 'Could not load your download.' },
      { status: 500 }
    )
  }
}
