'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@nextui-org/react'
import Image from 'next/image'

interface FileAsset {
  url: string
  filename: string
  type: 'ai' | 'pdf' | 'svg'
}

interface DownloadDetails {
  logoId: string
  title: string
  files: FileAsset[]
}

export default function DownloadPage() {
  const params = useParams()
  const router = useRouter()
  const [details, setDetails] = useState<DownloadDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDownloadDetails() {
      try {
        const response = await fetch(`/api/download/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch download details')
        const data = await response.json()
        setDetails(data)
      } catch (err) {
        setError('Failed to load download details')
      } finally {
        setLoading(false)
      }
    }

    fetchDownloadDetails()
  }, [params.id])

  const handleDownload = async (file: FileAsset) => {
    try {
      const response = await fetch(`/api/download/${params.id}/file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.filename }),
      })

      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  if (loading) {
    return (
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">Preparing your files...</h1>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">Something went wrong</h1>
          <p className="text-foreground-muted mb-8">{error}</p>
          <Button onPress={() => router.push('/')}>Return Home</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <Image
            src="/parka.svg"
            alt="Afterlife Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
          Your Files Are Ready
        </h1>
        
        <div className="space-y-4 mb-8">
          {details?.files.map((file) => (
            <Button
              key={file.filename}
              onPress={() => handleDownload(file)}
              className="w-full bg-secondary backdrop-blur-sm border-border hover:bg-accent"
            >
              Download {file.type.toUpperCase()}
            </Button>
          ))}
        </div>

        <Button 
          className="bg-secondary backdrop-blur-sm border-border hover:bg-accent text-foreground text-sm h-9"
          size="sm"
          onPress={() => router.push('/')}
        >
          Return to Collection
        </Button>
      </div>
    </main>
  )
} 