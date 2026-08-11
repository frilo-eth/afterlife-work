import { Body, Container, Head, Html, Img, Link, Section, Text } from '@react-email/components'

interface BaseEmailProps {
  previewText: string
  heading: string
  body: React.ReactNode
  ctaText?: string
  ctaUrl?: string
  /** Skip UTM params — cleaner for person-to-person / Apple filters. */
  trackLinks?: boolean
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  unsubscribeUrl?: string
}

/**
 * Hidden inbox preview without React Email's zero-width padding characters.
 * Those invisible runes are a common Apple iCloud "content rejected" trigger.
 */
export function SafePreview({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'none',
        overflow: 'hidden',
        lineHeight: '1px',
        opacity: 0,
        maxHeight: 0,
        maxWidth: 0,
      }}
    >
      {text.replace(/\s+/g, ' ').trim()}
    </div>
  )
}

export const BaseEmailTemplate = ({
  previewText,
  heading,
  body,
  ctaText,
  ctaUrl,
  trackLinks = true,
  utmSource = 'email',
  utmMedium = 'transactional',
  utmCampaign = 'system',
  unsubscribeUrl,
}: BaseEmailProps) => {
  const year = new Date().getFullYear()
  const href =
    ctaUrl && trackLinks
      ? `${ctaUrl}${ctaUrl.includes('?') ? '&' : '?'}utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`
      : ctaUrl

  return (
    <Html>
      <Head />
      <SafePreview text={previewText} />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            {/*
              PNG, not SVG: most clients strip or block SVG images, which leaves
              a broken mark and looks like phishing to spam filters.
            */}
            <Img
              src="https://afterlife.work/apple-touch-icon.png"
              width={40}
              height={40}
              alt="Afterlife"
              style={styles.logo}
            />
          </Section>

          <Section style={styles.content}>
            <Text style={styles.heading}>{heading}</Text>
            {body}

            {ctaText && href && (
              <Section style={styles.ctaContainer}>
                <Link href={href} style={styles.button}>
                  {ctaText}
                </Link>
              </Section>
            )}
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>© {year} Afterlife. All rights reserved.</Text>
            <Text style={styles.footerLinks}>
              <Link href="https://afterlife.work" style={styles.link}>
                afterlife.work
              </Link>
              {' · '}
              <Link href="mailto:hi@afterlife.work" style={styles.link}>
                hi@afterlife.work
              </Link>
            </Text>
            {unsubscribeUrl ? (
              <Text style={styles.footerLinks}>
                <Link href={unsubscribeUrl} style={styles.link}>
                  Unsubscribe
                </Link>
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#000000',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    margin: 0,
    padding: 0,
  },
  container: {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
  },
  logoSection: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  content: {
    backgroundColor: '#111111',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid #222222',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: '24px',
    lineHeight: '1.3',
    fontWeight: '600',
    margin: '0 0 24px',
    padding: '0',
    textAlign: 'left' as const,
  },
  ctaContainer: {
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    color: '#000000',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '1',
    padding: '16px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  footerText: {
    color: '#666666',
    fontSize: '12px',
    lineHeight: '1.5',
    margin: '0 0 12px',
  },
  footerLinks: {
    color: '#666666',
    fontSize: '12px',
    lineHeight: '1.5',
    margin: '0 0 8px',
  },
  link: {
    color: '#666666',
    textDecoration: 'underline',
  },
}
