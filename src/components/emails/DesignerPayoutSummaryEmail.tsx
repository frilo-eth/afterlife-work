import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface PayoutItem {
  logoTitle: string
  saleAmount: number
  commission: number
  saleDate: string
}

interface DesignerPayoutSummaryEmailProps {
  designerName: string
  payoutPeriod: string
  totalAmount: number
  payoutDate: string
  items: PayoutItem[]
}

export function DesignerPayoutSummaryEmail({
  designerName,
  payoutPeriod,
  totalAmount,
  payoutDate,
  items,
}: DesignerPayoutSummaryEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  return (
    <BaseEmailTemplate
      previewText={`Payout Summary for ${payoutPeriod}: ${formatCurrency(totalAmount)}`}
      heading="Designer Payout Summary"
      body={
        <>
          <Text style={styles.text}>Hi {designerName},</Text>

          <Text style={styles.text}>
            Here&apos;s your payout summary for {payoutPeriod}. The total amount of{' '}
            {formatCurrency(totalAmount)} will be transferred on {payoutDate}.
          </Text>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Sales Breakdown</Text>
            {items.map((item) => (
              <div key={`${item.logoTitle}-${item.saleDate}`} style={styles.saleItem}>
                <Text style={styles.text}>
                  <span style={styles.bold}>{item.logoTitle}</span>
                  <br />
                  <span style={styles.label}>Sale Amount:</span> {formatCurrency(item.saleAmount)}
                  <br />
                  <span style={styles.label}>Commission:</span> {formatCurrency(item.commission)}
                  <br />
                  <span style={styles.label}>Date:</span> {item.saleDate}
                </Text>
              </div>
            ))}
          </div>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Summary</Text>
            <Text style={styles.text}>
              <span style={styles.label}>Total Sales:</span> {items.length}
            </Text>
            <Text style={styles.text}>
              <span style={styles.label}>Total Amount:</span> {formatCurrency(totalAmount)}
            </Text>
            <Text style={styles.text}>
              <span style={styles.label}>Payout Date:</span> {payoutDate}
            </Text>
          </div>

          <Text style={styles.text}>
            Thank you for being part of Afterlife. Keep up the great work!
          </Text>
        </>
      }
      ctaText="View Earnings Dashboard"
      ctaUrl="https://afterlife.work/dashboard/earnings"
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="payout_summary"
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
  label: {
    color: '#666666',
    fontWeight: '600',
  },
  saleItem: {
    borderBottom: '1px solid #222222',
    paddingBottom: '16px',
    marginBottom: '16px',
  },
}
