import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components'
import type { FileDelivery } from '@/lib/order-fulfillment'
import { SafePreview } from './BaseEmailTemplate'

interface OrderConfirmationWithFilesProps {
  orderId: string
  logoTitle: string
  files: FileDelivery[]
  tier: string
  amount: number
}

export const OrderConfirmationWithFiles = ({
  orderId,
  logoTitle,
  files,
  tier,
  amount,
}: OrderConfirmationWithFilesProps) => {
  return (
    <Html>
      <Head />
      <SafePreview text="Your logo files are ready for download" />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank you for your purchase!</Heading>

          <Section style={section}>
            <Text style={text}>
              Your payment for {logoTitle} has been processed successfully. Your order ID is:{' '}
              {orderId}
            </Text>

            <Text style={text}>
              As a SUMMON tier customer, you have immediate access to your logo files:
            </Text>

            <Section style={filesSection}>
              {files.map((file) => (
                <Link key={file.type} href={file.url} style={fileLink} target="_blank">
                  Download {file.name}
                </Link>
              ))}
            </Section>

            <Text style={text}>
              These files include everything you need to start using your logo right away. If you
              need any assistance or have questions about the files, please don't hesitate to reach
              out.
            </Text>

            <Hr style={hr} />

            <Section style={orderSummary}>
              <Heading style={h2}>Order Summary</Heading>
              <Text style={summaryText}>
                Logo: {logoTitle}
                <br />
                Tier: {tier.toUpperCase()}
                <br />
                Amount: ${(amount / 100).toFixed(2)}
              </Text>
            </Section>

            <Text style={footer}>
              Thank you for choosing Afterlife. We're excited to be part of your brand journey.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const section = {
  padding: '24px',
  backgroundColor: '#18181b',
  borderRadius: '12px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '16px 0',
  textAlign: 'left' as const,
}

const h2 = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '16px 0',
}

const text = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
}

const filesSection = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#27272a',
  borderRadius: '8px',
}

const fileLink = {
  display: 'block',
  color: '#ffffff',
  backgroundColor: '#3f3f46',
  padding: '12px 16px',
  margin: '8px 0',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

const hr = {
  borderColor: '#3f3f46',
  margin: '32px 0',
}

const orderSummary = {
  backgroundColor: '#27272a',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
}

const summaryText = {
  ...text,
  margin: '8px 0',
}

const footer = {
  ...text,
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '32px 0 0',
}
