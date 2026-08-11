import { Resend } from 'resend'
import { OrderConfirmationWithFiles } from '@/components/emails/OrderConfirmationWithFiles'
import type { FileDelivery } from './order-fulfillment'

const resend = new Resend(process.env.RESEND_API_KEY)

/** Resend only allows [A-Za-z0-9_-] in tag names/values. */
function sanitizeEmailTag(value: string, max = 48): string {
  return (
    value
      .normalize('NFKD')
      .replace(/[^\w-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, max) || 'unknown'
  )
}

/**
 * Strip invisible Unicode that React Email's <Preview> (and similar) inject.
 * Apple iCloud HM08 content-rejects messages containing these runes.
 */
export function stripEmailInvisibleChars(html: string): string {
  // Null bytes + bidi/zero-width marks from React Email preview padding.
  return html
    .split('\0')
    .join('')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
}

/** Monitored inbox for human replies (iCloud on the root domain). */
export const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL ?? 'hi@afterlife.work'

const SITE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://afterlife.work'

export function unsubscribeUrlFor(email: string): string {
  return `${SITE_URL}/api/email/unsubscribe?email=${encodeURIComponent(email.trim().toLowerCase())}`
}

const APPLE_MAILBOX_DOMAINS = new Set(['icloud.com', 'me.com', 'mac.com'])

/**
 * Apple iCloud (including custom domains on iCloud MX) content-rejects many
 * branded HTML templates with HM08. Prefer plain text for those inboxes.
 */
export async function shouldSendPlainTextOnly(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.trim().toLowerCase()
  if (!domain) return false
  if (APPLE_MAILBOX_DOMAINS.has(domain)) return true

  // This project's own mailbox is hosted on iCloud.
  if (domain === 'afterlife.work' || domain === 'frilo.io') return true

  try {
    const redis = (await import('./redis')).default
    const cacheKey = `email:mx-apple:${domain}`
    if (redis.status === 'ready') {
      const cached = await redis.get(cacheKey)
      if (cached === '1') return true
      if (cached === '0') return false
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1500)
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { accept: 'application/dns-json' },
        signal: controller.signal,
      },
    )
    clearTimeout(timer)
    if (!response.ok) return false
    const data = (await response.json()) as { Answer?: Array<{ data?: string }> }
    const answers = data.Answer ?? []
    const onApple = answers.some((row) => /icloud\.com\.?$/i.test(row.data ?? ''))
    if (redis.status === 'ready') {
      await redis.setex(cacheKey, 60 * 60 * 24, onApple ? '1' : '0')
    }
    return onApple
  } catch {
    return false
  }
}

