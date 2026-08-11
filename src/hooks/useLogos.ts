'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { scheduleUndoableAction } from '@/lib/destructive-action'
import type { LogoStatus, LogoWithDetails } from '@/types'

interface LogosResponse {
  logos: LogoWithDetails[]
  groupedLogos: Record<LogoStatus, LogoWithDetails[]>
}

const STATUS_LABEL: Record<LogoStatus, string> = {
  AVAILABLE: 'Live',
  REVIEW: 'Submitted',
  DRAFT: 'Draft',
  HIDDEN: 'Rejected',
  SOLD: 'Sold',
  TRASH: 'Trash',
}

const CACHE_DURATION = 5000 // 5 seconds
let lastFetchTime = 0
let cachedResponse: LogosResponse | null = null

function moveLogoStatus(
  prev: Record<LogoStatus, LogoWithDetails[]> | undefined,
  logo: LogoWithDetails,
  to: LogoStatus,
): Record<LogoStatus, LogoWithDetails[]> | undefined {
  if (!prev) return prev
  const next: Record<LogoStatus, LogoWithDetails[]> = { ...prev }
  for (const status of Object.keys(next) as LogoStatus[]) {
    next[status] = next[status].filter((l) => l.id !== logo.id)
  }
  const moved = { ...logo, status: to }
  next[to] = [moved, ...(next[to] ?? [])]
  return next
}

