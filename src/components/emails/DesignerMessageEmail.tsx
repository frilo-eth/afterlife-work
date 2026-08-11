import { Text } from '@react-email/components'
import { BaseEmailTemplate } from './BaseEmailTemplate'

interface DesignerMessageEmailProps {
  subject: string
  message: string
  unsubscribeUrl: string
}

export function DesignerMessageEmail({
  subject,
  message,
  unsubscribeUrl,
}: DesignerMessageEmailProps) {
  const preview = message.replace(/\s+/g, ' ').trim().slice(0, 120)

  return (
    <BaseEmailTemplate
      previewText={preview || subject}
      heading={subject}
      body={
        <>
          <Text style={styles.text}>{message}</Text>
          <Text style={styles.signoff}>— The Afterlife team</Text>
        </>
      }
      trackLinks={false}
      unsubscribeUrl={unsubscribeUrl}
    />
  )
}

const styles = {
  text: {
    color: '#FFFFFF',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 24px',
    whiteSpace: 'pre-wrap' as const,
  },
  signoff: {
    color: '#999999',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '8px 0 0',
  },
}
