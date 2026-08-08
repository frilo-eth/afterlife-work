import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { uploadFile } from '@/lib/uploadFile'
import { prisma } from '@/lib/prisma'
import { NewLogoSubmissionEmail } from '@/components/emails/NewLogoSubmission'
import { SubmissionConfirmationEmail } from '@/components/emails/SubmissionConfirmationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    console.log('Admin email address:', process.env.ADMIN_EMAIL);

    const formData = await request.formData()
    
    // Validate required fields
    const requiredFields = ['designerName', 'email', 'description', 'logo']
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Extract form data
    const designerName = formData.get('designerName') as string
    const email = formData.get('email') as string
    const twitter = formData.get('twitter') as string
    const description = formData.get('description') as string
    const logoFile = formData.get('logo') as File
    const logoTitle = formData.get('logoTitle') as string
    const mockupFiles = Array.from(formData.getAll('mockup'))
      .filter((file): file is File => file instanceof File)

    try {
      // Create or update designer
      console.log('Creating/updating designer record...')
      const designer = await prisma.designer.upsert({
        where: { email },
        create: {
          name: designerName,
          email,
          twitter: twitter || undefined
        },
        update: {
          name: designerName,
          twitter: twitter || undefined
        }
      })
      console.log('Designer record processed:', designer.id)

      // Upload files to storage
      console.log('Uploading logo file...')
      const logoUpload = await uploadFile(logoFile)
      console.log('Logo uploaded successfully:', logoUpload.secure_url)
      
      console.log('Uploading mockup files...')
      const mockupUploads = await Promise.all(mockupFiles.map(uploadFile))
      console.log('Mockups uploaded successfully:', mockupUploads.map(u => u.secure_url))

      // Create logo entry
      console.log('Creating logo entry...')
      const price = await prisma.price.create({
        data: {
          summon: 1000, // Default prices
          revival: 5000,
          afterlife: "Starts at $10,000"
        }
      })

      const logo = await prisma.logo.create({
        data: {
          title: logoTitle || `Logo by ${designerName}`, // Use provided title or fallback
          description,
          thumbnail: mockupUploads[0]?.secure_url || logoUpload.secure_url,
          images: [logoUpload.secure_url],
          tags: [], // Empty tags initially
          status: 'REVIEW',
          designerId: designer.id, // Link to designer
          priceId: price.id,
          gallery: {
            create: mockupUploads.map(upload => ({
              imageUrl: upload.secure_url
            }))
          }
        },
        include: {
          gallery: true,
          price: true,
          designer: true
        }
      })
      console.log('Logo entry created:', logo.id)

      const adminEmail = process.env.ADMIN_EMAIL
      if (!adminEmail) {
        throw new Error('Admin email not configured')
      }

      // Send emails with detailed logging
      console.log('Preparing to send notification emails...')
      try {
        const [adminNotification, userConfirmation] = await Promise.all([
          resend.emails.send({
            from: 'Afterlife <notifications@updates.afterlife.work>',
            to: adminEmail,
            subject: `New Logo Submission: ${logoTitle || "Untitled Logo"}`,
            react: NewLogoSubmissionEmail({
              logoId: logo.id,
              title: logoTitle || `Logo by ${designerName}`,
              thumbnail: mockupUploads[0]?.secure_url || logoUpload.secure_url,
              designerName,
              designerEmail: email,
              description,
              submissionDate: new Date().toLocaleString(),
              tags: [],
              hasSourceFile: mockupFiles.length > 0
            })
          }).then(res => {
            console.log('Admin notification sent:', res)
            return res
          }).catch(err => {
            console.error('Admin notification failed:', err)
            throw err
          }),

          resend.emails.send({
            from: 'Afterlife <notifications@updates.afterlife.work>',
            to: email,
            subject: 'Logo Submission Received',
            react: SubmissionConfirmationEmail({
              designerName,
              logoName: logoFile.name
            })
          }).then(res => {
            console.log('User confirmation sent:', res)
            return res
          }).catch(err => {
            console.error('User confirmation failed:', err)
            throw err
          })
        ])

        console.log('All notification emails sent successfully:', {
          adminEmail: adminNotification,
          userEmail: userConfirmation
        })
      } catch (emailError) {
        console.error('Failed to send notification emails:', emailError)
        // Continue with the submission process even if emails fail
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Logo submitted successfully',
        logoId: logo.id
      })
    } catch (uploadError) {
      console.error('Processing error:', uploadError)
      throw new Error(uploadError instanceof Error ? uploadError.message : 'Failed to process files')
    }
  } catch (error) {
    console.error('Submission error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process submission',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
} 