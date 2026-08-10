'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { InputGroup, InputField } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { subscribeToNewsletter } from '@/lib/api'
import { cn } from '@/lib/utils'

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error'

export const Hero = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [message, setMessage] = useState('')

  // A real submit handler rather than a click handler on the button: the field
  // was previously outside a form, so pressing Enter — which is how most people
  // finish typing an email — did nothing at all.
  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')
    setMessage('')

    const response = await subscribeToNewsletter(email)

    if (response.success) {
      setStatus('success')
      setMessage('Thanks for subscribing.')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(response.message)
    }
  }

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center">
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
        <div className="mx-auto max-w-3xl space-y-10 text-center">
          <div className="space-y-4">
            <span className="block font-mono text-metadata uppercase text-foreground-subtle">
              Revive a lost mark
            </span>

            <h1 className="text-display text-balance">
              Save logos, save time
            </h1>

            <p className="mx-auto max-w-xl text-lede text-foreground-muted">
              Unique, ready-to-use logos that died before seeing the light of day,
              waiting to be brought back.
            </p>
          </div>

          <div className="relative mx-auto max-w-md">
            <form onSubmit={handleSubscribe} className="flex w-full items-end gap-2 text-left">
              <InputGroup className="flex-1 [&_label]:sr-only">
                <InputField
                  index={0}
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                  disabled={status === 'loading'}
                  error={status === 'error' ? message : undefined}
                />
              </InputGroup>

              <Button type="submit" variant="primary" size="lg" loading={status === 'loading'}>
                Subscribe
              </Button>
            </form>

            {/*
              Announced politely so the outcome reaches screen readers; the
              error text is already bound to the field itself.
            */}
            {message && status !== 'error' && (
              <p
                role="status"
                className={cn(
                  'mt-2 text-sm',
                  status === 'success' ? 'text-foreground' : 'text-muted-foreground'
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
