import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface SubmissionConfirmationEmailProps {
  designerName: string
  logoName: string
}

export function SubmissionConfirmationEmail({
  designerName,
  logoName,
}: SubmissionConfirmationEmailProps) {
  return (
    <BaseEmailTemplate
      previewText="Your logo submission has been received"
      heading="Logo Submission Received"
      body={
        <>
          <Text style={styles.text}>Hi {designerName},</Text>

          <Text style={styles.text}>
            We've received your logo submission <span style={styles.bold}>{logoName}</span>. Our
            team will review it shortly and get back to you.
          </Text>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>What's Next?</Text>
            <Text style={styles.text}>
              1. Our team will review your submission within 24-48 hours
            </Text>
            <Text style={styles.text}>2. You'll receive an email with our decision</Text>
            <Text style={styles.text}>
              3. If approved, your logo will be listed on our marketplace
            </Text>
          </div>

          <Text style={styles.text}>
            Thank you for choosing Afterlife. We appreciate your contribution to our community.
          </Text>
        </>
      }
      ctaText="Track Submission Status"
      ctaUrl="https://afterlife.work/submissions"
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="logo_submission"
    />
  )
}

const styles = {
  text: {
    color: '#FFFFFF',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  bold: {
    fontWeight: '600',
  },
  details: {
    backgroundColor: '#000000',
    border: '1px solid #222222',
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
  },
  detailsHeading: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px',
  },
}
