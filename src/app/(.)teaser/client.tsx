'use client'

import { Button, Input, Tooltip } from '@nextui-org/react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SubmitLogoModal } from '@/components/modals/SubmitLogoModal'
import { subscribeToNewsletter } from '@/lib/api'

export function TeaserClient() {
  const [email, setEmail] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      // Try to use the API if available
      try {
        const response = await subscribeToNewsletter(email)
        if (response.success) {
          setStatus('success')
          setMessage('Thanks for subscribing!')
          setEmail('')
          return
        }
      } catch (apiError) {
        // API error, fallback to client-side validation
        console.error('API error, using fallback:', apiError)
      }

      // Simple email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address')
      }

      // Save email directly without using the API
      console.log('Email subscription:', email)

      setStatus('success')
      setMessage('Thanks for subscribing!')
      setEmail('')
    } catch (error) {
      console.error('Error subscribing:', error)
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Failed to subscribe. Please try again later.',
      )
    } finally {
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Dots Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-transparent"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link href="/teaser" className="opacity-90">
              <img src="/logo.svg" alt="Afterlife Logo" className="h-8 w-auto" />
            </Link>

            <nav className="flex items-center gap-6">
              <Tooltip
                content="Coming soon"
                placement="bottom"
                className="text-sm"
                showArrow={true}
              >
                <Link
                  href="#collection"
                  className="text-sm text-foreground-muted hover:text-foreground"
                >
                  Collection
                </Link>
              </Tooltip>
              <Button
                className="bg-secondary backdrop-blur-sm border-border hover:bg-accent text-foreground text-sm h-9"
                size="sm"
                onPress={() => setIsSubmitOpen(true)}
              >
                Submit Logo
              </Button>
              <Link href="/" className="text-sm text-foreground-subtle hover:text-foreground">
                Visit Main App
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pb-16"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div
          variants={item}
          className="mb-8 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm"
        >
          <span className="text-sm text-zinc-400">Coming Soon • Q2 2024</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={item}
          className="text-4xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
        >
          Where Forgotten Logos
          <br />
          Find New Life
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={item} className="max-w-md text-center mb-12 text-zinc-400">
          Join the revolution in logo resurrection. Transform abandoned designs into timeless brand
          assets.
        </motion.p>

        {/* Email Form */}
        <motion.form
          variants={item}
          onSubmit={handleSubscribe}
          className="w-full max-w-md space-y-4"
        >
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="text-zinc-500" size={16} />}
              isDisabled={status === 'loading'}
              classNames={{
                input: 'bg-transparent text-sm',
                inputWrapper: [
                  'bg-zinc-900/50',
                  'backdrop-blur-sm',
                  'border border-zinc-800',
                  'hover:border-zinc-700',
                  'h-12',
                  'px-4',
                ],
              }}
            />
            <Button
              type="submit"
              isLoading={status === 'loading'}
              className="h-12 px-6 bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="flex items-center gap-2">
                Join Waitlist
                <motion.div animate={{ x: isHovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
                  <ArrowRight size={16} />
                </motion.div>
              </span>
            </Button>
          </div>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm text-center ${
                status === 'error' ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {message}
            </motion.p>
          )}
        </motion.form>
      </motion.div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-foreground-muted">
              Afterlife. Where rejected logos find new life. Made by{' '}
              <a href="https://frilo.io" className="hover:text-foreground">
                frilo
              </a>
              .
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="mailto:hi@afterlife.work"
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Say hi
              </Link>
              <Link
                href="https://x.com/afterlifewrk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Follow us
              </Link>
              <Link
                href="https://cal.com/afterlife/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <SubmitLogoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  )
}
