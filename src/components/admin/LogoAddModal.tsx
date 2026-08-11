'use client'

import { Field } from '@base-ui/react/field'
import { ChevronLeft, ChevronRight, Eye, Plus, Trash, Upload, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import {
  DesignerField,
  type DesignerFieldValue,
  designerFieldToFormData,
  isDesignerFieldValid,
} from '@/components/admin/DesignerField'
import { LogoStatusDropdown } from '@/components/admin/LogoStatusDropdown'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { fontWeights } from '@/lib/font-weight'
import { CREATE_STATUSES } from '@/lib/logo-status'
import { useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'
import type { LogoStatus } from '@/types'

interface LogoAddModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FilePreviewData {
  id: string
  file: File
  preview: string
  loading?: boolean
  error?: string
}

const AVAILABLE_TAGS = [
  'Minimal',
  'Bold',
  'Playful',
  'Abstract',
  'Geometric',
  'Organic',
  'Modern',
  'Monogram',
  'Futuristic',
  'Delicate',
  'Mascot',
  'Counterform',
  'Pixel',
]

const createFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to create preview'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))

    reader.readAsDataURL(file)
  })
}

interface FilePreviewProps {
  preview: string
  loading?: boolean
  error?: string
  onRemove?: () => void
  onPreview?: () => void
  className?: string
  file: File
}

