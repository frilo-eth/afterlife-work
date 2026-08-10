import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface RetainerSaleAlertEmailProps {
  buyerName: string
  buyerEmail: string
  retainerAmount: number
  purchaseDate: string
  transactionId: string
}

export function RetainerSaleAlertEmail({
  buyerName,
  buyerEmail,
  retainerAmount,
  purchaseDate,
  transactionId,
}: RetainerSaleAlertEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(retainerAmount / 100)

  return (
    <BaseEmailTemplate
      previewText={`New Retainer Sale: ${formattedAmount} from ${buyerName}`}
      heading="New Retainer Sale 🎉"
      body={
        <>
          <Text style={styles.text}>A new retainer has been purchased!</Text>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Sale Details</Text>
            <Text style={styles.text}>
              <span style={styles.label}>Buyer:</span> {buyerName}
            </Text>
            <Text style={styles.text}>
              <span style={styles.label}>Email:</span> {buyerEmail}
            </Text>
            <Text style={styles.text}>
              <span style={styles.label}>Amount:</span> {formattedAmount}
            </Text>
            <Text style={styles.text}>
              <span style={styles.label}>Date:</span> {purchaseDate}
            </Text>
            <Text style={styles.text}>
              <span style={styles.label}>Transaction ID:</span> {transactionId}
            </Text>
          </div>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Required Actions</Text>
            <Text style={styles.text}>1. Review buyer information</Text>
            <Text style={styles.text}>2. Verify payment processing</Text>
            <Text style={styles.text}>3. Set up retainer access</Text>
          </div>
        </>
      }
      ctaText="View Transaction Details"
      ctaUrl={`https://afterlife.work/admin/transactions/${transactionId}`}
      utmSource="email"
      utmMedium="internal"
      utmCampaign="retainer_sale"
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
  label: {
    color: '#666666',
    fontWeight: '600',
  },
}
