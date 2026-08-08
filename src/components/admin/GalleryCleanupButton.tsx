'use client'

import { Button } from "@nextui-org/react"
import { useState } from "react"
import { toast } from "sonner"

interface CleanupResult {
  data: {
    processed: number;
    fixed: number;
    results: Array<{
      success: boolean;
      galleryLogoId: string;
      mainLogoId?: string;
      action: string;
    }>;
  }
}

export function GalleryCleanupButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CleanupResult | null>(null)

  const handleCleanup = async () => {
    try {
      const confirmed = window.confirm(
        "This will identify gallery images that were incorrectly added as logos, " +
        "move them to the gallery collection of their parent logo, and delete the duplicate entries. " +
        "Continue?"
      )
      
      if (!confirmed) return
      
      setIsLoading(true)
      const response = await fetch('/api/admin/cleanup-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': process.env.NEXT_PUBLIC_SEED_SECRET || ''
        }
      })
      
      if (!response.ok) {
        throw new Error('Cleanup failed')
      }
      
      const cleanupResult = await response.json()
      console.log('Gallery cleanup result:', cleanupResult)
      setResult(cleanupResult)
      
      // Show success message
      if (cleanupResult.data.fixed > 0) {
        toast.success(
          `Successfully cleaned up ${cleanupResult.data.fixed} gallery images!`,
          { duration: 5000 }
        )
      } else {
        toast.info(
          'No gallery images needed cleanup.',
          { duration: 5000 }
        )
      }
      
      // Reload page after a short delay
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Gallery cleanup error:', error)
      toast.error('Gallery cleanup failed. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button 
        onPress={handleCleanup}
        isLoading={isLoading}
        color="secondary"
        className="fixed bottom-4 left-4 z-50"
      >
        Fix Gallery Images
      </Button>
      
      {result && (
        <div className="fixed bottom-16 left-4 z-50 bg-black/80 text-white p-4 rounded-md text-xs w-64 max-h-64 overflow-auto">
          <p>Processed: {result.data.processed}</p>
          <p>Fixed: {result.data.fixed}</p>
          <details>
            <summary>Details</summary>
            <pre>{JSON.stringify(result.data.results, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
} 