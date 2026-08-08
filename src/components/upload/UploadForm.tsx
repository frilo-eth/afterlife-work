import React, { useState } from "react"
import { Card, CardBody, Input, Button, Textarea } from "@nextui-org/react"
import { Upload } from "lucide-react"
import { LOGO_TAGS } from "@/lib/constants"
import { uploadLogo } from "@/lib/cloudinary"

interface UploadFormProps {
  onSuccess: (logoId: string) => void
}

export const UploadForm = ({ onSuccess }: UploadFormProps) => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFiles(files)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files) return

    setLoading(true)
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadLogo(files[0])
      
      // Create logo record
      const response = await fetch('/api/logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: [imageUrl],
          thumbnail: imageUrl
        })
      })

      const { logo } = await response.json()
      onSuccess(logo.id)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900/50 backdrop-blur-sm border border-white/10">
      <CardBody className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
                required
              />
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 
                         border-dashed border-white/20 rounded-lg cursor-pointer
                         hover:border-white/40 transition-colors"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm text-white/50">Click to upload logo</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
          >
            Upload Logo
          </Button>
        </form>
      </CardBody>
    </Card>
  )
} 