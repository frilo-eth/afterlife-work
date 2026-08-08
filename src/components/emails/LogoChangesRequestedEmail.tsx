import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface LogoChangesRequestedEmailProps {
  designerName: string
  logoTitle: string
  changes: string[]
  additionalNotes?: string
}

export function LogoChangesRequestedEmail({
  designerName,
  logoTitle,
  changes,
  additionalNotes
}: LogoChangesRequestedEmailProps) {
  return (
    <BaseEmailTemplate
      previewText={`Changes requested for your logo: ${logoTitle}`}
      heading="Logo Changes Requested"
      body={
        <>
          <Text style={styles.text}>
            Hi {designerName},
          </Text>
          
          <Text style={styles.text}>
            We've reviewed your logo <span style={styles.bold}>{logoTitle}</span> and would like to request some changes before we can approve it.
          </Text>
          
          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Requested Changes</Text>
            {changes.map((change) => (
              <Text key={`change-${change.slice(0, 20)}`} style={styles.listItem}>
                • {change}
              </Text>
            ))}
            {additionalNotes && (
              <>
                <Text style={styles.detailsHeading}>Additional Notes</Text>
                <Text style={styles.text}>
                  {additionalNotes}
                </Text>
              </>
            )}
          </div>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Next Steps</Text>
            <Text style={styles.text}>
              1. Review the requested changes carefully
            </Text>
            <Text style={styles.text}>
              2. Make the necessary adjustments to your logo
            </Text>
            <Text style={styles.text}>
              3. Submit the updated version through your dashboard
            </Text>
          </div>

          <Text style={styles.text}>
            We're excited to see your revised version. If you have any questions about the requested changes, 
            please don't hesitate to reach out.
          </Text>
        </>
      }
      ctaText="Submit Revised Version"
      ctaUrl="https://afterlife.work/dashboard/submissions"
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="logo_changes"
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
  listItem: {
    color: '#FFFFFF',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 12px',
    paddingLeft: '20px',
  }
} 