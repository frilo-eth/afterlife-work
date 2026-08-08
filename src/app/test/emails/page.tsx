'use client'

import { useState } from "react"
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from "@nextui-org/react"
import { toast } from 'sonner'

interface EmailResult {
  success: boolean
  message?: string
  error?: string
  emailId?: string
}

const TEMPLATES = [
  { value: 'order', label: 'Order Confirmation' },
  { value: 'submission', label: 'Logo Submission' },
  { value: 'approval', label: 'Logo Approval' },
  { value: 'rejection', label: 'Logo Rejection' },
  { value: 'changes', label: 'Changes Requested' },
  { value: 'sold', label: 'Logo Sold' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'retainer_sale', label: 'Retainer Sale Alert' },
  { value: 'payout_summary', label: 'Designer Payout Summary' }
] as const

type TemplateType = typeof TEMPLATES[number]['value']

export default function TestEmails() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [template, setTemplate] = useState<TemplateType>('order')
  const [result, setResult] = useState<EmailResult | null>(null)

  const testEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, template })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Email sent successfully! ID: ${data.emailId}`)
      } else {
        toast.error(data.error || 'Failed to send email')
      }
      
      setResult(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to send email: ${errorMessage}`)
      setResult({ success: false, error: errorMessage })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Email Testing Dashboard</h1>
      
      <Card>
        <CardHeader className="font-bold">Send Test Email</CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Select 
            label="Email Template"
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateType)}
          >
            {TEMPLATES.map((template) => (
              <SelectItem key={template.value} value={template.value}>
                {template.label}
              </SelectItem>
            ))}
          </Select>

          <Button
            color="primary"
            isLoading={loading}
            onClick={testEmail}
          >
            Send Test Email
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-success-50' : 'bg-danger-50'}`}>
              <p className={result.success ? 'text-success' : 'text-danger'}>
                {result.success ? result.message : result.error}
              </p>
              {result.emailId && (
                <p className="text-sm text-gray-500 mt-2">
                  Email ID: {result.emailId}
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
} 