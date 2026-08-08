import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Spinner } from '@nextui-org/react'

interface ImagePreview {
  preview: string
  id: string
}

interface LogoPreviewProps {
  placeholder: ImagePreview | null
  gallery: ImagePreview[]
  onRemove?: (id: string) => void
  isLoading?: boolean
}

export function LogoPreview({ 
  placeholder, 
  gallery, 
  onRemove,
  isLoading 
}: LogoPreviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview</h3>
      
      {placeholder && (
        <div className="space-y-2">
          <Label>Main Image</Label>
          <div className="relative w-full h-48 group">
            <Image
              src={placeholder.preview}
              alt="Placeholder preview"
              fill
              className="object-contain rounded-lg"
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(placeholder.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {gallery.length > 0 && (
        <div className="space-y-2">
          <Label>Gallery Images ({gallery.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((preview) => (
              <div key={preview.id} className="relative aspect-square group">
                <Image
                  src={preview.preview}
                  alt="Gallery preview"
                  fill
                  className="object-cover rounded-lg"
                />
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(preview.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 