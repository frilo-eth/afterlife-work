import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary-server'

// Signed links are deliberately short-lived: the URL is the only thing
// standing between the archive and anyone it gets forwarded to.
const DOWNLOAD_LINK_TTL_SECONDS = 15 * 60

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

    // A valid purchase can legitimately predate the designer attaching the
    // archive. Say so, rather than reporting files that do not exist.
    if (!logo.sourcePackageId) {
      return NextResponse.json({
        orderId: order.id,
        logoId: logo.id,
        title: logo.title,
        tier: order.tier,
        files: [],
        sourceFilesPending: true
      })
    }

    const expiresAt = Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_TTL_SECONDS

    // The archive is stored with authenticated access, so it has no public
    // URL; this mints a signed one that stops working after the TTL.
    const url = cloudinary.utils.private_download_url(
      logo.sourcePackageId,
      '',
      {
        resource_type: 'raw',
        type: 'authenticated',
        expires_at: expiresAt
      }
    )

    return NextResponse.json({
      orderId: order.id,
      logoId: logo.id,
      title: logo.title,
      tier: order.tier,
      files: [
        {
          url,
          filename:
            logo.sourcePackageName ??
            `${logo.title.toLowerCase().replace(/\s+/g, '-')}.zip`,
          type: 'package',
          expiresAt: new Date(expiresAt * 1000).toISOString()
        }
      ],
      sourceFilesPending: false
    })
  } catch (error) {
    console.error('Download lookup failed:', error)
    return NextResponse.json(
      { error: 'Could not load your download.' },
      { status: 500 }
    )
  }
}
