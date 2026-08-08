'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { Card, Select, SelectItem, Input, Button } from '@nextui-org/react'
import { NewLogoSubmissionEmail } from '@/components/emails/NewLogoSubmission'
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail'
// Define the type locally instead of importing from @/types
interface OrderConfirmationEmailProps {
  customerEmail: string
  logoTitle: string
  amount: number
  tier: string
  options?: {
    wordmark?: string
    domain?: string
  }
}
import { renderToString } from 'react-dom/server'

interface NewLogoSubmissionEmailProps {
  logoId: string
  title: string
  thumbnail: string
}

type TemplateProps = {
  submission: NewLogoSubmissionEmailProps
  order: OrderConfirmationEmailProps
}

type TemplateType = keyof TemplateProps

interface TemplateComponents {
  submission: React.ComponentType<NewLogoSubmissionEmailProps>
  order: React.ComponentType<OrderConfirmationEmailProps>
}

const templates: TemplateComponents = {
  submission: NewLogoSubmissionEmail,
  order: OrderConfirmationEmail,
}

const defaultProps: Record<TemplateType, TemplateProps[TemplateType]> = {
  submission: {
    logoId: 'test-123',
    title: 'Test Logo',
    thumbnail: 'https://placeholder.co/400'
  },
  order: {
    customerEmail: 'test@example.com',
    logoTitle: 'Test Logo',
    amount: 99,
    tier: 'premium',
    options: {
      wordmark: 'Test Wordmark',
      domain: 'example.com'
    }
  }
}

export default function EmailPreview() {
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateType>('submission')
  const [props, setProps] = useState<TemplateProps[typeof template]>(defaultProps[template])
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        if (!response.ok) {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const updatePreview = () => {
    if (!previewRef.current) return

    const content = template === 'submission' 
      ? <NewLogoSubmissionEmail {...(props as NewLogoSubmissionEmailProps)} />
      : <OrderConfirmationEmail {...(props as OrderConfirmationEmailProps)} />

    const htmlString = renderToString(content)
    previewRef.current.innerHTML = htmlString
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          props,
          to: testEmail
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Test email sent! Check your inbox')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      alert(`Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const handleTemplateChange = (value: string) => {
    const newTemplate = value as TemplateType
    setTemplate(newTemplate)
    setProps(defaultProps[newTemplate])
  }

  const handlePropChange = (key: string, value: string) => {
    setProps((prev) => {
      const currentValue = prev[key as keyof typeof prev]
      let newValue: string | number | object = value

      if (typeof currentValue === 'number') {
        newValue = Number(value)
      } else if (typeof currentValue === 'object') {
        try {
          newValue = JSON.parse(value)
        } catch {
          newValue = value
        }
      }

      return {
        ...prev,
        [key]: newValue
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-4 mb-4">
        <Select
          label="Template"
          value={template}
          onChange={(e) => handleTemplateChange(e.target.value)}
        >
          <SelectItem key="submission" value="submission">Logo Submission</SelectItem>
          <SelectItem key="order" value="order">Order Confirmation</SelectItem>
        </Select>

        <div className="mt-4 space-y-4">
          <Input
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter your email to receive a test"
          />

          {Object.entries(props).map(([key, value]) => (
            <Input
              key={key}
              label={key}
              value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onPress={updatePreview}
          >
            Update Preview
          </Button>
          <Button
            color="primary"
            onPress={sendTestEmail}
            isLoading={sending}
          >
            Send Test Email
          </Button>
        </div>
      </Card>

      <div 
        ref={previewRef}
        className="bg-white p-4 rounded-lg"
      />
    </div>
  )
} 