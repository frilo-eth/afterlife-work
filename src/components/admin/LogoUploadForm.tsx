"use client"

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadLogoAssets } from '@/lib/cloudinary-utils'
import Image from 'next/image'
import { toast } from 'sonner'
import { DropZone } from './DropZone'
import { LogoPreview } from './LogoPreview'
import { Spinner } from '@nextui-org/react'

// Available tags for logos
const AVAILABLE_TAGS = [
  'Geometric', 'Minimal', 'Bold', 'Modern',
  'Classic', 'Playful', 'Corporate', 'Creative',
  'Abstract', 'Typography'
] as const

interface ImageFile extends File {
  id: string
}

interface FormData {
  title: string
  placeholder: ImageFile | null
  galleryImages: ImageFile[]
  tags: string[]
}

interface ImagePreview {
  file: File
  preview: string
  id: string // Unique ID for key prop
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  return response.json()
}

export function LogoUploadForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    placeholder: null,
    galleryImages: [],
    tags: []
  })
  const [previews, setPreviews] = useState<{
    placeholder: ImagePreview | null
    gallery: ImagePreview[]
  }>({
    placeholder: null,
    gallery: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const validateImage = useMemo(() => (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please use JPEG, PNG or WebP')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB')
      return false
    }
    return true
  }, [])

  const createPreview = useCallback((file: File): ImagePreview => {
    const imageFile = Object.assign(file, { id: crypto.randomUUID() }) as ImageFile
    return {
      file: imageFile,
      preview: URL.createObjectURL(file),
      id: imageFile.id
    }
  }, [])

  const handlePlaceholderDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (file && validateImage(file)) {
      const imageFile = Object.assign(file, { id: crypto.randomUUID() }) as ImageFile
      setFormData(prev => ({ ...prev, placeholder: imageFile }))
      setPreviews(prev => ({
        ...prev,
        placeholder: createPreview(file)
      }))
    }
  }, [validateImage, createPreview])

  const handleGalleryDrop = useCallback((files: File[]) => {
    const validFiles = files.filter(validateImage)
    
    if (validFiles.length < 4) {
      toast.error('Please select at least 4 images')
      return
    }
    
    if (validFiles.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    const imageFiles = validFiles.map(file => 
      Object.assign(file, { id: crypto.randomUUID() })
    ) as ImageFile[]

    setFormData(prev => ({ ...prev, galleryImages: imageFiles }))
    setPreviews(prev => ({
      ...prev,
      gallery: imageFiles.map(createPreview)
    }))
  }, [validateImage, createPreview])

  const handleRemoveImage = useCallback((id: string) => {
    setPreviews(prev => ({
      placeholder: prev.placeholder?.id === id ? null : prev.placeholder,
      gallery: prev.gallery.filter(img => img.id !== id)
    }))
    setFormData(prev => ({
      ...prev,
      placeholder: prev.placeholder?.id === id ? null : prev.placeholder,
      galleryImages: prev.galleryImages.filter((_, i) => 
        prev.galleryImages[i].id !== id
      )
    }))
  }, [])

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.placeholder) {
        toast.error("Please upload a placeholder image")
        return
      }

      // Upload placeholder
      const placeholderResult = await uploadFile(formData.placeholder)
      
      // Upload gallery images
      const galleryResults = await Promise.all(
        formData.galleryImages.map(file => uploadFile(file))
      )

      // Save to database
      const response = await fetch("/api/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          placeholder: placeholderResult.secure_url,
          gallery: galleryResults.map(r => r.secure_url),
          tags: formData.tags,
          status: "pending", // For admin approval
          price: {
            summon: 1000,
            revival: 5000,
            afterlife: "Starts at $10,000"
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save")
      }
      
      toast.success("Logo uploaded successfully")
      // Reset form
      setFormData({
        title: '',
        placeholder: null,
        galleryImages: [],
        tags: []
      })
      setPreviews({
        placeholder: null,
        gallery: []
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fixed useEffect and forEach
  useEffect(() => {
    return () => {
      if (previews.placeholder) {
        URL.revokeObjectURL(previews.placeholder.preview)
      }
      for (const preview of previews.gallery) {
        URL.revokeObjectURL(preview.preview)
      }
    }
  }, [previews])

  // Fixed event type
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }))
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Logo Name</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Placeholder Image</Label>
          <DropZone
            onDrop={handlePlaceholderDrop}
            multiple={false}
            className="h-32"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drop your main logo image here
              </p>
              {isUploading && <Spinner size="sm" className="mt-2" />}
            </div>
          </DropZone>
        </div>

        <div className="space-y-2">
          <Label>Gallery Images (4-10 images)</Label>
          <DropZone
            onDrop={handleGalleryDrop}
            multiple={true}
            className="h-32"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drop your gallery images here
              </p>
              {isUploading && <Spinner size="sm" className="mt-2" />}
            </div>
          </DropZone>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {AVAILABLE_TAGS.map(tag => (
              <Button
                key={tag}
                type="button"
                variant={formData.tags.includes(tag) ? "default" : "ghost"}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          variant="default"
          disabled={isSubmitting || !formData.placeholder || formData.galleryImages.length < 4}
        >
          {isSubmitting ? 'Uploading...' : 'Upload Logo'}
        </Button>
      </form>

      <LogoPreview
        placeholder={previews.placeholder}
        gallery={previews.gallery}
        onRemove={handleRemoveImage}
        isLoading={isUploading}
      />
    </div>
  )
} 