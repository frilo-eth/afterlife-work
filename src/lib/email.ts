import { Resend } from 'resend'
import type { FileDelivery } from './order-fulfillment'
import { OrderConfirmationWithFiles } from '@/components/emails/OrderConfirmationWithFiles'
import type { Tag } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export function createEmailClient() {
  return {
    send: async ({ type, to, subject, react, html, text, tags = [] }: {
      type?: EmailType;
      to: string;
      subject: string;
      react?: React.ReactNode;
      html?: string;
      text?: string;
      tags?: Array<{ name: string; value: string }>;
    }) => {
      const from = type ? EmailConfig[type] : EmailConfig.system;
      return resend.emails.send({
        from,
        to,
        subject,
        react,
        html,
        text,
        tags
      });
    }
  };
}

export type EmailType = 'customer' | 'designer' | 'submissions' | 'orders' | 'system' | 'admin' | 'payouts'
export type EmailTemplate = 
  | 'OrderConfirmationWithFiles'
  | 'OrderConfirmationPendingWordmark'
  | 'OrderConfirmationRevival'
  | 'OrderConfirmationAfterlife'
  | 'NewDesignTask'
  | 'NewAfterlifeProject'
  | 'NewOrderNotification'

export const EmailConfig = {
  customer: 'orders@afterlife.design',
  designer: 'design@afterlife.design',
  submissions: 'submissions@afterlife.design',
  orders: 'orders@afterlife.design',
  system: 'system@afterlife.design',
  admin: 'admin@afterlife.design',
  payouts: 'payouts@afterlife.design',
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
  data
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
      tags: [
        { name: 'email_type', value: 'order_confirmation' },
        { name: 'tier', value: data.tier || 'unknown' }
      ]
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
        amount: data.amount
      })
    // TODO: Add other email templates
    default:
      throw new Error(`Email template ${template} not implemented`)
  }
} 