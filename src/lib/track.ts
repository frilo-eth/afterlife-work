'use client'

const SESSION_KEY = 'afterlife_sid'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

/** Fire-and-forget client product event. */
export function track(name: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({
    name,
    sessionId: getSessionId(),
    path: window.location.pathname,
    logoId: typeof props?.logoId === 'string' ? props.logoId : undefined,
    props,
  })

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
      return
    }
  } catch {
    // fall through to fetch
  }

  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}
