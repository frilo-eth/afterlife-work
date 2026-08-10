'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BookCallModalProps {
  isOpen: boolean
  onClose: () => void
}

const CAL_NAMESPACE = '30min'
const CAL_LINK = 'afterlife/30min'
const CAL_URL = 'https://cal.com/afterlife/30min'

export function BookCallModal({ isOpen, onClose }: BookCallModalProps) {
  const [error, _setError] = React.useState<string>('')

  React.useEffect(() => {
    if (isOpen) {
      try {
        const script = document.createElement('script')
        script.src = 'https://app.cal.com/embed/embed.js'
        script.async = true
        script.onload = () => {
          // Initialize Cal with namespace
          // @ts-expect-error - Cal is injected by the script
          window.Cal?.('init', CAL_NAMESPACE, {
            origin: 'https://cal.com',
          })

          // Configure UI and open inline embed
          // @ts-expect-error - Cal is injected by the script
          window.Cal?.ns[CAL_NAMESPACE]('inline', {
            elementOrSelector: '#cal-booking-place',
            calLink: CAL_LINK,
            config: {
              hideEventTypeDetails: false,
              layout: 'month_view',
            },
          })
        }

        script.onerror = () => {
          console.error('Failed to load Cal.com script')
          // Fallback to direct URL if script fails to load
          window.open(CAL_URL, '_blank')
          onClose()
        }

        document.body.appendChild(script)

        return () => {
          document.body.removeChild(script)
          window.Cal = undefined
        }
      } catch (err) {
        console.error('Error initializing Cal.com:', err)
        // Fallback to direct URL if initialization fails
        window.open(CAL_URL, '_blank')
        onClose()
      }
    }
  }, [isOpen, onClose])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Book a Consultation</DialogTitle>
          {error && <DialogDescription className="text-destructive">{error}</DialogDescription>}
        </DialogHeader>

        <div
          id="cal-booking-place"
          className="min-h-[600px]"
          data-cal-namespace={CAL_NAMESPACE}
          data-cal-link={CAL_LINK}
          data-cal-config='{"layout":"month_view"}'
        />
      </DialogContent>
    </Dialog>
  )
}
