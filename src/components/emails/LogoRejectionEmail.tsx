import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface LogoRejectionEmailProps {
  designerName: string
  logoTitle: string
  reason: string
  feedback?: string
}

export function LogoRejectionEmail({
  designerName,
  logoTitle,
  reason,
  feedback
}: LogoRejectionEmailProps) {
  return (
    <BaseEmailTemplate
      previewText={`Update on your logo submission: ${logoTitle}`}
      heading="Logo Submission Update"
      body={
        <>
          <Text style={styles.text}>
            Hi {designerName},
          </Text>
          
          <Text style={styles.text}>
            We've reviewed your logo <span style={styles.bold}>{logoTitle}</span> and unfortunately, we cannot accept it at this time.
          </Text>
          
          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Reason</Text>
            <Text style={styles.text}>
              {reason}
            </Text>
            {feedback && (
              <>
                <Text style={styles.detailsHeading}>Additional Feedback</Text>
                <Text style={styles.text}>
                  {feedback}
                </Text>
              </>
            )}
          </div>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>What's Next?</Text>
            <Text style={styles.text}>
              1. Review our submission guidelines
            </Text>
            <Text style={styles.text}>
              2. Make necessary adjustments based on feedback
            </Text>
            <Text style={styles.text}>
              3. Submit a new version or a different logo
            </Text>
          </div>

          <Text style={styles.text}>
            We appreciate your understanding and look forward to your future submissions.
          </Text>
        </>
      }
      ctaText="Review Guidelines"
      ctaUrl="https://afterlife.work/guidelines"
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="logo_rejection"
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
  }
} 