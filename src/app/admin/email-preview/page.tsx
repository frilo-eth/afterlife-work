'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const templates = [
  { value: 'order-confirmation', label: 'Order Confirmation' },
  { value: 'logo-approval', label: 'Logo Approval' },
  { value: 'new-submission', label: 'New Logo Submission' },
]

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('')

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-heading-24 text-foreground">Email preview</h1>
        <p className="text-caption text-foreground-muted">Open a template in a new tab.</p>
      </header>

      <div className="max-w-md space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-2" role="listbox" aria-label="Email templates">
          {templates.map((template) => {
            const selected = selectedTemplate === template.value
            return (
              <button
                key={template.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setSelectedTemplate(template.value)}
                className={cn(
                  'flex w-full items-center rounded-md border px-3 py-2.5 text-left text-label',
                  'transition-[border-color,color] duration-80',
                  selected
                    ? 'border-border-strong text-foreground'
                    : 'border-border text-foreground-muted hover:border-border-strong hover:text-foreground',
                )}
              >
                {template.label}
              </button>
            )
          })}
        </div>

        <Button
          variant="primary"
          size="md"
          disabled={!selectedTemplate}
          onClick={() => {
            window.open(`/api/email/preview?template=${selectedTemplate}`, '_blank')
          }}
        >
          Preview email
        </Button>
      </div>
    </div>
  )
}
