import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type TrackEventInput = {
  name: string
  sessionId?: string | null
  logoId?: string | null
  path?: string | null
  props?: Record<string, unknown> | null
}

/** Persist a product analytics event. Never throws to callers. */
export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: input.name.slice(0, 64),
        sessionId: input.sessionId?.slice(0, 128) || null,
        logoId: input.logoId?.slice(0, 64) || null,
        path: input.path?.slice(0, 256) || null,
        props: (input.props ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (error) {
    console.error('[analytics] track failed', input.name, error)
  }
}