export function useLogos() {
  const [logos, setLogos] = useState<LogoWithDetails[]>([])
  const [groupedLogos, setGroupedLogos] = useState<Record<LogoStatus, LogoWithDetails[]>>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMounted = useRef(true)
  const activeRequest = useRef<Promise<LogosResponse> | null>(null)
  const logosRef = useRef(logos)
  logosRef.current = logos

  const updateState = useCallback((data: LogosResponse) => {
    if (isMounted.current) {
      const logos = (data.logos ?? []).filter((logo) => !!logo?.id)
      const groupedLogos = data.groupedLogos
        ? (Object.fromEntries(
            Object.entries(data.groupedLogos).map(([status, items]) => [
              status,
              (items ?? []).filter((logo) => !!logo?.id),
            ]),
          ) as Record<LogoStatus, LogoWithDetails[]>)
        : undefined

      // Drop poisoned in-memory cache entries (e.g. review responses stored as logos).
      if (logos.length !== (data.logos?.length ?? 0)) {
        cachedResponse = null
        lastFetchTime = 0
      }

      setLogos(logos)
      setGroupedLogos(groupedLogos)
      setError(null)
    }
  }, [])

  const fetchLogos = useCallback(
    async (force = false) => {
      const now = Date.now()

      if (!force && cachedResponse && now - lastFetchTime < CACHE_DURATION) {
        updateState(cachedResponse)
        setIsLoading(false)
        return
      }

      if (activeRequest.current) {
        try {
          const data = await activeRequest.current
          updateState(data)
          return
        } catch (_err) {
          activeRequest.current = null
        }
      }

      try {
        setIsLoading(true)

        const fetchPromise = (async () => {
          const res = await fetch('/api/logos', {
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          })
          if (!res.ok) throw new Error('Failed to fetch logos')
          const data: LogosResponse = await res.json()
          if (!data.logos || !Array.isArray(data.logos)) {
            throw new Error('Invalid response format')
          }
          return data
        })()

        activeRequest.current = fetchPromise

        const data = await fetchPromise
        updateState(data)

        cachedResponse = data
        lastFetchTime = now
      } catch (err) {
        if (isMounted.current) {
          console.error('Error fetching logos:', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
        activeRequest.current = null
      }
    },
    [updateState],
  )

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    fetchLogos()
  }, [fetchLogos])

  const updateLogoStatus = useCallback(async (logoId: string, newStatus: LogoStatus) => {
    if (newStatus === 'SOLD') {
      toast.error('Sold is set automatically by Stripe checkout')
      return
    }

    const logo = logosRef.current.find((l) => l.id === logoId)
    if (!logo) {
      toast.error('Logo not found')
      return
    }
    if (logo.status === 'SOLD') {
      toast.error('Sold logos are locked')
      return
    }
    if (logo.status === newStatus) return

    const previousStatus = logo.status
    const moved = { ...logo, status: newStatus }

    // Optimistic: update UI in the same tick as the click.
    setLogos((prev) => prev.map((l) => (l.id === logoId ? moved : l)))
    setGroupedLogos((prev) => moveLogoStatus(prev, logo, newStatus))
    cachedResponse = null
    lastFetchTime = 0

    try {
      const response = await fetch(`/api/admin/logos/${logoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to update status')
      }

      if (newStatus === 'TRASH') {
        toast.success('Moved to Trash')
      } else if (previousStatus === 'TRASH') {
        toast.success(`Restored to ${STATUS_LABEL[newStatus]}`)
      }
    } catch (error) {
      setLogos((prev) => prev.map((l) => (l.id === logoId ? { ...l, status: previousStatus } : l)))
      setGroupedLogos((prev) => moveLogoStatus(prev, moved, previousStatus))
      console.error('Error updating logo status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
      throw error
    }
  }, [])

  const deleteLogo = useCallback((logoId: string) => {
    const logo = logosRef.current.find((l) => l.id === logoId)
    if (!logo) {
      toast.error('Logo not found')
      return
    }
    if (logo.status === 'SOLD') {
      toast.error('Sold logos cannot be deleted from admin')
      return
    }
    if (logo.status !== 'TRASH') {
      toast.error('Move the logo to Trash first')
      return
    }

    const snapshot = logo

    setLogos((prev) => prev.filter((l) => l.id !== logoId))
    setGroupedLogos((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      for (const status of Object.keys(next)) {
        next[status as LogoStatus] = next[status as LogoStatus].filter((l) => l.id !== logoId)
      }
      return next
    })
    cachedResponse = null
    lastFetchTime = 0

    scheduleUndoableAction({
      message: `Permanently deleted “${logo.title}”`,
      description: 'Removed from the database. Undo available for a few seconds.',
      onUndo: () => {
        setLogos((prev) => {
          if (prev.some((l) => l.id === snapshot.id)) return prev
          return [snapshot, ...prev]
        })
        setGroupedLogos((prev) => {
          if (!prev) {
            return { [snapshot.status]: [snapshot] } as Record<LogoStatus, LogoWithDetails[]>
          }
          const next = { ...prev }
          const bucket = next[snapshot.status] ?? []
          if (bucket.some((l) => l.id === snapshot.id)) return prev
          next[snapshot.status] = [snapshot, ...bucket]
          return next
        })
        cachedResponse = null
        lastFetchTime = 0
      },
      onCommit: async () => {
        const response = await fetch(`/api/admin/logos/${logoId}/delete`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || errorData.error || 'Failed to delete logo')
        }
      },
    })
  }, [])

  const trashLogo = useCallback(
    async (logoId: string) => {
      const logo = logosRef.current.find((l) => l.id === logoId)
      if (!logo) {
        toast.error('Logo not found')
        return
      }
      if (logo.status === 'SOLD') {
        toast.error('Sold logos cannot be moved to Trash')
        return
      }
      if (logo.status === 'TRASH') {
        toast.error('Logo is already in Trash')
        return
      }

      await updateLogoStatus(logoId, 'TRASH')
    },
    [updateLogoStatus],
  )

  const reviewLogo = useCallback(
    async (logoId: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT', message?: string) => {
      const toastId = toast.loading(`Processing ${action.toLowerCase().replace('_', ' ')}...`)
      try {
        const response = await fetch(`/api/admin/logos/${logoId}/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, message }),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.message || err.error || 'Failed to process review action')
        }

        const payload = await response.json()
        const updatedLogo = (payload.logo ?? payload) as LogoWithDetails
        if (!updatedLogo?.id) {
          throw new Error('Review succeeded but the response was missing the logo')
        }

        const newStatus: LogoStatus =
          action === 'APPROVE' ? 'AVAILABLE' : action === 'REJECT' ? 'HIDDEN' : 'REVIEW'
        const nextLogo = { ...updatedLogo, status: newStatus }

        setLogos((prev) => prev.map((l) => (l.id === logoId ? nextLogo : l)))

        setGroupedLogos((prev) => {
          if (!prev) return prev
          const newGroupedLogos = { ...prev }
          for (const status of Object.keys(newGroupedLogos) as LogoStatus[]) {
            newGroupedLogos[status] = newGroupedLogos[status].filter((l) => l.id !== logoId)
          }
          if (!newGroupedLogos[newStatus]) newGroupedLogos[newStatus] = []
          newGroupedLogos[newStatus] = [nextLogo, ...newGroupedLogos[newStatus]]
          return newGroupedLogos
        })

        cachedResponse = null
        lastFetchTime = 0

        toast.success(
          action === 'APPROVE'
            ? 'Logo has been approved'
            : action === 'REQUEST_CHANGES'
              ? 'Changes requested from designer'
              : 'Logo has been rejected',
          { id: toastId },
        )
      } catch (error) {
        console.error('Review action error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to process review action', {
          id: toastId,
        })
        throw error
      }
    },
    [],
  )

  return {
    logos,
    groupedLogos,
    isLoading,
    error,
    updateLogoStatus,
    deleteLogo,
    trashLogo,
    reviewLogo,
    refresh: useCallback((force = true) => fetchLogos(force), [fetchLogos]),
  }
}
