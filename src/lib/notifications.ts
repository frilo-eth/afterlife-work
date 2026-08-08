import { Resend } from 'resend'
import { NewLogoSubmissionEmail } from '@/components/emails/NewLogoSubmission'
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail'
import type { Logo } from '@/types/index'
import { LogoApprovalEmail } from '@/components/emails/LogoApprovalEmail'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const SITE_EMAIL = 'notifications@afterlife.com'

export async function sendNewLogoNotification(logo: Logo) {
  if (!ADMIN_EMAIL) {
    console.error('Admin email not configured')
    return
  }

  try {
    await resend.emails.send({
      from: `Afterlife <${SITE_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Logo Submission: ${logo.title}`,
      react: NewLogoSubmissionEmail({
        logoId: logo.id,
        title: logo.title,
        thumbnail: logo.thumbnail
      })
    })
  } catch (error) {
    console.error('Failed to send logo notification:', error)
  }
}

export async function sendLogoApprovalNotification(logo: Logo) {
  // Use optional chaining to safely access the property
  const designerEmail = (logo as { designerEmail?: string }).designerEmail

  if (!designerEmail) {
    console.error('Designer email not found for logo:', logo.id)
    return
  }

  try {
    await resend.emails.send({
      from: `Afterlife <${SITE_EMAIL}>`,
      to: designerEmail,
      subject: 'Your Logo Has Been Approved',
      react: LogoApprovalEmail({
        logoId: logo.id,
        title: logo.title,
        thumbnail: logo.thumbnail
      })
    })
  } catch (error) {
    console.error('Failed to send approval notification:', error)
  }
} 