'use client'

import { useState } from 'react'
import { ArrowRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { subscribeToNewsletter } from '@/lib/api'
import { cn } from '@/lib/utils'

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'

export const Hero = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')
    setMessage('')

    const response = await subscribeToNewsletter(email)

    if (response.success) {
      setStatus('success')
      setMessage(response.message || 'Thanks for subscribing.')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(response.message)
    }
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -mt-16 h-screen overflow-hidden opacity-10"
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-transparent"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-display text-balance">Save logos, save time</h1>

          <p className="mx-auto max-w-lg text-lede text-foreground-muted text-pretty">
            Unique, ready-to-use logos that died before seeing the light of day,
            waiting to be brought back.
          </p>

          <div className="mx-auto max-w-md pt-2">
            {/*
              One object rather than a field beside a button. The action lives
              inside the field it acts on, so the pair reads as a single thing
              to complete instead of two controls to visit in order.
            */}
            <form
              onSubmit={handleSubscribe}
              className={cn(
                'flex items-center gap-2 rounded-full border bg-card p-1.5 pl-4',
                'transition-colors duration-quick ease-settle',
                'focus-within:border-border-strong',
                status === 'error' ? 'border-destructive/50' : 'border-border'
              )}
            >
              <label htmlFor="hero-email" className="sr-only">
                Email address
              </label>
              <input
                id="hero-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                disabled={status === 'loading'}
                aria-invalid={status === 'error'}
                aria-describedby={message ? 'hero-subscribe-message' : undefined}
                className="min-w-0 flex-1 bg-transparent text-label text-foreground outline-none placeholder:text-foreground-muted disabled:opacity-60"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                loading={status === 'loading'}
                aria-label="Subscribe"
                className="shrink-0 rounded-full"
              >
                <ArrowRight />
              </Button>
            </form>

            {/*
              What subscribing costs you, stated before you commit rather than
              in a confirmation afterwards.
            */}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-foreground-subtle">
              <Send className="h-3 w-3" aria-hidden="true" />
              One email a week. Unsubscribe anytime.
            </p>

            {message && (
              <p
                id="hero-subscribe-message"
                role={status === 'error' ? 'alert' : 'status'}
                className={cn(
                  'mt-2 text-caption',
                  status === 'error' ? 'text-destructive' : 'text-foreground-muted'
                )}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
