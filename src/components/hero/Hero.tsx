'use client'

import { ArrowRight, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { subscribeToNewsletter } from '@/lib/api'
import { cn } from '@/lib/utils'

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'

export const Hero = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')

    const response = await subscribeToNewsletter(email)

    if (response.success) {
      setStatus('success')
      setEmail('')
      toast.success(response.message || 'Thanks for subscribing.')
    } else {
      setStatus('error')
      toast.error(response.message || 'Something went wrong.')
    }
  }

  return (
    <div className="relative flex items-center justify-center py-12 sm:py-14">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <h1 className="text-4xl tracking-tight text-nowrap sm:text-5xl">Save logos, save time</h1>

          <p className="mx-auto max-w-lg text-lede text-foreground-muted text-pretty">
            Unique, ready-to-use logos that died before seeing the light of day, waiting to be
            brought back.
          </p>

          <div className="mx-auto max-w-md pt-1">
            {/*
              One object rather than a field beside a button. The action lives
              inside the field it acts on, so the pair reads as a single thing
              to complete instead of two controls to visit in order.
            */}
            <form
              onSubmit={handleSubscribe}
              className={cn(
                'flex items-center gap-2 rounded-xl border bg-card p-1.5 pl-4',
                'transition-colors duration-quick ease-settle',
                'focus-within:border-border-strong',
                status === 'error' ? 'border-destructive/50' : 'border-border',
              )}
            >
              <label htmlFor="hero-email" className="sr-only">
                Email address
              </label>
              <Mail className="h-4 w-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
              <input
                id="hero-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (status === 'error' || status === 'success') {
                    setStatus('idle')
                  }
                }}
                placeholder="Email address"
                autoComplete="email"
                disabled={status === 'loading'}
                aria-invalid={status === 'error'}
                className="min-w-0 flex-1 bg-transparent text-label text-foreground outline-none placeholder:text-foreground-muted disabled:opacity-60"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                loading={status === 'loading'}
                aria-label="Subscribe"
                className="shrink-0"
              >
                <ArrowRight />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
