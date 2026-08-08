import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@nextui-org/react'

interface FileUploaderProps {
  onUpload: (files: string[]) => void
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    setUploading(true)
    const files = Array.from(e.target.files)
    const formData = new FormData()
    
    for (const file of files) {
      formData.append('files', file)
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      onUpload(data.urls)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        id="file-upload"
        onChange={handleUpload}
      />
      <label htmlFor="file-upload">
        <Button
          as="span"
          color="primary"
          isLoading={uploading}
          startContent={<Upload />}
        >
          Upload Images
        </Button>
      </label>
    </div>
  )
} 