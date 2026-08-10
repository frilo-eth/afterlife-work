'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { PricingModal } from '@/components/modals/PricingModal'
import { SubmitLogoModal } from '@/components/modals/SubmitLogoModal'
import { cn } from '@/lib/utils'

// Distance and speed at which the header earns its backdrop. Both exist so the
// bar settles quickly on a flick as well as on a slow read.
const SCROLL_THRESHOLD = 250
const VELOCITY_THRESHOLD = 30

// Navigation is text, not buttons. A row of filled and outlined controls makes
// every destination look like an action and gives the bar more weight than the
// work it sits above.
const navLink =
  'text-label text-foreground-muted transition-colors duration-quick ease-settle hover:text-foreground'

export const Header = () => {
  const [isPricingOpen, setIsPricingOpen] = useState(false)
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
        isLogoDetailPage || currentScrollY > SCROLL_THRESHOLD || velocity > VELOCITY_THRESHOLD
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
            isScrolled ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div className="container relative mx-auto px-4">
          {/*
            Three columns, so the wordmark is optically centred on the page
            rather than pushed off-centre by whichever side has more links.
          */}
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <nav aria-label="Browse" className="flex items-center gap-6">
              <Link href={isLogoDetailPage ? '/#collection' : '#collection'} className={navLink}>
                Collection
              </Link>
              <button type="button" className={navLink} onClick={() => setIsPricingOpen(true)}>
                Pricing
              </button>
            </nav>

            <Link
              href="/"
              aria-label="Afterlife home"
              className="flex items-center gap-2 justify-self-center"
            >
              <Image src="/logo.svg" alt="" width={24} height={24} priority />
              <span className="text-label font-medium text-foreground">Afterlife</span>
            </Link>

            <nav aria-label="Contribute" className="flex items-center justify-end gap-6">
              <button type="button" className={navLink} onClick={() => setIsSubmitOpen(true)}>
                Submit
              </button>
            </nav>
          </div>
        </div>
      </header>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <SubmitLogoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </>
  )
}
