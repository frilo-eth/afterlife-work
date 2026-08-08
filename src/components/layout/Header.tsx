'use client'

import React, { useRef, useEffect } from "react"
import { Button, Link } from "@nextui-org/react"
import NextLink from 'next/link'
import Image from 'next/image'
import { PricingModal } from "@/components/modals/PricingModal"
import { SubmitLogoModal } from "@/components/modals/SubmitLogoModal"
import { usePathname } from 'next/navigation'

export const Header = () => {
  const [isPricingOpen, setIsPricingOpen] = React.useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()
  const lastScrollY = useRef(0)
  const scrollVelocity = useRef(0)
  
  // For development: Check if we're in dev mode
  const isDev = process.env.NODE_ENV === 'development'
  
  const isLogoDetailPage = pathname !== '/'

  useEffect(() => {
    const SCROLL_THRESHOLD = 250; // Fixed pixel threshold instead of percentage
    const VELOCITY_THRESHOLD = 30; // Pixel movement between frames to detect fast scrolls
    
    let lastTimestamp = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      
      // Calculate velocity if we have previous values
      if (lastTimestamp) {
        const deltaTime = currentTime - lastTimestamp;
        const deltaY = Math.abs(currentScrollY - lastScrollY.current);
        scrollVelocity.current = deltaY / deltaTime * 1000; // pixels per second
      }
      
      lastScrollY.current = currentScrollY;
      lastTimestamp = currentTime;
      
      if (isLogoDetailPage) {
        setIsScrolled(true);
      } else {
        // Show blur if either threshold is met
        setIsScrolled(
          currentScrollY > SCROLL_THRESHOLD || 
          scrollVelocity.current > VELOCITY_THRESHOLD
        );
      }
    };

    // More frequent updates during scrolling
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLogoDetailPage]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Blur effect - always rendered but opacity changes */}
        <div 
          className={`absolute inset-0 transition-opacity duration-75 ${
            isLogoDetailPage || isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/10" />
        </div>
        
        {/* Header content */}
        <div className="container mx-auto px-4 relative">
          <div className="h-16 flex items-center justify-between">
            <NextLink href="/" passHref legacyBehavior>
              <Link>
                <Image
                  src="/logo.svg"
                  alt="Afterlife Logo"
                  width={32}
                  height={32}
                  priority
                />
              </Link>
            </NextLink>
            
            <nav className="flex items-center gap-6">
              {isLogoDetailPage ? (
                <NextLink href="/#collection" passHref legacyBehavior>
                  <Link className="text-sm text-white/70 hover:text-white">
                    Collection
                  </Link>
                </NextLink>
              ) : (
                <NextLink href="#collection" passHref legacyBehavior>
                  <Link className="text-sm text-white/70 hover:text-white">
                    Collection
                  </Link>
                </NextLink>
              )}
              <Link 
                className="text-sm text-white/70 hover:text-white cursor-pointer"
                onPress={() => setIsPricingOpen(true)}
              >
                Pricing
              </Link>
              <Button 
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white text-sm h-9"
                size="sm"
                onPress={() => setIsSubmitOpen(true)}
              >
                Submit Logo
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <SubmitLogoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </>
  )
} 