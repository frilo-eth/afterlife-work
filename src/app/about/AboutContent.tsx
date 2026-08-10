'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FriloPill } from '@/components/layout/FriloPill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function AboutContent() {
  return (
    <div className="container mx-auto px-4 py-20 sm:py-24">
      <h1 className="sr-only">About Afterlife</h1>
      <Card className="mx-auto max-w-xl rounded-xl border border-border bg-card pb-0">
        <CardContent className="space-y-6 p-5 sm:p-6">
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
            <p className="text-body text-foreground-muted text-pretty">
              Logos get shelved when projects stall, briefs change, or a client walks. The work is
              often finished. The world never sees it.
            </p>
            <p className="text-body text-foreground-muted text-pretty">
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
              <Button asChild variant="primary" size="lg">
                <Link href="/">Browse collection</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
