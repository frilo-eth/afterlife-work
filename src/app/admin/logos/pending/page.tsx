'use client'

import { useEffect, useState } from 'react'
import { LogosTable } from '@/components/admin/LogosTable'
import type { Logo, LogoWithDetails } from '@/types'

export default function PendingLogosPage() {
  const [logos, setLogos] = useState<(Logo | LogoWithDetails)[]>([])
  
  useEffect(() => {
    const fetchLogos = async () => {
      const res = await fetch('/api/admin/logos/pending')
      const data = await res.json()
      setLogos(data.logos)
    }
    fetchLogos()
  }, [])

  return <LogosTable logos={logos as LogoWithDetails[]} />
} 