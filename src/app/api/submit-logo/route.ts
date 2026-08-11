import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { NewLogoSubmissionEmail } from '@/components/emails/NewLogoSubmission'
import { SubmissionConfirmationEmail } from '@/components/emails/SubmissionConfirmationEmail'
import { REPLY_TO_EMAIL } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { allocateLogoSlug } from '@/lib/slug'
import { trackEvent } from '@/lib/track-event'
import { uploadFile } from '@/lib/uploadFile'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Validate required fields
    const requiredFields = ['designerName', 'email', 'description', 'logo']
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Extract form data
    const designerName = formData.get('designerName') as string
    const email = formData.get('email') as string
    const twitter = formData.get('twitter') as string
    const description = formData.get('description') as string
    const logoFile = formData.get('logo') as File
    const logoTitle = formData.get('logoTitle') as string
    const mockupFiles = Array.from(formData.getAll('mockup')).filter(
      (file): file is File => file instanceof File,
    )

    try {
      // Create or update designer
      const designer = await prisma.designer.upsert({
        where: { email },
        create: {
          name: designerName,
          email,
          twitter: twitter || undefined,
        },
        update: {
          name: designerName,
          twitter: twitter || undefined,
        },
      })

      // Upload logo and mockups together — waiting on the logo alone before
      // starting mockups added their full duration to every submission.
      const [logoUpload, ...mockupUploads] = await Promise.all([
        uploadFile(logoFile),
        ...mockupFiles.map((file) => uploadFile(file)),
      ])

      const price = await prisma.price.create({
        data: {
          summon: 2500,
          revival: 5000,
          afterlife: '$10,000/mo',
        },
      })

      const resolvedTitle = logoTitle || `Logo by ${designerName}`
      const thumbnail = mockupUploads[0]?.secure_url || logoUpload.secure_url
      const slug = await allocateLogoSlug(prisma, resolvedTitle)

      const logo = await prisma.logo.create({
        data: {
          title: resolvedTitle,
          slug,
          description,
          thumbnail,
          images: [logoUpload.secure_url],
          tags: [],
          status: 'REVIEW',
          designerId: designer.id,
          priceId: price.id,
          gallery: {
            create: mockupUploads.map((upload) => ({
              imageUrl: upload.secure_url,
            })),
          },
        },
      })

      // Notification mail is fire-and-forget. Awaiting Resend here held the
      // submit response for several seconds after the logo was already saved.
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        void Promise.all([
          resend.emails.send({
            from: 'Afterlife <notifications@updates.afterlife.work>',
            to: adminEmail,
            subject: `New Logo Submission: ${resolvedTitle}`,
            reply_to: email,
            react: NewLogoSubmissionEmail({
              logoId: logo.id,
              title: resolvedTitle,
              thumbnail,
              designerName,
              designerEmail: email,
              description,
              submissionDate: new Date().toLocaleString(),
              tags: [],
              hasSourceFile: mockupFiles.length > 0,
            }),
          }),
          resend.emails.send({
            from: 'Afterlife <notifications@updates.afterlife.work>',
            to: email,
            subject: 'Logo Submission Received',
            reply_to: REPLY_TO_EMAIL,
            react: SubmissionConfirmationEmail({
              designerName,
              logoName: logoFile.name,
            }),
          }),
        ]).catch((emailError) => {
          console.error('Failed to send submission emails:', emailError)
        })
      } else {
        console.error('ADMIN_EMAIL is not configured; skipping submission emails')
      }

      void trackEvent({
        name: 'submit_complete',
        logoId: logo.id,
        props: { designerEmail: email },
      })

      return NextResponse.json({
        success: true,
        message: 'Logo submitted successfully',
        logoId: logo.id,
      })
    } catch (uploadError) {
      console.error('Processing error:', uploadError)
      throw new Error(
        uploadError instanceof Error ? uploadError.message : 'Failed to process files',
      )
    }
  } catch (error) {
    console.error('Submission error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process submission',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 },
    )
  }
}
