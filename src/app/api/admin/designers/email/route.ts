import { NextResponse } from 'next/server'
import { DesignerMessageEmail } from '@/components/emails/DesignerMessageEmail'
import { requireAdmin } from '@/lib/api-utils'
import {
  createEmailClient,
  REPLY_TO_EMAIL,
  shouldSendPlainTextOnly,
  unsubscribeUrlFor,
} from '@/lib/email'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const to = typeof body.to === 'string' ? body.to.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const designerName =
      typeof body.designerName === 'string' && body.designerName.trim()
        ? body.designerName.trim()
        : undefined

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'To, subject, and message are required' }, { status: 400 })
    }

    const unsubscribeUrl = unsubscribeUrlFor(to)
    const text = `${message}\n\n— The Afterlife team\n${REPLY_TO_EMAIL}\nhttps://afterlife.work\n\nUnsubscribe: ${unsubscribeUrl}`
    // Apple iCloud HM08-rejects many branded HTML templates; plain text still delivers.
    const plainOnly = await shouldSendPlainTextOnly(to)

    const emailClient = createEmailClient()
    await emailClient.send({
      type: 'designer',
      to,
      subject,
      text,
      ...(plainOnly ? {} : { react: DesignerMessageEmail({ subject, message, unsubscribeUrl }) }),
      replyTo: REPLY_TO_EMAIL,
      listUnsubscribe: true,
      tags: [
        { name: 'category', value: 'designer-outreach' },
        ...(designerName ? [{ name: 'designer', value: designerName.slice(0, 48) }] : []),
      ],
    })

    return NextResponse.json({ success: true, plainTextOnly: plainOnly })
  } catch (error) {
    console.error('Failed to send designer email:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 },
    )
  }
}
