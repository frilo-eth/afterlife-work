import { Resend } from 'resend'
import { LogoApprovalEmail } from '@/components/emails/LogoApprovalEmail'
import { NewLogoSubmissionEmail } from '@/components/emails/NewLogoSubmission'
import type { Logo } from '@/types/index'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

// afterlife.com was never a domain this project owns, let alone a verified
// sender. Notifications go out from the same verified domain as everything else.
import { EMAIL_DOMAIN, REPLY_TO_EMAIL } from './email'

const SITE_EMAIL = `notifications@${EMAIL_DOMAIN}`

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
      reply_to: REPLY_TO_EMAIL,
      react: NewLogoSubmissionEmail({
        logoId: logo.id,
        title: logo.title,
        thumbnail: logo.thumbnail,
      }),
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
      reply_to: REPLY_TO_EMAIL,
      react: LogoApprovalEmail({
        logoId: logo.id,
        title: logo.title,
        thumbnail: logo.thumbnail,
      }),
    })
  } catch (error) {
    console.error('Failed to send approval notification:', error)
  }
}
