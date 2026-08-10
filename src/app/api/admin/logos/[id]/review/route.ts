import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { LogoApprovalEmail } from '@/components/emails/LogoApprovalEmail'
import { LogoChangesRequestedEmail } from '@/components/emails/LogoChangesRequestedEmail'
import { LogoRejectionEmail } from '@/components/emails/LogoRejectionEmail'
import { requireAdmin } from '@/lib/api-utils'
import { CATALOG_TAG } from '@/lib/catalog'
import { createEmailClient } from '@/lib/email'
import { prisma } from '@/lib/prisma'

// Validation schema for review actions
const ReviewActionSchema = z.object({
  action: z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT']),
  message: z.string().optional(), // Required for REQUEST_CHANGES and REJECT
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const data = await request.json()
    const { action, message } = ReviewActionSchema.parse(data)

    // Validate message is provided for REQUEST_CHANGES and REJECT
    if ((action === 'REQUEST_CHANGES' || action === 'REJECT') && !message) {
      return NextResponse.json({ error: 'Message is required for this action' }, { status: 400 })
    }

    // Get the logo with designer info
    const logo = await prisma.logo.findUnique({
      where: { id: params.id },
      include: {
        designer: true,
      },
    })

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    // Update logo status based on action
    const newStatus = action === 'APPROVE' ? 'AVAILABLE' : 'HIDDEN'
    const updatedLogo = await prisma.logo.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: {
        designer: true,
      },
    })

    // Branded React templates — the previous path sent plain text and landed
    // in junk looking like an unauthenticated blast.
    const designerEmail = logo.designer?.email || logo.designerEmail
    if (designerEmail) {
      const designerName = logo.designer?.name?.split(' ')[0] || 'there'
      const email = createEmailClient()

      try {
        switch (action) {
          case 'APPROVE':
            await email.send({
              type: 'submissions',
              to: designerEmail,
              subject: 'Your logo has been approved',
              react: LogoApprovalEmail({
                logoId: logo.id,
                title: logo.title,
                thumbnail: logo.thumbnail,
              }),
            })
            break
          case 'REQUEST_CHANGES': {
            const feedback = message ?? ''
            await email.send({
              type: 'submissions',
              to: designerEmail,
              subject: 'Changes requested for your logo submission',
              react: LogoChangesRequestedEmail({
                designerName,
                logoTitle: logo.title,
                changes: [feedback],
              }),
            })
            break
          }
          case 'REJECT': {
            const reason = message ?? ''
            await email.send({
              type: 'submissions',
              to: designerEmail,
              subject: 'Update on your logo submission',
              react: LogoRejectionEmail({
                designerName,
                logoTitle: logo.title,
                reason,
              }),
            })
            break
          }
        }
      } catch (emailError) {
        // The review itself already succeeded; mail failure should not roll
        // the status change back or look like a 500 to the admin.
        console.error('Review notification email failed:', emailError)
      }
    }

    revalidateTag(CATALOG_TAG)

    return NextResponse.json({
      success: true,
      logo: updatedLogo,
      action,
    })
  } catch (error) {
    console.error('Review action error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process review action',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 },
    )
  }
}
