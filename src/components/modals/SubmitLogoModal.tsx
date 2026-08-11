'use client'

import { Field } from '@base-ui/react/field'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileIcon,
  Plus,
  Trash,
  Upload,
  X,
  XCircle,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { fontWeights } from '@/lib/font-weight'
import { nestedOuterRadius, useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'
import { SuccessScreen } from './SuccessScreen'

interface SubmitLogoModalProps {
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

interface FileUploadProgress {
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  fileName: string
  fileSize: number
}

interface DragState {
  logo: boolean
  mockup: boolean
}

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

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file)
    } else {
      // For vector files, we'll use the filename as preview
      resolve(file.name)
    }
  })
}

interface FilePreviewProps {
  preview: string
  loading?: boolean
  error?: string
  onRemove?: () => void
  className?: string
  file: File
}

const FilePreview = ({ preview, loading, error, onRemove, className }: FilePreviewProps) => {
  const shape = useShape()

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

  // Check if preview is a data URL (image) or filename (vector)
  const isImage = preview.startsWith('data:image')

  return (
    <div className={cn('group relative', className)}>
      {isImage ? (
        // Preview is a local object URL / data URL — next/image is not applicable here.
        // biome-ignore lint/performance/noImgElement: local file preview
        <img src={preview} alt="Preview" className={cn('h-auto max-w-full', shape.bg)} />
      ) : (
        <div className={cn('border border-border bg-card p-4 text-center', shape.bg)}>
          <FileIcon className="mx-auto mb-2 h-6 w-6 text-foreground-muted" />
          <p className="truncate text-caption text-foreground-muted">{preview}</p>
        </div>
      )}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center gap-2 bg-background/40 opacity-0 transition-opacity duration-quick ease-settle group-hover:opacity-100',
          shape.bg,
        )}
      >
        {onRemove && (
          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Remove logo"
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

/**
 * Drop zones that enclose rounded children follow nested radii:
 * outer = inner + padding. Empty (no nested tiles) uses container radius + roomy pad.
 */
const DROP_NEST_PAD = 8 // px → p-2; pairs with shape.bg (8px rounded / 20px pill)

function dropZoneChrome({
  active,
  invalid,
  nested,
  containerClass,
  bgRadius,
}: {
  active: boolean
  invalid?: boolean
  nested: boolean
  containerClass: string
  bgRadius: number
}) {
  return {
    className: cn(
      'relative w-full border bg-card text-center',
      'transition-colors duration-quick ease-settle',
      nested ? 'p-2' : 'p-8',
      !nested && containerClass,
      active ? 'border-foreground/40' : 'border-border hover:border-foreground/20',
      invalid && 'border-destructive/50',
    ),
    style: nested ? { borderRadius: nestedOuterRadius(bgRadius, DROP_NEST_PAD) } : undefined,
  }
}

/** Matches InputField chrome so multi-line fields sit in the same family. Placeholder is the hint. */
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

export const SubmitLogoModal = ({ isOpen, onClose }: SubmitLogoModalProps) => {
  const shape = useShape()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [designerName, setDesignerName] = useState('')
  const [twitter, setTwitter] = useState('')
  const [description, setDescription] = useState('')
  const [logoTitle, setLogoTitle] = useState('')
  const [logoPreview, setLogoPreview] = useState<FilePreviewData | null>(null)
  const [mockupPreviews, setMockupPreviews] = useState<FilePreviewData[]>([])
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    logo: false,
    mockup: false,
  })
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const mockupInputRef = useRef<HTMLInputElement>(null)

  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
  const MAX_MOCKUPS = 6
  const LOGO_EXTENSIONS = ['.ai', '.eps', '.svg', '.pdf']
  const MOCKUP_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

  interface FileValidationResult {
    isValid: boolean
    error?: string
    details?: {
      size: number
      type: string
      name: string
    }
  }

  const validateFile = (file: File, type: 'logo' | 'mockup'): FileValidationResult => {
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const validExtensions = type === 'logo' ? LOGO_EXTENSIONS : MOCKUP_EXTENSIONS

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File ${file.name} is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
        details: {
          size: file.size,
          type: fileExt,
          name: file.name,
        },
      }
    }

    // Type validation
    if (!validExtensions.includes(fileExt)) {
      return {
        isValid: false,
        error: `Invalid file type for ${file.name}. ${
          type === 'logo'
            ? 'Please upload AI, EPS, SVG or PDF files for logos'
            : 'Please upload JPG, PNG, WEBP or GIF files for mockups'
        }`,
        details: {
          size: file.size,
          type: fileExt,
          name: file.name,
        },
      }
    }

    return {
      isValid: true,
      details: {
        size: file.size,
        type: fileExt,
        name: file.name,
      },
    }
  }

  const handleDelete = (type: 'logo' | 'mockup', id?: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    if (type === 'logo') {
      setLogoPreview(null)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
      toast.success('Logo deleted successfully')
    } else if (type === 'mockup' && id) {
      setMockupPreviews((prev) => prev.filter((p) => p.id !== id))
      if (mockupInputRef.current) {
        mockupInputRef.current.value = ''
      }
      toast.success('Mockup deleted successfully')
    }
  }

  const handleMockupsUpload = async (files: FileList | null) => {
    if (!files?.length) return

    // Check total number of files
    if (mockupPreviews.length + files.length > MAX_MOCKUPS) {
      toast.error(`You can only upload up to ${MAX_MOCKUPS} mockup images`)
      if (mockupInputRef.current) {
        mockupInputRef.current.value = '' // Reset input
      }
      return
    }

    // Process files with both size and count limits
    const newFiles = Array.from(files)

    for (const file of newFiles) {
      // Check file size first
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit`)
        continue
      }

      const validation = validateFile(file, 'mockup')
      if (!validation.isValid) {
        toast.error(validation.error)
        continue
      }

      try {
        const preview = await createFilePreview(file)
        setMockupPreviews((prev) => {
          // Double-check we don't exceed limit
          if (prev.length >= MAX_MOCKUPS) {
            toast.error(`Maximum ${MAX_MOCKUPS} mockups allowed`)
            return prev
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              file,
              preview,
              loading: false,
            },
          ]
        })
      } catch {
        toast.error(`Error previewing ${file.name}`)
      }
    }

    // Reset input after processing
    if (mockupInputRef.current) {
      mockupInputRef.current.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent, type: 'logo' | 'mockup') => {
    e.preventDefault()
    e.stopPropagation()

    setDragState((prev) => ({
      ...prev,
      [type]: e.type === 'dragenter' || e.type === 'dragover',
    }))
  }

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files?.length) return

    const file = files[0]

    const validation = validateFile(file, 'logo')
    if (!validation.isValid) {
      toast.error(validation.error)
      if (logoInputRef.current) {
        logoInputRef.current.value = '' // Reset input
      }
      return
    }

    setLoading(true)
    try {
      const preview = await createFilePreview(file)
      setLogoPreview({
        id: crypto.randomUUID(),
        file,
        preview,
        loading: false,
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000) // Reset after 2 seconds
      toast.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error('Error previewing file')
    } finally {
      setLoading(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = '' // Reset input
      }
    }
  }

  const handleDrop = async (e: React.DragEvent, type: 'logo' | 'mockup') => {
    e.preventDefault()
    e.stopPropagation()

    setDragState((prev) => ({
      ...prev,
      [type]: false,
    }))

    const files = Array.from(e.dataTransfer.files)

    if (type === 'logo') {
      if (files.length > 1) {
        toast.error('Please upload only one logo file')
        return
      }

      const validation = validateFile(files[0], 'logo')
      if (!validation.isValid) {
        toast.error(validation.error)
        return
      }

      // Pass the original FileList for logo upload
      handleLogoUpload(e.dataTransfer.files)
    } else {
      // Handle mockup files
      const validFiles = files.filter((file) => {
        const validation = validateFile(file, 'mockup')
        if (!validation.isValid) {
          toast.error(validation.error)
          return false
        }
        return true
      })

      if (validFiles.length) {
        // Create a DataTransfer object to convert array back to FileList
        const dataTransfer = new DataTransfer()
        validFiles.forEach((file) => dataTransfer.items.add(file))
        handleMockupsUpload(dataTransfer.files)
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!designerName.trim()) {
      newErrors.designerName = 'Designer name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!logoTitle.trim()) {
      newErrors.logoTitle = 'Logo name is required'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!logoPreview) {
      newErrors.logo = 'Logo file is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Early return if logoPreview is null
    if (!logoPreview) {
      toast.error('Please upload a logo')
      return
    }

    setLoading(true)
    setUploadProgress([
      {
        id: 'logo',
        progress: 0,
        status: 'uploading',
        fileName: logoPreview.file.name,
        fileSize: logoPreview.file.size,
      },
    ])

    try {
      const formData = new FormData()
      formData.append('designerName', designerName)
      formData.append('email', email)
      if (twitter) formData.append('twitter', twitter)
      formData.append('description', description)
      formData.append('logo', logoPreview.file)
      formData.append('logoTitle', logoTitle)

      mockupPreviews.forEach((preview) => {
        formData.append('mockup', preview.file)
      })

      setUploadProgress((prev) => prev.map((p) => ({ ...p, progress: 30 })))

      const response = await fetch('/api/submit-logo', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress((prev) => prev.map((p) => ({ ...p, progress: 60 })))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit logo')
      }

      setUploadProgress((prev) => prev.map((p) => ({ ...p, progress: 100, status: 'completed' })))
      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      setUploadProgress((prev) =>
        prev.map((p) => ({
          ...p,
          progress: 100,
          status: 'error',
        })),
      )
      toast.error(error instanceof Error ? error.message : 'Failed to submit logo')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousImage = useCallback(() => {
    setCurrentMockupIndex((prev) => {
      const newIndex = prev === 0 ? mockupPreviews.length - 1 : prev - 1
      setPreviewOpen(mockupPreviews[newIndex].preview)
      return newIndex
    })
  }, [mockupPreviews])

  const handleNextImage = useCallback(() => {
    setCurrentMockupIndex((prev) => {
      const newIndex = prev === mockupPreviews.length - 1 ? 0 : prev + 1
      setPreviewOpen(mockupPreviews[newIndex].preview)
      return newIndex
    })
  }, [mockupPreviews])

  useEffect(() => {
    if (!previewOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewOpen, handlePreviousImage, handleNextImage])

  const resetForm = () => {
    setEmail('')
    setDesignerName('')
    setTwitter('')
    setDescription('')
    setLogoTitle('')
    setLogoPreview(null)
    setMockupPreviews([])
    setErrors({})
    setShowSuccess(false)
    setIsSubmitted(false)
    setUploadProgress([])
    if (logoInputRef.current) logoInputRef.current.value = ''
    if (mockupInputRef.current) mockupInputRef.current.value = ''
  }

  const handleLogoDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setLogoPreview(null)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
      toast.success('Logo deleted successfully')
    }
  }

  if (isSubmitted) {
    return (
      <SuccessScreen
        onClose={() => {
          resetForm()
          onClose()
        }}
        onSubmitAnother={() => {
          setIsSubmitted(false)
          resetForm()
        }}
      />
    )
  }

  const logoDrop = dropZoneChrome({
    active: dragState.logo || showSuccess,
    invalid: !!errors.logo,
    nested: !!logoPreview,
    containerClass: shape.container,
    bgRadius: shape.bgRadius,
  })
  const mockupDrop = dropZoneChrome({
    active: dragState.mockup,
    nested: mockupPreviews.length > 0,
    containerClass: shape.container,
    bgRadius: shape.bgRadius,
  })

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent hideClose placement="fullscreen">
          <DialogTitle className="sr-only">Submit logo</DialogTitle>

          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Close"
            onClick={onClose}
            className="fixed right-4 top-4 z-[101]"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="container mx-auto px-4 py-20 sm:py-24">
            <div className="mx-auto mb-10 max-w-xl space-y-3 text-center sm:mb-14">
              <span className="block font-mono text-metadata uppercase text-foreground-subtle">
                Submit logo
              </span>
              <h2 className="text-4xl tracking-tight text-foreground sm:text-5xl">
                Share your creation
              </h2>
              <p className="mx-auto max-w-lg text-lede text-foreground-muted text-pretty">
                Give your unused logo a second chance at life. And get paid generously for it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
              <InputGroup className="w-full">
                <InputField
                  index={0}
                  label="Designer name"
                  hideLabel
                  placeholder="Designer name"
                  value={designerName}
                  onChange={setDesignerName}
                  error={errors.designerName}
                  required
                />
                <InputField
                  index={1}
                  label="Email"
                  hideLabel
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  required
                />
                <InputField
                  index={2}
                  label="Twitter"
                  hideLabel
                  placeholder="Twitter"
                  value={twitter}
                  onChange={(value) => setTwitter(value.replace('@', ''))}
                />
                <InputField
                  index={3}
                  label="Logo name"
                  hideLabel
                  placeholder="Logo name"
                  value={logoTitle}
                  onChange={setLogoTitle}
                  error={errors.logoTitle}
                  required
                />
              </InputGroup>

              <FormTextarea
                id="submit-description"
                label="Description"
                value={description}
                onChange={setDescription}
                placeholder="Description"
                error={errors.description}
                required
              />

              <div className="space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".ai,.eps,.svg,.pdf"
                  onChange={(e) => handleLogoUpload(e.target.files)}
                  className="hidden"
                  id="logo-upload"
                />

                <div
                  className={cn(logoDrop.className, showSuccess && 'border-foreground/40')}
                  style={logoDrop.style}
                  onClick={() => logoInputRef.current?.click()}
                  onDragEnter={(e) => handleDrag(e, 'logo')}
                  onDragLeave={(e) => handleDrag(e, 'logo')}
                  onDragOver={(e) => handleDrag(e, 'logo')}
                  onDrop={(e) => handleDrop(e, 'logo')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      logoInputRef.current?.click()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload logo"
                >
                  {logoPreview ? (
                    <FilePreview
                      preview={logoPreview.preview}
                      loading={logoPreview.loading}
                      error={logoPreview.error}
                      onRemove={handleLogoDelete}
                      file={logoPreview.file}
                    />
                  ) : (
                    <div className="space-y-1">
                      <Upload className="mx-auto h-6 w-6 text-foreground-muted" />
                      <p className="text-caption text-foreground-muted">
                        {dragState.logo
                          ? 'Drop to upload logo'
                          : 'Drop your logo file or click to browse'}
                      </p>
                      <p className="text-metadata text-foreground-subtle">
                        Supported formats: AI, EPS, SVG, PDF
                      </p>
                    </div>
                  )}
                </div>
                {errors.logo && <p className="text-caption text-destructive">{errors.logo}</p>}
              </div>

              <div className="space-y-2">
                <input
                  ref={mockupInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMockupsUpload(e.target.files)}
                  className="hidden"
                  id="mockup-upload"
                />
                <div
                  className={mockupDrop.className}
                  style={mockupDrop.style}
                  onDragEnter={(e) => handleDrag(e, 'mockup')}
                  onDragLeave={(e) => handleDrag(e, 'mockup')}
                  onDragOver={(e) => handleDrag(e, 'mockup')}
                  onDrop={(e) => handleDrop(e, 'mockup')}
                  onClick={() => {
                    if (mockupPreviews.length === 0) mockupInputRef.current?.click()
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && mockupPreviews.length === 0) {
                      e.preventDefault()
                      mockupInputRef.current?.click()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload mockups"
                >
                  {mockupPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {mockupPreviews.map((preview) => (
                        <div
                          key={preview.id}
                          className={cn(
                            'group relative aspect-square overflow-hidden border border-border bg-card',
                            shape.bg,
                          )}
                        >
                          {/* biome-ignore lint/performance/noImgElement: local file preview */}
                          <img
                            src={preview.preview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/40 opacity-0 transition-opacity duration-quick ease-settle group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="tertiary"
                              size="icon"
                              aria-label="Preview mockup"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPreviewOpen(preview.preview)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="tertiary"
                              size="icon"
                              aria-label="Remove mockup"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDelete('mockup', preview.id)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {mockupPreviews.length < MAX_MOCKUPS && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            mockupInputRef.current?.click()
                          }}
                          className={cn(
                            'flex aspect-square items-center justify-center border border-dashed border-border text-foreground-muted transition-colors duration-quick ease-settle hover:border-foreground/20 hover:text-foreground',
                            shape.bg,
                          )}
                          aria-label="Add another mockup"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="mx-auto h-6 w-6 text-foreground-muted" />
                      <p className="text-caption text-foreground-muted">
                        Drop up to {MAX_MOCKUPS} mockup images or click to browse
                      </p>
                      <p className="text-metadata text-foreground-subtle">
                        Supported formats: PNG, JPG, WEBP, GIF
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {uploadProgress.length > 0 && (
                <div className="space-y-2">
                  {uploadProgress.map((progress) => (
                    <div key={progress.id} className="space-y-1">
                      <div className="flex justify-between text-caption">
                        <span className="text-foreground-muted">{progress.fileName}</span>
                        <span className="tabular-nums text-foreground-subtle">
                          {progress.status === 'completed' ? 'Completed' : `${progress.progress}%`}
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            'h-full transition-all duration-quick ease-settle',
                            progress.status === 'error'
                              ? 'bg-destructive'
                              : progress.status === 'completed'
                                ? 'bg-foreground'
                                : 'bg-foreground/60',
                          )}
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Submit logo
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewOpen} onOpenChange={(open) => !open && setPreviewOpen(null)}>
        <DialogContent
          hideClose
          className="max-w-3xl border border-border bg-background p-0 shadow-none"
        >
          <DialogTitle className="sr-only">Mockup preview</DialogTitle>
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

            {mockupPreviews.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="tertiary"
                  size="icon"
                  aria-label="Previous mockup"
                  onClick={handlePreviousImage}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  size="icon"
                  aria-label="Next mockup"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-caption tabular-nums text-foreground-muted">
                  {currentMockupIndex + 1} / {mockupPreviews.length}
                </p>
              </>
            )}

            {previewOpen && (
              // biome-ignore lint/performance/noImgElement: local file preview
              <img src={previewOpen} alt="Mockup preview" className="w-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
