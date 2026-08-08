'use client'

import React from "react"
import { Link } from "@nextui-org/react"
import NextLink from 'next/link'
import { PricingModal } from "@/components/modals/PricingModal"
import { SubmitLogoModal } from "@/components/modals/SubmitLogoModal"
import { BookCallModal } from "@/components/modals/BookCallModal"

export const Footer = () => {
  const [isPricingOpen, setIsPricingOpen] = React.useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = React.useState(false)
  const [isCallOpen, setIsCallOpen] = React.useState(false)

  return (
    <>
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-mono text-sm tracking-wider opacity-50 uppercase mb-4">
                About
              </h4>
              <p className="text-sm text-white/60">
                Where rejected logos find new life. Each design tells a story of what could have been—and what still could be.
              </p>
              <p className="text-sm text-white/60 mt-4">
                Made by <a href="https://frilo.io" className="hover:text-white">frilo.io</a>
              </p>
            </div>
            
            <div>
              <h4 className="font-mono text-sm tracking-wider opacity-50 uppercase mb-4">
                Links
              </h4>
              <div className="space-y-2">
                <NextLink href="#collection" passHref legacyBehavior>
                  <Link className="block text-sm text-white/60 hover:text-white cursor-pointer">
                    Collection
                  </Link>
                </NextLink>
                <NextLink href="#" passHref legacyBehavior>
                  <Link 
                    className="block text-sm text-white/60 hover:text-white cursor-pointer"
                    onPress={() => setIsSubmitOpen(true)}
                  >
                    Submit Logo
                  </Link>
                </NextLink>
                <NextLink href="#" passHref legacyBehavior>
                  <Link 
                    className="block text-sm text-white/60 hover:text-white cursor-pointer"
                    onPress={() => setIsPricingOpen(true)}
                  >
                    Pricing
                  </Link>
                </NextLink>
              </div>
            </div>
            
            <div>
              <h4 className="font-mono text-sm tracking-wider opacity-50 uppercase mb-4">
                Contact
              </h4>
              <div className="space-y-2">
                <Link 
                  className="block text-sm text-white/60 hover:text-white"
                  href="mailto:hi@afterlife.work"
                >
                  Email us
                </Link>
                <Link 
                  className="block text-sm text-white/60 hover:text-white"
                  href="https://x.com/afterlifewrk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow us
                </Link>
                <Link 
                  className="block text-sm text-white/60 hover:text-white"
                  href="https://cal.com/afterlife/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a call
                </Link>
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