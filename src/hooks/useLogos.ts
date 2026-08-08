'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { LogoWithDetails, LogoStatus } from '@/types'
import { toast } from 'sonner'

interface LogosResponse {
  logos: LogoWithDetails[]
  groupedLogos: Record<LogoStatus, LogoWithDetails[]>
}

// Add cache management
const CACHE_DURATION = 5000 // 5 seconds
let lastFetchTime = 0
let cachedResponse: LogosResponse | null = null

export function useLogos() {
  const [logos, setLogos] = useState<LogoWithDetails[]>([])
  const [groupedLogos, setGroupedLogos] = useState<Record<LogoStatus, LogoWithDetails[]>>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMounted = useRef(true)
  const activeRequest = useRef<Promise<LogosResponse> | null>(null)

  // Memoize state setters to avoid dependency issues
  const updateState = useCallback((data: LogosResponse) => {
    if (isMounted.current) {
      setLogos(data.logos)
      setGroupedLogos(data.groupedLogos)
      setError(null)
    }
  }, [])

  const fetchLogos = useCallback(async (force = false) => {
    const now = Date.now()
    
    // Use cached data if available and not forced refresh
    if (!force && cachedResponse && now - lastFetchTime < CACHE_DURATION) {
      updateState(cachedResponse)
      setIsLoading(false)
      return
    }

    // Prevent concurrent requests
    if (activeRequest.current) {
      try {
        const data = await activeRequest.current
        updateState(data)
        return
      } catch (err) {
        // If the existing request fails, proceed with a new one
        activeRequest.current = null
      }
    }

    try {
      setIsLoading(true)
      
      // Create the new request
      const fetchPromise = (async () => {
        const res = await fetch('/api/logos', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (!res.ok) throw new Error('Failed to fetch logos')
        const data: LogosResponse = await res.json()
        if (!data.logos || !Array.isArray(data.logos)) {
          throw new Error('Invalid response format')
        }
        return data
      })()

      // Store the active request
      activeRequest.current = fetchPromise

      const data = await fetchPromise
      updateState(data)
      
      // Update cache
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
  }, [updateState])

  // Set up cleanup
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchLogos()
  }, [fetchLogos])

  const updateLogoStatus = useCallback(async (logoId: string, newStatus: LogoStatus) => {
    const toastId = toast.loading('Updating status...')
    try {
      const formData = new FormData()
      const logo = logos.find(l => l.id === logoId)
      if (!logo) throw new Error('Logo not found')

      formData.append('status', newStatus)
      formData.append('title', logo.title)
      formData.append('description', logo.description || '')
      formData.append('tags', JSON.stringify(logo.tags || []))

      const response = await fetch(`/api/admin/logos/${logoId}/edit`, {
        method: 'PATCH',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update status')
      }

      const updatedLogo = await response.json()
      
      // Update local state optimistically
      setLogos(prev => prev.map(l => l.id === logoId ? { ...l, status: newStatus } : l))
      
      // Update grouped logos state
      setGroupedLogos(prev => {
        if (!prev) return prev
        const newGroupedLogos = { ...prev }
        // Remove from old status group
        for (const status of Object.keys(newGroupedLogos)) {
          newGroupedLogos[status as LogoStatus] = newGroupedLogos[status as LogoStatus].filter(l => l.id !== logoId)
        }
        // Add to new status group
        if (!newGroupedLogos[newStatus]) newGroupedLogos[newStatus] = []
        newGroupedLogos[newStatus].push({ ...logo, status: newStatus })
        return newGroupedLogos
      })

      // Invalidate cache
      cachedResponse = null
      lastFetchTime = 0

      toast.success(`Updated status to ${newStatus}`, { id: toastId })
    } catch (error) {
      console.error('Error updating logo status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update status', { id: toastId })
      throw error
    }
  }, [logos])

  const deleteLogo = useCallback(async (logoId: string) => {
    const toastId = toast.loading('Deleting logo...')
    try {
      const response = await fetch(`/api/admin/logos/${logoId}/delete`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete logo')
      }

      // Update local state optimistically
      setLogos(prev => prev.filter(l => l.id !== logoId))
      
      if (groupedLogos) {
        setGroupedLogos(prev => {
          if (!prev) return prev
          const newGroupedLogos = { ...prev }
          for (const status of Object.keys(newGroupedLogos)) {
            newGroupedLogos[status as LogoStatus] = newGroupedLogos[status as LogoStatus].filter(l => l.id !== logoId)
          }
          return newGroupedLogos
        })
      }

      // Invalidate cache
      cachedResponse = null
      lastFetchTime = 0

      toast.success('Logo deleted successfully', { id: toastId })
    } catch (error) {
      console.error('Error deleting logo:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete logo', { id: toastId })
      throw error
    }
  }, [groupedLogos])

  const reviewLogo = useCallback(async (logoId: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT', message?: string) => {
    const toastId = toast.loading(`Processing ${action.toLowerCase().replace('_', ' ')}...`)
    try {
      const response = await fetch(`/api/admin/logos/${logoId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, message })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process review action')
      }

      const updatedLogo = await response.json()
      
      // Update local state optimistically
      setLogos(prev => prev.map(l => l.id === logoId ? updatedLogo : l))
      
      if (groupedLogos) {
        setGroupedLogos(prev => {
          if (!prev) return prev
          const newGroupedLogos = { ...prev }
          // Remove from REVIEW status
          newGroupedLogos.REVIEW = newGroupedLogos.REVIEW.filter(l => l.id !== logoId)
          // Add to appropriate status based on action
          const newStatus = action === 'APPROVE' ? 'AVAILABLE' : action === 'REJECT' ? 'HIDDEN' : 'REVIEW'
          if (!newGroupedLogos[newStatus]) newGroupedLogos[newStatus] = []
          newGroupedLogos[newStatus].push(updatedLogo)
          return newGroupedLogos
        })
      }

      // Invalidate cache
      cachedResponse = null
      lastFetchTime = 0

      toast.success(
        action === 'APPROVE'
          ? 'Logo has been approved'
          : action === 'REQUEST_CHANGES'
          ? 'Changes requested from designer'
          : 'Logo has been rejected',
        { id: toastId }
      )
    } catch (error) {
      console.error('Review action error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process review action', { id: toastId })
      throw error
    }
  }, [groupedLogos])

  return { 
    logos, 
    groupedLogos, 
    isLoading, 
    error,
    updateLogoStatus,
    deleteLogo,
    reviewLogo,
    refresh: useCallback((force = true) => fetchLogos(force), [fetchLogos])
  }
} 