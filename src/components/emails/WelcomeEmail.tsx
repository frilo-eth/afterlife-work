import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface WelcomeEmailProps {
  name: string
  isDesigner: boolean
  verificationUrl?: string
}

export function WelcomeEmail({ name, isDesigner, verificationUrl }: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate
      previewText="Welcome to Afterlife - Let&apos;s get started!"
      heading="Welcome to Afterlife 👋"
      body={
        <>
          <Text style={styles.text}>Hi {name},</Text>

          <Text style={styles.text}>
            Welcome to Afterlife! We&apos;re excited to have you join our community of{' '}
            {isDesigner ? 'talented designers' : 'logo enthusiasts'}.
          </Text>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Getting Started</Text>
            {isDesigner ? (
              <>
                <Text style={styles.text}>1. Complete your designer profile</Text>
                <Text style={styles.text}>2. Review our submission guidelines</Text>
                <Text style={styles.text}>3. Submit your first logo</Text>
              </>
            ) : (
              <>
                <Text style={styles.text}>1. Browse our curated logo collection</Text>
                <Text style={styles.text}>2. Save your favorite logos</Text>
                <Text style={styles.text}>3. Purchase when you&apos;re ready</Text>
              </>
            )}
          </div>

          {verificationUrl && (
            <div style={styles.details}>
              <Text style={styles.detailsHeading}>Verify Your Email</Text>
              <Text style={styles.text}>
                To ensure the security of your account and enable all features, please verify your
                email address.
              </Text>
            </div>
          )}

          <Text style={styles.text}>
            If you have any questions or need assistance, our team is here to help.
          </Text>
        </>
      }
      ctaText={verificationUrl ? 'Verify Email' : isDesigner ? 'Start Designing' : 'Explore Logos'}
      ctaUrl={
        verificationUrl ||
        (isDesigner
          ? 'https://afterlife.work/dashboard/submissions'
          : 'https://afterlife.work/explore')
      }
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="welcome"
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