/** RFC 8058 headers required by Apple/Gmail for bulk-looking mail. */
export function listUnsubscribeHeaders(email: string): Record<string, string> {
  const url = unsubscribeUrlFor(email)
  const mailto = `mailto:${REPLY_TO_EMAIL}?subject=${encodeURIComponent(`Unsubscribe ${email}`)}`
  return {
    'List-Unsubscribe': `<${url}>, <${mailto}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

export async function isEmailSuppressed(email: string): Promise<boolean> {
  try {
    const redis = (await import('./redis')).default
    if (redis.status !== 'ready') return false
    const value = await redis.get(`email:suppress:${email.trim().toLowerCase()}`)
    return Boolean(value)
  } catch {
    return false
  }
}

function htmlToPlainText(html: string): string {
  return stripEmailInvisibleChars(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export function createEmailClient() {
  return {
    send: async ({
      type,
      to,
      subject,
      react,
      html,
      text,
      from: fromOverride,
      replyTo = REPLY_TO_EMAIL,
      headers,
      listUnsubscribe = false,
      tags = [],
    }: {
      type?: EmailType
      to: string
      subject: string
      react?: React.ReactNode
      html?: string
      text?: string
      from?: string
      replyTo?: string
      headers?: Record<string, string>
      /** Add List-Unsubscribe headers (required for Apple bulk policy). */
      listUnsubscribe?: boolean
      tags?: Array<{ name: string; value: string }>
    }) => {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured')
      }

      if (await isEmailSuppressed(to)) {
        throw new Error('Recipient has unsubscribed from Afterlife email')
      }

      const from = fromOverride ?? (type ? EmailConfig[type] : EmailConfig.system)
      const safeTags = tags
        .map((tag) => ({
          name: sanitizeEmailTag(tag.name, 256),
          value: sanitizeEmailTag(tag.value, 256),
        }))
        .filter((tag) => tag.name && tag.value)

      const appleInbox = await shouldSendPlainTextOnly(to)
      const mergedHeaders = {
        ...(listUnsubscribe || appleInbox ? listUnsubscribeHeaders(to) : {}),
        ...headers,
      }

      // Sanitize HTML (including HTML Resend would render from `react`) so
      // Apple never sees zero-width preview padding.
      let safeHtml = html !== undefined ? stripEmailInvisibleChars(html) : undefined
      let safeReact = react
      let safeText = text

      if (react !== undefined && safeHtml === undefined && !appleInbox) {
        try {
          const { render } = await import('@react-email/render')
          safeHtml = stripEmailInvisibleChars(await render(react as React.ReactElement))
          safeReact = undefined
        } catch (error) {
          console.warn('Failed to pre-render email HTML; falling back to react prop', error)
        }
      } else if (safeHtml !== undefined) {
        safeReact = undefined
      }

      // Apple iCloud (incl. custom domains like frilo.io / afterlife.work) HM08
      // content-rejects branded HTML. Always send plain text only to those MX.
      if (appleInbox) {
        if (!safeText) {
          if (safeHtml) {
            safeText = htmlToPlainText(safeHtml)
          } else if (react !== undefined) {
            try {
              const { render } = await import('@react-email/render')
              safeText = htmlToPlainText(await render(react as React.ReactElement))
            } catch (error) {
              console.warn('Failed to derive plain text for Apple recipient', error)
            }
          }
        }
        safeHtml = undefined
        safeReact = undefined
      }

      const payload = {
        from,
        to,
        subject,
        reply_to: replyTo,
        tags: safeTags,
        ...(Object.keys(mergedHeaders).length > 0 ? { headers: mergedHeaders } : {}),
        ...(safeReact !== undefined ? { react: safeReact } : {}),
        ...(safeHtml !== undefined ? { html: safeHtml } : {}),
        ...(safeText !== undefined ? { text: safeText } : {}),
      }

      if (safeReact === undefined && safeHtml === undefined && safeText === undefined) {
        throw new Error('Email content is required')
      }

      const { data, error } = await resend.emails.send(
        payload as Parameters<typeof resend.emails.send>[0],
      )

      if (error) {
        throw new Error(error.message || 'Failed to send email')
      }

      return { data, error: null }
    },
  }
}

export type EmailType =
  | 'customer'
  | 'designer'
  | 'submissions'
  | 'orders'
  | 'system'
  | 'admin'
  | 'payouts'
export type EmailTemplate =
  | 'OrderConfirmationWithFiles'
  | 'OrderConfirmationPendingWordmark'
  | 'OrderConfirmationRevival'
  | 'OrderConfirmationAfterlife'
  | 'NewDesignTask'
  | 'NewAfterlifeProject'
  | 'NewOrderNotification'

/**
 * Sending addresses.
 *
 * Every one of these must sit on a domain verified in Resend or the send is
 * rejected outright. This block previously used @afterlife.design, and
 * lib/notifications used @afterlife.com, while the only verified domain is
 * updates.afterlife.work — so order confirmations, designer notifications and
 * approval mail could never have been delivered.
 */
export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN ?? 'updates.afterlife.work'

export const EmailConfig = {
  customer: `Afterlife <orders@${EMAIL_DOMAIN}>`,
  // Person-to-person local-part: Gmail buckets `updates@` / `design@` as promo.
  designer: `Afterlife <hi@${EMAIL_DOMAIN}>`,
  submissions: `Afterlife <submissions@${EMAIL_DOMAIN}>`,
  orders: `Afterlife <orders@${EMAIL_DOMAIN}>`,
  system: `Afterlife <system@${EMAIL_DOMAIN}>`,
  admin: `Afterlife <admin@${EMAIL_DOMAIN}>`,
  payouts: `Afterlife <payouts@${EMAIL_DOMAIN}>`,
} as const

interface EmailData {
  logoTitle: string
  tier?: string
  orderId?: string
  files?: FileDelivery[]
  amount?: number
  hasWordmark?: boolean
  estimatedDays?: string
  logoId?: string
  wordmark?: string
  customerEmail?: string
  domain?: string
}

interface BaseEmailProps {
  template: EmailTemplate
  to?: string
  data: EmailData
}

interface OrderConfirmationEmailProps extends BaseEmailProps {
  type: EmailType
  customerEmail?: string
}

export async function sendOrderConfirmationEmail({
  type,
  template,
  to,
  data,
}: OrderConfirmationEmailProps) {
  const from = EmailConfig[type]
  const recipient = to || getDefaultRecipient(type)

  try {
    const emailComponent = await renderEmailTemplate(template, data)

    await resend.emails.send({
      from,
      to: recipient,
      subject: getSubject(template, data),
      react: emailComponent,
      reply_to: REPLY_TO_EMAIL,
      tags: [
        { name: 'email_type', value: 'order_confirmation' },
        { name: 'tier', value: data.tier || 'unknown' },
      ],
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

function getDefaultRecipient(type: EmailType): string {
  switch (type) {
    case 'admin':
      return process.env.ADMIN_EMAIL || EmailConfig.admin
    case 'system':
      return process.env.SYSTEM_EMAIL || EmailConfig.system
    case 'designer':
      return process.env.DESIGNER_EMAIL || EmailConfig.designer
    default:
      throw new Error('Customer emails must specify a recipient')
  }
}

function getSubject(template: EmailTemplate, data: EmailData): string {
  const title = data.logoTitle || 'Untitled Logo'

  switch (template) {
    case 'OrderConfirmationWithFiles':
      return `Your Logo Files Are Ready - ${title}`
    case 'OrderConfirmationPendingWordmark':
      return `Order Confirmation - ${title}`
    case 'OrderConfirmationRevival':
      return `Order Confirmation - ${title}`
    case 'OrderConfirmationAfterlife':
      return `Welcome to Afterlife - ${title}`
    case 'NewDesignTask':
      return `New Design Task - ${title}`
    case 'NewAfterlifeProject':
      return `New Afterlife Project - ${title}`
    case 'NewOrderNotification':
      return `New Order - ${title}`
    default:
      return 'Afterlife Notification'
  }
}

async function renderEmailTemplate(template: EmailTemplate, data: EmailData) {
  switch (template) {
    case 'OrderConfirmationWithFiles':
      if (!data.orderId || !data.files || !data.amount) {
        throw new Error('Missing required data for OrderConfirmationWithFiles template')
      }
      return OrderConfirmationWithFiles({
        orderId: data.orderId,
        logoTitle: data.logoTitle,
        files: data.files,
        tier: data.tier || 'unknown',
        amount: data.amount,
      })
    // TODO: Add other email templates
    default:
      throw new Error(`Email template ${template} not implemented`)
  }
}
