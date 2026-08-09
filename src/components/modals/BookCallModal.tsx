'use client'

import React from "react"
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react"

interface BookCallModalProps {
  isOpen: boolean
  onClose: () => void
}

const CAL_NAMESPACE = "30min"
const CAL_LINK = "afterlife/30min"
const CAL_URL = "https://cal.com/afterlife/30min"

export function BookCallModal({ isOpen, onClose }: BookCallModalProps) {
  const [error, setError] = React.useState<string>('')

  React.useEffect(() => {
    if (isOpen) {
      try {
        const script = document.createElement('script')
        script.src = "https://app.cal.com/embed/embed.js"
        script.async = true
        script.onload = () => {
          // Initialize Cal with namespace
          // @ts-expect-error - Cal is injected by the script
          window.Cal?.("init", CAL_NAMESPACE, {
            origin: "https://cal.com"
          })

          // Configure UI and open inline embed
          // @ts-expect-error - Cal is injected by the script
          window.Cal?.ns[CAL_NAMESPACE]("inline", {
            elementOrSelector: '#cal-booking-place',
            calLink: CAL_LINK,
            config: {
              hideEventTypeDetails: false,
              layout: "month_view"
            }
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      classNames={{
        base: "bg-black/60 backdrop-blur-md",
        header: "border-b border-white/10",
        body: "py-6"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Book a Consultation
              {error && (
                <p className="text-sm text-red-500 mt-2">
                  {error}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="h-[600px]">
              <div 
                id="cal-booking-place" 
                className="min-h-[600px]"
                data-cal-namespace={CAL_NAMESPACE}
                data-cal-link={CAL_LINK}
                data-cal-config='{"layout":"month_view"}'
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 