'use client'

import { useState } from 'react'
import { Card, Button, Select, SelectItem } from '@nextui-org/react'

const templates = [
  { value: 'order-confirmation', label: 'Order Confirmation' },
  { value: 'logo-approval', label: 'Logo Approval' },
  { value: 'new-submission', label: 'New Logo Submission' }
]

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Email Preview</h1>
      
      <Card className="p-6 bg-default-50">
        <div className="space-y-4">
          <Select 
            label="Select Template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            variant="bordered"
            classNames={{
              trigger: "bg-default-100",
              value: "text-white"
            }}
          >
            {templates.map((template) => (
              <SelectItem key={template.value} value={template.value}>
                {template.label}
              </SelectItem>
            ))}
          </Select>

          <Button
            variant="flat"
            className="bg-default-100 text-white"
            isDisabled={!selectedTemplate}
            onPress={() => {
              window.open(`/api/email/preview?template=${selectedTemplate}`, '_blank')
            }}
          >
            Preview Email
          </Button>
        </div>
      </Card>
    </div>
  )
} 