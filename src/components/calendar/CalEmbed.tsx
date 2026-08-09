'use client'

import { useEffect } from 'react'

interface CalEmbedProps {
  calLink: string
}

type CalFunction = (...args: unknown[]) => void

interface CalInstance extends CalFunction {
  loaded?: boolean
  ns?: Record<string, unknown>
  q?: unknown[]
}

type CalWindow = Window & {
  Cal?: CalInstance
}

export function CalEmbed({ calLink }: CalEmbedProps) {
  useEffect(() => {
    const initCal = (C: CalWindow, A: string, L: string): void => {
      const pushToQueue = (api: unknown, args: unknown[]): void => {
        if (typeof api === 'object' && api && 'q' in api) {
          (api.q as unknown[]).push(args)
        }
      }

      const d = C.document
      const initCalFunction = (...params: unknown[]): void => {
        const cal = C.Cal as CalInstance
        
        if (typeof cal === 'function') {
          if (!Object.hasOwn(cal, 'loaded')) {
            Object.defineProperty(cal, 'ns', { value: {} })
            Object.defineProperty(cal, 'q', { value: [] })
            d.head.appendChild(d.createElement('script')).src = A
            Object.defineProperty(cal, 'loaded', { value: true })
          }

          if (params[0] === L) {
            const namespace = params[1] as string
            const api = (...innerArgs: unknown[]): void => {
              pushToQueue(api, innerArgs)
            }
            
            Object.defineProperty(api, 'q', { value: [] })
            
            if (typeof namespace === 'string' && cal.ns) {
              cal.ns[namespace] = api
              pushToQueue(api, params)
            } else {
              pushToQueue(cal, params)
            }
            return
          }
          pushToQueue(cal, params)
        }
      }

      C.Cal = C.Cal || initCalFunction as CalInstance
    }

    initCal(window as CalWindow, 'https://cal.com/embed.js', 'init')

    const cal = (window as CalWindow).Cal as CalInstance
    if (cal && typeof cal === 'function') {
      cal('init', { origin: 'https://cal.com' })
      cal('inline', {
        elementOrSelector: '#cal-booking-place',
        calLink,
        config: {
          theme: 'dark',
          layout: 'month_view',
          styles: { 
            branding: { brandColor: '#000000' }
          }
        }
      })
    }

    return () => {
      if ((window as CalWindow).Cal) {
        (window as CalWindow).Cal = undefined
      }
    }
  }, [calLink])

  return <div id="cal-booking-place" className="min-h-[600px]" />
} 