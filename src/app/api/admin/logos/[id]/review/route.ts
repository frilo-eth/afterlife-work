import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schema for review actions
const ReviewActionSchema = z.object({
  action: z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT']),
  message: z.string().optional(), // Required for REQUEST_CHANGES and REJECT
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { action, message } = ReviewActionSchema.parse(data)

    // Validate message is provided for REQUEST_CHANGES and REJECT
    if ((action === 'REQUEST_CHANGES' || action === 'REJECT') && !message) {
      return NextResponse.json(
        { error: 'Message is required for this action' },
        { status: 400 }
      )
    }

    // Get the logo with designer info
    const logo = await prisma.logo.findUnique({
      where: { id: params.id },
      include: {
        designer: true
      }
    })

    if (!logo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      )
    }

    // Update logo status based on action
    const newStatus = action === 'APPROVE' ? 'AVAILABLE' : 'HIDDEN'
    const updatedLogo = await prisma.logo.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: {
        designer: true
      }
    })

    // Send email notification
    const designerEmail = logo.designer?.email || logo.designerEmail
    if (designerEmail) {
      let emailSubject = ''
      let emailContent = ''

      switch (action) {
        case 'APPROVE':
          emailSubject = 'Your logo has been approved!'
          emailContent = `Congratulations! Your logo "${logo.title}" has been approved and is now available on our marketplace.`
          break
        case 'REQUEST_CHANGES':
          emailSubject = 'Changes requested for your logo submission'
          emailContent = `We've reviewed your logo "${logo.title}" and have some feedback:\n\n${message}\n\nPlease make the requested changes and submit an updated version.`
          break
        case 'REJECT':
          emailSubject = 'Update on your logo submission'
          emailContent = `We've reviewed your logo "${logo.title}" and unfortunately, we cannot accept it at this time.\n\n${message}\n\nFeel free to submit other logos in the future.`
          break
      }

      await resend.emails.send({
        from: 'Afterlife <notifications@updates.afterlife.work>',
        to: designerEmail,
        subject: emailSubject,
        text: emailContent
      })
    }

    return NextResponse.json({
      success: true,
      logo: updatedLogo,
      action
    })
  } catch (error) {
    console.error('Review action error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process review action',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
} 