import { Img, Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface LogoApprovalEmailProps {
  logoId: string
  title: string
  thumbnail: string
}

export function LogoApprovalEmail({ logoId, title, thumbnail }: LogoApprovalEmailProps) {
  return (
    <BaseEmailTemplate
      previewText={`Your logo ${title} has been approved!`}
      heading="Congratulations! Your Logo is Live"
      body={
        <>
          <Text style={styles.text}>
            Great news! Your logo <span style={styles.bold}>{title}</span> has been approved and is
            now live on Afterlife.
          </Text>

          <div style={styles.imageContainer}>
            <Img src={thumbnail} alt={title} width={400} height={300} style={styles.image} />
          </div>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>What's Next?</Text>
            <Text style={styles.text}>1. Your logo is now visible to potential buyers</Text>
            <Text style={styles.text}>2. You'll be notified when someone purchases your logo</Text>
            <Text style={styles.text}>
              3. Feel free to submit more logos to grow your portfolio
            </Text>
          </div>

          <Text style={styles.text}>
            Thank you for being part of the Afterlife community. We look forward to seeing more of
            your work!
          </Text>
        </>
      }
      ctaText="View Your Logo"
      ctaUrl={`https://afterlife.work/${logoId}`}
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="logo_approval"
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
  imageContainer: {
    margin: '32px 0',
    textAlign: 'center' as const,
    backgroundColor: '#000000',
    padding: '40px',
    borderRadius: '12px',
    border: '1px solid #222222',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
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
