import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface LogoSoldEmailProps {
  logoTitle: string
  saleAmount: number
  commission: number
  isEarlyAdopter: boolean
  earlyAdopterNumber: number
  estimatedPayout: number
  payoutDate: string
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function LogoSoldEmail({
  logoTitle,
  saleAmount,
  commission,
  isEarlyAdopter,
  earlyAdopterNumber,
  estimatedPayout,
  payoutDate,
}: LogoSoldEmailProps) {
  const formattedSale = formatAmount(saleAmount)
  const formattedCommission = formatAmount(commission)
  const formattedPayout = formatAmount(estimatedPayout)
  const commissionRate = isEarlyAdopter ? 0 : (commission / saleAmount) * 100

  return (
    <BaseEmailTemplate
      previewText={`Your logo ${logoTitle} has been sold!`}
      heading="Congratulations on Your Sale! 🎉"
      body={
        <>
          <Text style={styles.text}>
            Amazing news! Your logo <span style={styles.bold}>{logoTitle}</span> has been sold.
          </Text>

          {isEarlyAdopter && (
            <div style={styles.earlyAdopter}>
              <Text style={styles.earlyAdopterText}>
                🏆 Early Adopter Benefit #{earlyAdopterNumber}/100
              </Text>
              <Text style={styles.text}>
                As one of our first 100 logo creators, you're receiving 100% of the sale price with
                zero platform fees!
              </Text>
            </div>
          )}

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>Sale Breakdown</Text>
            <div style={styles.detailsGrid}>
              <Text style={styles.label}>Sale Amount:</Text>
              <Text style={styles.value}>{formattedSale}</Text>

              <Text style={styles.label}>Platform Fee:</Text>
              <Text style={styles.value}>
                {isEarlyAdopter ? (
                  <span style={styles.highlight}>0% (Early Adopter Benefit)</span>
                ) : (
                  `${commissionRate}% (${formattedCommission})`
                )}
              </Text>

              <Text style={styles.label}>Your Payout:</Text>
              <Text style={styles.highlight}>{formattedPayout}</Text>
            </div>
          </div>

          <div style={styles.details}>
            <Text style={styles.detailsHeading}>What's Next?</Text>
            <Text style={styles.text}>1. Your payout will be processed on {payoutDate}</Text>
            <Text style={styles.text}>2. Funds will be sent to your connected payment account</Text>
            <Text style={styles.text}>
              3. You'll receive a confirmation email once the transfer is complete
            </Text>
          </div>

          <Text style={styles.text}>
            Thank you for being part of Afterlife. Keep creating amazing logos!
          </Text>
        </>
      }
      ctaText="View Sale Details"
      ctaUrl="https://afterlife.work/dashboard/sales"
      utmSource="email"
      utmMedium="transactional"
      utmCampaign="logo_sold"
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
  highlight: {
    color: '#00FF00',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  },
  earlyAdopter: {
    backgroundColor: '#1A1A1A',
    border: '1px solid #333333',
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
    textAlign: 'center' as const,
  },
  earlyAdopterText: {
    color: '#00FF00',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px',
  },
}
