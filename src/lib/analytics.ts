type EmailEventType = 'delivered' | 'opened' | 'clicked' | 'complained' | 'bounced'

interface EmailEvent {
  type: EmailEventType
  emailId: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface ResendWebhookPayload {
  type: EmailEventType
  email_id: string
  created_at: string
  [key: string]: unknown
}

export const trackEmailEvent = async (event: EmailEvent) => {
  // Log to your analytics service
  console.log('Email event:', event)

  // You could also store in your database
  // await prisma.emailEvent.create({ data: event })
}

export const handleEmailWebhook = async (payload: ResendWebhookPayload) => {
  const { type, email_id, created_at, ...metadata } = payload

  await trackEmailEvent({
    type,
    emailId: email_id,
    timestamp: new Date(created_at),
    metadata,
  })
}
