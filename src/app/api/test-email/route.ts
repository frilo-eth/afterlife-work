import { NextResponse } from 'next/server'
import type { CreateEmailResponse } from 'resend'
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail'
import { SubmissionConfirmationEmail } from '@/components/emails/SubmissionConfirmationEmail'
import { LogoApprovalEmail } from '@/components/emails/LogoApprovalEmail'
import { LogoRejectionEmail } from '@/components/emails/LogoRejectionEmail'
import { LogoChangesRequestedEmail } from '@/components/emails/LogoChangesRequestedEmail'
import { LogoSoldEmail } from '@/components/emails/LogoSoldEmail'
import { createEmailClient } from '@/lib/email'
import { WelcomeEmail } from '@/components/emails/WelcomeEmail'
import { RetainerSaleAlertEmail } from '@/components/emails/RetainerSaleAlertEmail'
import { DesignerPayoutSummaryEmail } from '@/components/emails/DesignerPayoutSummaryEmail'

const emailClient = createEmailClient()

export async function POST(request: Request) {
  try {
    const { to, template = 'order' } = await request.json()
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      )
    }

    let emailData: CreateEmailResponse;
    
    switch (template) {
      case 'order':
        emailData = await emailClient.send({
          type: 'orders',
          to,
          subject: 'Order Confirmation - Test Logo',
          react: OrderConfirmationEmail({
            customerEmail: to,
            logoTitle: 'REVIVAL Logo',
            amount: 6500,
            tier: 'revival',
            options: {
              wordmark: 'Custom Wordmark'
            }
          })
        })
        break

      case 'submission':
        emailData = await emailClient.send({
          type: 'submissions',
          to,
          subject: 'Logo Submission Received',
          react: SubmissionConfirmationEmail({
            designerName: 'Test Designer',
            logoName: 'awesome-logo.ai'
          })
        })
        break

      case 'approval':
        emailData = await emailClient.send({
          type: 'submissions',
          to,
          subject: 'Your Logo Has Been Approved!',
          react: LogoApprovalEmail({
            logoId: 'test-123',
            title: 'Test Logo',
            thumbnail: 'https://res.cloudinary.com/dsfmwnf5j/image/upload/v1710371386/logos/test-logo.png'
          })
        })
        break

      case 'rejection':
        emailData = await emailClient.send({
          type: 'submissions',
          to,
          subject: 'Update on Your Logo Submission',
          react: LogoRejectionEmail({
            designerName: 'Test Designer',
            logoTitle: 'Test Logo',
            reason: 'The logo does not meet our quality standards.',
            feedback: 'Consider improving the resolution and adding more contrast to the design.'
          })
        })
        break

      case 'changes':
        emailData = await emailClient.send({
          type: 'submissions',
          to,
          subject: 'Changes Requested for Your Logo',
          react: LogoChangesRequestedEmail({
            designerName: 'Test Designer',
            logoTitle: 'Test Logo',
            changes: [
              'Increase the contrast between elements',
              'Improve the scalability of the design',
              'Refine the typography spacing'
            ],
            additionalNotes: 'Please ensure all changes maintain the original concept while improving usability.'
          })
        })
        break

      case 'sold':
        emailData = await emailClient.send({
          type: 'orders',
          to,
          subject: 'Your Logo Has Been Sold! 🎉',
          react: LogoSoldEmail({
            logoTitle: 'Test Logo',
            saleAmount: 6500,
            commission: 0,
            isEarlyAdopter: true,
            earlyAdopterNumber: 42,
            estimatedPayout: 6500,
            payoutDate: '2024-03-20'
          })
        })
        break

      case 'welcome':
        emailData = await emailClient.send({
          type: 'system',
          to,
          subject: 'Welcome to Afterlife!',
          react: WelcomeEmail({
            name: 'Test User',
            isDesigner: true,
            verificationUrl: 'https://afterlife.work/verify-email?token=test-token'
          })
        })
        break

      case 'retainer_sale':
        emailData = await emailClient.send({
          type: 'admin',
          to,
          subject: 'New Retainer Sale Alert',
          react: RetainerSaleAlertEmail({
            buyerName: 'Test Buyer',
            buyerEmail: 'buyer@example.com',
            retainerAmount: 100000,
            purchaseDate: new Date().toISOString(),
            transactionId: 'txn_test123'
          })
        })
        break

      case 'payout_summary':
        emailData = await emailClient.send({
          type: 'payouts',
          to,
          subject: 'Your Payout Summary',
          react: DesignerPayoutSummaryEmail({
            designerName: 'Test Designer',
            payoutPeriod: 'March 2024',
            totalAmount: 250000,
            payoutDate: '2024-03-31',
            items: [
              {
                logoTitle: 'REVIVAL Logo',
                saleAmount: 150000,
                commission: 0,
                saleDate: '2024-03-15'
              },
              {
                logoTitle: 'ECHO Logo',
                saleAmount: 100000,
                commission: 0,
                saleDate: '2024-03-20'
              }
            ]
          })
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid template type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test ${template} email sent to ${to}`,
      emailId: emailData.data?.id 
    })
  } catch (error) {
    console.error('Email test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 