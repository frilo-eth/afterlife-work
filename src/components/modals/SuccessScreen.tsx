'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface SuccessScreenProps {
  onClose: () => void
  onSubmitAnother: () => void
  /** Render inside an existing dialog panel instead of a fullscreen overlay. */
  embedded?: boolean
}

function SuccessBody({
  embedded,
  onClose,
  onSubmitAnother,
}: {
  embedded?: boolean
  onClose: () => void
  onSubmitAnother: () => void
}) {
  if (embedded) {
    return (
      <div className="flex flex-col gap-5 py-2">
        <Image src="/oktomb.svg" alt="" width={72} height={72} priority />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="tertiary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button type="button" variant="primary" size="md" onClick={onSubmitAnother}>
            Submit another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <Image src="/oktomb.svg" alt="" width={96} height={96} className="mx-auto" priority />
        <div className="space-y-3">
          <span className="block font-mono text-metadata uppercase text-foreground-subtle">
            Revive to earn
          </span>
          <h2 className="text-4xl tracking-tight text-foreground sm:text-5xl">Got it</h2>
          <p className="mx-auto max-w-lg text-lede text-foreground-muted text-pretty">
            We’ll review it and email you.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button type="button" variant="tertiary" size="lg" onClick={onClose}>
            Back home
          </Button>
          <Button type="button" variant="primary" size="lg" onClick={onSubmitAnother}>
            Submit another
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SuccessScreen({ onClose, onSubmitAnother, embedded = false }: SuccessScreenProps) {
  const router = useRouter()

  useEffect(() => {
    if (embedded) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [embedded, onClose])

  const handleClose = () => {
    onClose()
    if (!embedded) router.push('/')
  }

  if (embedded) {
    return <SuccessBody embedded onClose={handleClose} onSubmitAnother={onSubmitAnother} />
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent hideClose placement="fullscreen">
        <DialogTitle className="sr-only">Submission successful</DialogTitle>
        <SuccessBody onClose={handleClose} onSubmitAnother={onSubmitAnother} />
      </DialogContent>
    </Dialog>
  )
}
