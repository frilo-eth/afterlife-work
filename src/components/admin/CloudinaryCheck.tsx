import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

type CloudinaryCheckResult = {
  success: boolean
  logoCount: number
  folders: Record<string, number>
  environment: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string
  }
  sampleLogos?: Array<{
    public_id: string
    url: string
  }>
}

type CloudinaryCheckError = {
  message: string
  code?: string
  details?: string
  environment?: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string
  }
}

export default function CloudinaryCheck() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CloudinaryCheckResult | null>(null)
  const [error, setError] = useState<CloudinaryCheckError | null>(null)

  const checkCloudinary = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    
    try {
      const response = await fetch('/api/cloudinary-check')
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data)
      }
    } catch (err) {
      setError({
        message: 'Failed to check Cloudinary',
        details: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cloudinary Status</CardTitle>
        <CardDescription>
          Check Cloudinary configuration and available logos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={checkCloudinary} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Checking...' : 'Check Cloudinary Status'}
          </Button>

          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error checking Cloudinary</AlertTitle>
              <AlertDescription>
                <div className="mt-2 text-sm">
                  <p><strong>Message:</strong> {error.message}</p>
                  {error.details && <p><strong>Details:</strong> {error.details}</p>}
                  {error.code && <p><strong>Code:</strong> {error.code}</p>}
                </div>
                
                {error.environment && (
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold">Environment Variables:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {error.environment.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</li>
                      <li>CLOUDINARY_API_KEY: {error.environment.CLOUDINARY_API_KEY}</li>
                      <li>CLOUDINARY_API_SECRET: {error.environment.CLOUDINARY_API_SECRET}</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert variant={result.logoCount > 0 ? "default" : "warning"}>
                <AlertTitle>Cloudinary Status</AlertTitle>
                <AlertDescription>
                  <p className="font-medium">
                    {result.logoCount > 0
                      ? `Found ${result.logoCount} logos in Cloudinary`
                      : "No logos found in Cloudinary"}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Environment Variables:</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {result.environment.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</li>
                  <li>CLOUDINARY_API_KEY: {result.environment.CLOUDINARY_API_KEY}</li>
                  <li>CLOUDINARY_API_SECRET: {result.environment.CLOUDINARY_API_SECRET}</li>
                </ul>
              </div>

              {Object.keys(result.folders).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Folders:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.folders).map(([folder, count]) => (
                      <Badge key={folder} variant="outline">
                        {folder}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.sampleLogos && result.sampleLogos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Sample Logos:</h4>
                  <div className="space-y-2">
                    {result.sampleLogos.map((logo) => (
                      <div key={logo.public_id} className="flex items-center justify-between border p-2 rounded-md">
                        <div className="text-xs truncate max-w-[70%]">{logo.public_id}</div>
                        <a 
                          href={logo.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 