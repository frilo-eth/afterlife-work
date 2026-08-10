'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface SuccessScreenProps {
  onClose: () => void
  onSubmitAnother: () => void
}

export function SuccessScreen({ onClose, onSubmitAnother }: SuccessScreenProps) {
  const router = useRouter()

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleClose = () => {
    onClose()
    router.push('/')
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent hideClose placement="fullscreen">
        <DialogTitle className="sr-only">Submission successful</DialogTitle>
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <Image src="/oktomb.svg" alt="" width={96} height={96} className="mx-auto" priority />
            <div className="space-y-3">
              <span className="block font-mono text-metadata uppercase text-foreground-subtle">
                Submit logo
              </span>
              <h2 className="text-4xl tracking-tight text-foreground sm:text-5xl">
                Submission successful
              </h2>
              <p className="mx-auto max-w-lg text-lede text-foreground-muted text-pretty">
                We&apos;ve received your submission. Our team will review it shortly.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button type="button" variant="tertiary" size="lg" onClick={handleClose}>
                Back home
              </Button>
              <Button type="button" variant="primary" size="lg" onClick={onSubmitAnother}>
                Submit another logo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
