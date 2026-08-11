'use client'

import Image from 'next/image'
import { FriloPill } from '@/components/layout/FriloPill'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent size="lg" className="border border-border bg-background shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>About Afterlife</DialogTitle>
          <DialogDescription>
            Logos get shelved when projects stall. Afterlife puts finished marks back in play.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative mx-auto aspect-[12/5] w-full">
            <Image
              src="/about-arch.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 640px) 36rem, 90vw"
              className="object-contain mix-blend-screen"
            />
          </div>

          <div className="space-y-3 text-left">
            <p className="text-pretty text-body text-foreground-muted">
              Logos get shelved when projects stall, briefs change, or a client walks. The work is
              often finished. The world never sees it.
            </p>
            <p className="text-pretty text-body text-foreground-muted">
              Afterlife puts those marks back in play. Buy a finished identity today. Or submit one
              and get paid when it finds a home.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex flex-wrap items-center gap-1.5 text-caption text-foreground-subtle">
              Made with soul by
              <FriloPill />
            </p>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="tertiary" size="lg">
                <a href="mailto:hi@afterlife.work">Get in touch</a>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => {
                  onClose()
                  if (window.location.pathname === '/') {
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                    return
                  }
                  window.location.assign('/#collection')
                }}
              >
                Browse collection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