const FilePreview = ({
  preview,
  loading,
  error,
  onRemove,
  onPreview,
  file: _file,
  className,
}: FilePreviewProps) => {
  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4', className)}>
        <Spinner label="Loading preview" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4 text-center', className)}>
        <XCircle className="mb-2 h-6 w-6 text-destructive" />
        <p className="text-caption text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('group relative', className)}>
      <img src={preview} alt="Preview" className="h-auto max-w-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/40 opacity-0 transition-opacity duration-80 group-hover:opacity-100">
        {onPreview && (
          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Preview image"
            onClick={(event) => {
              event.stopPropagation()
              onPreview()
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onRemove && (
          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Remove image"
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

/** Matches InputField chrome so multi-line fields sit in the same family. */
function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 4,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  rows?: number
}) {
  const shape = useShape()
  const [isFocused, setIsFocused] = useState(false)

  let bgClass: string
  let ringClass: string

  if (error) {
    bgClass = isFocused ? 'bg-card' : 'bg-destructive-light/60'
    ringClass = isFocused ? 'ring-destructive/50' : 'ring-transparent'
  } else if (isFocused) {
    bgClass = 'bg-card'
    ringClass = 'ring-border'
  } else {
    bgClass = 'bg-card'
    ringClass = 'ring-border'
  }

  return (
    <Field.Root invalid={!!error} className="flex flex-col gap-1">
      <Field.Label htmlFor={id} className="sr-only">
        {label}
      </Field.Label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder ?? label}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          'w-full px-3 py-2 text-[13px] text-foreground',
          'placeholder:text-muted-foreground outline-none font-[inherit]',
          'ring-1 transition-all duration-80 resize-y min-h-[96px]',
          shape.input,
          bgClass,
          ringClass,
        )}
        style={{ fontVariationSettings: fontWeights.normal }}
      />
      {error && (
        <Field.Error
          match
          className="pl-3 text-[12px] text-destructive"
          style={{ fontVariationSettings: fontWeights.medium }}
        >
          {error}
        </Field.Error>
      )}
    </Field.Root>
  )
}

export const LogoAddModal = ({ isOpen, onClose }: LogoAddModalProps) => {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<LogoStatus>('DRAFT')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [designer, setDesigner] = useState<DesignerFieldValue>({ mode: 'none' })
  const [mainImagePreview, setMainImagePreview] = useState<FilePreviewData | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<FilePreviewData[]>([])
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
  const MAX_GALLERY_IMAGES = 6
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

  // Track changes
  useEffect(() => {
    const hasTitle = title.trim() !== ''
    const hasMainImage = mainImagePreview !== null
    const hasAnyContent =
      hasTitle ||
      hasMainImage ||
      description.trim() !== '' ||
      selectedTags.length > 0 ||
      designer.mode !== 'none' ||
      galleryPreviews.length > 0

    setHasChanges(hasAnyContent)
  }, [title, description, selectedTags, designer, mainImagePreview, galleryPreviews])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up blob URLs
      for (const preview of galleryPreviews) {
        if (preview?.preview?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(preview.preview)
          } catch (err) {
            console.error('Failed to revoke URL:', err)
          }
        }
      }

      // Clean up main image preview
      if (mainImagePreview?.preview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(mainImagePreview.preview)
        } catch (err) {
          console.error('Failed to revoke URL:', err)
        }
      }

      // Clean up preview URL
      if (previewOpen?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(previewOpen)
        } catch (err) {
          console.error('Failed to revoke URL:', err)
        }
      }
    }
  }, [galleryPreviews, mainImagePreview, previewOpen])

  // Handle keyboard navigation in preview mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePreviousImage()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNextImage()
          break
        case 'Escape':
          e.preventDefault()
          setPreviewOpen(null)
          break
      }
    }

    if (previewOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [previewOpen])

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File ${file.name} is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
      }
    }

    // Type validation
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return {
        isValid: false,
        error: `Invalid file type for ${file.name}. Please upload JPG, PNG, WEBP or GIF files.`,
      }
    }

    return { isValid: true }
  }

  const handleMainImageDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setMainImagePreview(null)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }
      toast.success('Image deleted successfully')
    }
  }

  const handleGalleryImageDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    const preview = galleryPreviews.find((p) => p.id === id)

    if (preview?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview.preview)
    }

    setGalleryPreviews((prev) => prev.filter((p) => p.id !== id))
    toast.success('Gallery image deleted successfully')
  }

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return

    // Check total number of files
    if (galleryPreviews.length + files.length > MAX_GALLERY_IMAGES) {
      toast.error(`You can only upload up to ${MAX_GALLERY_IMAGES} gallery images`)
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '' // Reset input
      }
      return
    }

    // Process files with both size and count limits
    const newFiles = Array.from(files)

    for (const file of newFiles) {
      const validation = validateFile(file)
      if (!validation.isValid) {
        toast.error(validation.error)
        continue
      }

      try {
        const preview = await createFilePreview(file)
        setGalleryPreviews((prev) => {
          // Double-check we don't exceed limit
          if (prev.length >= MAX_GALLERY_IMAGES) {
            toast.error(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`)
            return prev
          }
          return [
            ...prev,
            {
              id: uuidv4(),
              file,
              preview,
              loading: false,
            },
          ]
        })
      } catch (_error) {
        toast.error(`Error previewing ${file.name}`)
      }
    }

    // Reset input after processing
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''
    }
  }

  const handleMainImageUpload = async (files: FileList | null) => {
    if (!files?.length) return

    const file = files[0]

    const validation = validateFile(file)
    if (!validation.isValid) {
      toast.error(validation.error)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = '' // Reset input
      }
      return
    }

    setLoading(true)
    try {
      const preview = await createFilePreview(file)
      setMainImagePreview({
        id: uuidv4(),
        file,
        preview,
        loading: false,
      })
      toast.success('Main image uploaded successfully')
    } catch (error) {
      console.error('Main image upload error:', error)
      toast.error('Error previewing file')
    } finally {
      setLoading(false)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = '' // Reset input
      }
    }
  }

  const handlePreviewImage = (preview: string, index: number) => {
    setCurrentGalleryIndex(index)
    setPreviewOpen(preview)
  }

  const handlePreviousImage = () => {
    const visiblePreviews = galleryPreviews
    setCurrentGalleryIndex((prev) => {
      const newIndex = prev === 0 ? visiblePreviews.length - 1 : prev - 1
      setPreviewOpen(visiblePreviews[newIndex].preview)
      return newIndex
    })
  }

  const handleNextImage = () => {
    const visiblePreviews = galleryPreviews
    setCurrentGalleryIndex((prev) => {
      const newIndex = prev === visiblePreviews.length - 1 ? 0 : prev + 1
      setPreviewOpen(visiblePreviews[newIndex].preview)
      return newIndex
    })
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      }
      return [...prev, tag]
    })
  }

  const handleStatusChange = (newStatus: LogoStatus) => {
    setStatus(newStatus)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('status', status)
      formData.append('tags', JSON.stringify(selectedTags))
      designerFieldToFormData(designer, formData)

      // Add main image
      if (mainImagePreview?.file) {
        formData.append('mainImage', mainImagePreview.file)
        // Generate a cloudinary name from the title and a timestamp
        const timestamp = Date.now()
        const cloudinaryName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`
        formData.append('cloudinaryName', cloudinaryName)
      }

      // Add gallery images - using for...of instead of forEach
      for (const preview of galleryPreviews) {
        formData.append('galleryImages', preview.file)
      }

      // Log the request
      console.log('📤 Sending logo creation request:', {
        title,
        description,
        status,
        tags: selectedTags,
        hasMainImage: !!mainImagePreview?.file,
        galleryCount: galleryPreviews.length,
      })

      const response = await fetch('/api/admin/logos/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('📥 Server response:', data)

      if (!response.ok) {
        console.error('❌ Logo creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error,
        })

        // Handle validation errors
        if (Array.isArray(data.errors) || Array.isArray(data)) {
          const errors = Array.isArray(data) ? data : data.errors
          const newErrors: Record<string, string> = {}
          const errorMessages: string[] = []

          for (const error of errors) {
            if (error.path) {
              const field = Array.isArray(error.path)
                ? error.path[error.path.length - 1]
                : error.path
              // Skip cloudinaryName errors as we handle it automatically
              if (field === 'cloudinaryName') continue

              newErrors[field] = error.message
              errorMessages.push(`${field}: ${error.message}`)
            }
          }

          setErrors(newErrors)

          if (errorMessages.length > 0) {
            throw new Error(`Please fix the following:\n${errorMessages.join('\n')}`)
          }
        }

        // Handle server errors
        if (data.error?.includes?.('Cloudinary')) {
          throw new Error('Unable to process images. Please try again or contact support.')
        }

        // Handle other errors
        let errorMessage = 'Failed to create logo'
        if (typeof data.error === 'string') {
          errorMessage = data.error
        } else if (data.error && typeof data.error === 'object') {
          console.error('Detailed error:', data.error)
          errorMessage = data.error.message || JSON.stringify(data.error)
        } else if (data.message) {
          errorMessage = data.message
        }

        throw new Error(errorMessage)
      }

      console.log('✅ Logo created successfully:', data)

      toast.success('Logo created successfully')
      router.refresh()
      onClose()
    } catch (error) {
      console.error('❌ Submission error:', error)

      if (error instanceof Error) {
        toast.error(error.message)
      } else if (error && typeof error === 'object') {
        toast.error(JSON.stringify(error))
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!mainImagePreview) {
      newErrors.mainImage = 'Main image is required'
    }

    if (!isDesignerFieldValid(designer)) {
      newErrors.designer = 'Designer name and a valid email are required'
      toast.error('Designer name and a valid email are required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose()
        }}
      >
        <DialogContent hideClose placement="fullscreen">
          <DialogTitle className="sr-only">Add logo</DialogTitle>

          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Close"
            onClick={handleClose}
            className="fixed right-4 top-4 z-[101]"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="container mx-auto px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-xl">
              <div className="mb-10 space-y-3 sm:mb-14">
                <span className="block font-mono text-metadata uppercase text-foreground-subtle">
                  Add logo
                </span>
                <h2 className="text-heading-24 text-foreground">Create new logo</h2>
                <p className="text-caption text-foreground-muted">
                  Add a new logo to the Afterlife collection.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <InputGroup className="w-full">
                  <InputField
                    index={0}
                    label="Title"
                    hideLabel
                    placeholder="Enter logo title"
                    value={title}
                    onChange={setTitle}
                    error={errors.title}
                    required
                  />
                </InputGroup>

                <FormTextarea
                  id="add-logo-description"
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter logo description"
                />

                <div className="flex items-center justify-between gap-3">
                  <span id="status-label" className="shrink-0 text-caption text-foreground-muted">
                    Status
                  </span>
                  <LogoStatusDropdown
                    value={status}
                    options={CREATE_STATUSES}
                    onChange={handleStatusChange}
                    aria-labelledby="status-label"
                  />
                </div>

                <DesignerField value={designer} onChange={setDesigner} />
                {errors.designer ? (
                  <p className="text-caption text-destructive">{errors.designer}</p>
                ) : null}

                <div>
                  <span id="tags-label" className="mb-2 block text-caption text-foreground-muted">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2" aria-labelledby="tags-label" role="group">
                    {AVAILABLE_TAGS.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        size="sm"
                        variant={selectedTags.includes(tag) ? 'primary' : 'tertiary'}
                        onClick={() => handleTagToggle(tag)}
                        aria-pressed={selectedTags.includes(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="main-image-upload"
                    className="block text-caption text-foreground-muted"
                  >
                    Main Image
                  </label>
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImageUpload(e.target.files)}
                    className="hidden"
                    id="main-image-upload"
                  />

                  <div
                    className={cn(
                      'relative w-full rounded-xl border border-border bg-card p-8 text-center transition-colors duration-80 hover:border-border-strong',
                      errors.mainImage && 'border-destructive/50',
                    )}
                    onClick={() => mainImageInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        mainImageInputRef.current?.click()
                      }
                    }}
                    aria-label="Upload main image"
                  >
                    {mainImagePreview ? (
                      <FilePreview
                        preview={mainImagePreview.preview}
                        loading={mainImagePreview.loading}
                        error={mainImagePreview.error}
                        onRemove={handleMainImageDelete}
                        onPreview={() => handlePreviewImage(mainImagePreview.preview, 0)}
                        file={mainImagePreview.file}
                      />
                    ) : (
                      <div className="space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-foreground-muted" />
                        <p className="text-caption text-foreground-muted">
                          Drop your main image or click to browse
                        </p>
                        <p className="text-metadata text-foreground-subtle">
                          Supported formats: JPG, PNG, WEBP
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.mainImage && (
                    <p className="text-caption text-destructive">{errors.mainImage}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="gallery-upload"
                      className="block text-caption text-foreground-muted"
                    >
                      Gallery Images
                    </label>
                    <span className="text-metadata text-foreground-subtle">
                      {galleryPreviews.length} / {MAX_GALLERY_IMAGES} images
                    </span>
                  </div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleGalleryUpload(e.target.files)}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <div
                    className="relative w-full rounded-xl border border-border bg-card p-8 text-center transition-colors duration-80 hover:border-border-strong"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && galleryPreviews.length === 0) {
                        e.preventDefault()
                        galleryInputRef.current?.click()
                      }
                    }}
                    onClick={() => {
                      if (galleryPreviews.length === 0) galleryInputRef.current?.click()
                    }}
                    aria-label="Upload gallery images"
                  >
                    {galleryPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {galleryPreviews.map((preview, index) => (
                          <div
                            key={preview.id}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card"
                          >
                            <img
                              src={preview.preview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/40 opacity-0 transition-opacity duration-80 group-hover:opacity-100">
                              <Button
                                type="button"
                                variant="tertiary"
                                size="icon"
                                aria-label="Preview gallery image"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handlePreviewImage(preview.preview, index)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="tertiary"
                                size="icon"
                                aria-label="Remove gallery image"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleGalleryImageDelete(preview.id)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {galleryPreviews.length < MAX_GALLERY_IMAGES && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              galleryInputRef.current?.click()
                            }}
                            className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-foreground-muted transition-colors duration-80 hover:border-border-strong hover:text-foreground"
                            aria-label="Add another gallery image"
                          >
                            <Plus className="h-6 w-6" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-foreground-muted" />
                        <p className="text-caption text-foreground-muted">
                          Drop up to 6 gallery images or click to browse
                        </p>
                        <p className="text-metadata text-foreground-subtle">
                          Supported formats: JPG, PNG, WEBP
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Create Logo
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewOpen} onOpenChange={(open) => !open && setPreviewOpen(null)}>
        <DialogContent
          hideClose
          className="max-w-3xl border border-border bg-background p-0 shadow-none"
        >
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <div className="relative">
            <Button
              type="button"
              variant="tertiary"
              size="icon"
              aria-label="Close preview"
              onClick={() => setPreviewOpen(null)}
              className="absolute right-3 top-3 z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            {galleryPreviews.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="tertiary"
                  size="icon"
                  aria-label="Previous image"
                  onClick={handlePreviousImage}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  size="icon"
                  aria-label="Next image"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-caption tabular-nums text-foreground-muted">
                  {currentGalleryIndex + 1} / {galleryPreviews.length}
                </p>
              </>
            )}

            {previewOpen && (
              <img src={previewOpen} alt="Preview" className="w-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
