'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PricingModal } from '@/components/modals/PricingModal'
import { SubmitLogoModal } from '@/components/modals/SubmitLogoModal'

const linkClass =
  'block text-sm text-muted-foreground transition-colors duration-quick ease-settle hover:text-foreground'

// Actions that open a dialog are buttons, not links. They were previously
// anchors wrapping `#` with a click handler, which announces as navigation,
// breaks open-in-new-tab, and moves the page to the top on activation.
const actionClass = `${linkClass} text-left`

export const Footer = () => {
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h2 className="mb-4 font-mono text-sm uppercase tracking-wider opacity-50">
                About
              </h2>
              <p className="text-sm text-muted-foreground">
                Where rejected logos find new life. Each design tells a story of what
                could have been—and what still could be.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Made by{' '}
                <a
                  href="https://frilo.io"
                  className="transition-colors duration-quick ease-settle hover:text-foreground"
                >
                  frilo.io
                </a>
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-mono text-sm uppercase tracking-wider opacity-50">
                Links
              </h2>
              <div className="space-y-2">
                <Link href="/#collection" className={linkClass}>
                  Collection
                </Link>
                <button type="button" className={actionClass} onClick={() => setIsSubmitOpen(true)}>
                  Submit Logo
                </button>
                <button type="button" className={actionClass} onClick={() => setIsPricingOpen(true)}>
                  Pricing
                </button>
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-mono text-sm uppercase tracking-wider opacity-50">
                Contact
              </h2>
              <div className="space-y-2">
                <a href="mailto:hi@afterlife.work" className={linkClass}>
                  Email us
                </a>
                <a
                  href="https://x.com/afterlifewrk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Follow us
                </a>
                <a
                  href="https://cal.com/afterlife/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Book a call
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <SubmitLogoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </>
  )
}
