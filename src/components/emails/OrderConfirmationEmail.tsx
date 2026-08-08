import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'
import type { OrderConfirmationEmailProps } from '@/types/index'

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function OrderConfirmationEmail({
  customerEmail,
  logoTitle,
  amount,
  tier,
  options
}: OrderConfirmationEmailProps) {
  const formattedAmount = formatAmount(amount)
  const formattedTier = capitalizeFirstLetter(tier)
  
  return (
    <BaseEmailTemplate
      previewText={`Order confirmation for ${logoTitle}`}
      heading="Thank you for your order!"
      body={
        <>
          <Text style={styles.text}>
            We are excited to confirm you purchased the <span style={styles.bold}>{logoTitle}</span> unit.
          </Text>
          
          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Order Details</Text>
            <div style={styles.detailsGrid}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.value}>{formattedAmount}</Text>
              
              <Text style={styles.label}>Package:</Text>
              <Text style={styles.value}>{formattedTier}</Text>
              
              {options?.wordmark && (
                <>
                  <Text style={styles.label}>Wordmark:</Text>
                  <Text style={styles.value}>{options.wordmark}</Text>
                </>
              )}
            </div>
          </div>

          <Text style={styles.text}>
            Your logo files are ready for download. Click the button below to access your files.
          </Text>
        </>
      }
      ctaText="Download Logo Files"
      ctaUrl={`https://afterlife.work/orders/${logoTitle}/download`}
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="order_confirmation"
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
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: '12px',
  },
  label: {
    color: '#666666',
    fontSize: '14px',
    margin: '0',
  },
  value: {
    color: '#FFFFFF',
    fontSize: '14px',
    margin: '0',
  },
}