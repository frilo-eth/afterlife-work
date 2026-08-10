'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SubmitLogoModal } from '@/components/modals/SubmitLogoModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Distance and speed at which the header earns its backdrop. Both exist so the
// bar settles quickly on a flick as well as on a slow read.
const SCROLL_THRESHOLD = 250
const VELOCITY_THRESHOLD = 30

export const Header = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const lastScrollY = useRef(0)
  const lastTimestamp = useRef(0)

  const isLogoDetailPage = pathname !== '/'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const now = Date.now()

      let velocity = 0
      if (lastTimestamp.current) {
        const deltaTime = now - lastTimestamp.current
        const deltaY = Math.abs(currentScrollY - lastScrollY.current)
        if (deltaTime > 0) velocity = (deltaY / deltaTime) * 1000
      }

      lastScrollY.current = currentScrollY
      lastTimestamp.current = now

      setIsScrolled(
        isLogoDetailPage || currentScrollY > SCROLL_THRESHOLD || velocity > VELOCITY_THRESHOLD,
      )
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLogoDetailPage])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/*
          The backdrop fades in rather than appearing, because it reports a
          state change — you have left the top of the page — and a hard cut
          reads as a glitch.
        */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 border-b border-border bg-background/80 backdrop-blur-md',
            'transition-opacity duration-quick ease-settle',
            isScrolled ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div className="container relative mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" aria-label="Afterlife home" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="" width={36} height={36} priority />
              <span className="text-heading-24 tracking-tight text-foreground">Afterlife</span>
            </Link>

            <nav aria-label="Contribute">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsSubmitOpen(true)}
              >
                Submit
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <SubmitLogoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </>
  )
}
