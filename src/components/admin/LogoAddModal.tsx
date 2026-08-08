'use client'

import { useState, useCallback, useRef, useEffect } from "react"
import { Modal, ModalContent, Button, Input, Textarea, CircularProgress } from "@nextui-org/react"
import { X, Upload, ChevronLeft, ChevronRight, Maximize2, XCircle, Plus, Eye, Trash, FileIcon } from "lucide-react"
import { clsx } from "clsx"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

// Types
type LogoStatus = 'DRAFT' | 'AVAILABLE' | 'HIDDEN'

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
  'Pixel'
]

const cn = (...classes: (string | undefined)[]) => clsx(classes)

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

const FilePreview = ({ preview, loading, error, onRemove, onPreview, file, className }: FilePreviewProps) => {
  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        <CircularProgress aria-label="Loading..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4 text-center", className)}>
        <XCircle className="text-red-500 mb-2" size={24} />
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn("relative group", className)}>
      <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        {onPreview && (
          <Button
            isIconOnly
            variant="light"
            onPress={onPreview}
            className="bg-white/10 backdrop-blur-sm"
          >
            <Eye className="text-white" size={20} />
          </Button>
        )}
        {onRemove && (
          <Button
            isIconOnly
            variant="light"
            onPress={onRemove}
            className="bg-white/10 backdrop-blur-sm"
          >
            <Trash className="text-white" size={20} />
          </Button>
        )}
      </div>
    </div>
  )
}

export const LogoAddModal = ({ isOpen, onClose }: LogoAddModalProps) => {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<LogoStatus>('DRAFT')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<FilePreviewData | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<FilePreviewData[]>([])
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const MAX_GALLERY_IMAGES = 6;
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  // Track changes
  useEffect(() => {
    const hasTitle = title.trim() !== ''
    const hasMainImage = mainImagePreview !== null
    const hasAnyContent = hasTitle || hasMainImage || description.trim() !== '' || 
                         selectedTags.length > 0 || galleryPreviews.length > 0
    
    setHasChanges(hasAnyContent)
  }, [title, description, selectedTags, mainImagePreview, galleryPreviews])

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
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File ${file.name} is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`
      };
    }

    // Type validation
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return {
        isValid: false,
        error: `Invalid file type for ${file.name}. Please upload JPG, PNG, WEBP or GIF files.`
      };
    }

    return { isValid: true };
  };

  const handleMainImageDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setMainImagePreview(null)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }
      toast.success("Image deleted successfully")
    }
  }

  const handleGalleryImageDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    const preview = galleryPreviews.find(p => p.id === id)
    
    if (preview?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview.preview)
    }
    
    setGalleryPreviews(prev => prev.filter(p => p.id !== id))
    toast.success("Gallery image deleted successfully")
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
        setGalleryPreviews(prev => {
          // Double-check we don't exceed limit
          if (prev.length >= MAX_GALLERY_IMAGES) {
            toast.error(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`)
            return prev
          }
          return [...prev, {
            id: uuidv4(),
            file,
            preview,
            loading: false
          }]
        })
      } catch (error) {
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
        loading: false
      })
      toast.success("Main image uploaded successfully")
    } catch (error) {
      console.error('Main image upload error:', error)
      toast.error("Error previewing file")
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
    setCurrentGalleryIndex(prev => {
      const newIndex = prev === 0 ? visiblePreviews.length - 1 : prev - 1
      setPreviewOpen(visiblePreviews[newIndex].preview)
      return newIndex
    })
  }

  const handleNextImage = () => {
    const visiblePreviews = galleryPreviews
    setCurrentGalleryIndex(prev => {
      const newIndex = prev === visiblePreviews.length - 1 ? 0 : prev + 1
      setPreviewOpen(visiblePreviews[newIndex].preview)
      return newIndex
    })
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
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
      
      // Add main image
      if (mainImagePreview?.file) {
        formData.append('mainImage', mainImagePreview.file)
        // Generate a cloudinary name from the title and a timestamp
        const timestamp = new Date().getTime()
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
        galleryCount: galleryPreviews.length
      })

      const response = await fetch('/api/admin/logos/create', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      console.log('📥 Server response:', data)
      
      if (!response.ok) {
        console.error('❌ Logo creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error
        })
        
        // Handle validation errors
        if (Array.isArray(data.errors) || Array.isArray(data)) {
          const errors = Array.isArray(data) ? data : data.errors
          const newErrors: Record<string, string> = {}
          const errorMessages: string[] = []
          
          for (const error of errors) {
            if (error.path) {
              const field = Array.isArray(error.path) ? error.path[error.path.length - 1] : error.path
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="full"
      hideCloseButton
      classNames={{
        base: "bg-black/95 backdrop-blur-xl h-[100dvh] m-0 fixed inset-0 z-[100]",
        wrapper: "p-0 h-[100dvh] m-0",
        backdrop: "opacity-100",
        body: "p-0 h-full"
      }}
    >
      <ModalContent>
        <div className="relative h-[100dvh] overflow-y-auto">
          <Button
            isIconOnly
            className="fixed right-4 top-4 z-[101] bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
            size="sm"
            onPress={handleClose}
          >
            <X size={18} />
          </Button>

          <div className="container mx-auto px-4 py-24">
            <div className="space-y-4 text-center mb-16">
              <span className="font-mono text-sm tracking-wider opacity-50 uppercase block">
                Add Logo
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Create new logo
              </h2>
              <p className="text-sm text-white/60 max-w-xl mx-auto">
                Add a new logo to the Afterlife collection.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
              <Input
                type="text"
                label="Title"
                placeholder="Enter logo title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                isRequired
                errorMessage={errors.title}
                isInvalid={!!errors.title}
                classNames={{
                  label: "text-white/60 text-sm",
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-black/20",
                    "backdrop-blur-sm",
                    "border border-white/10",
                    "hover:border-white/20",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />

              <Textarea
                label="Description"
                placeholder="Enter logo description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                classNames={{
                  label: "text-white/60 text-sm",
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-black/20",
                    "backdrop-blur-sm",
                    "border border-white/10",
                    "hover:border-white/20",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />

              <div>
                <span id="status-label" className="block text-sm font-medium text-white/60 mb-2">
                  Status
                </span>
                <div className="flex flex-wrap gap-2" aria-labelledby="status-label" role="radiogroup">
                  {(['DRAFT', 'AVAILABLE', 'HIDDEN'] as LogoStatus[]).map((statusOption) => (
                    <Button
                      key={statusOption}
                      size="sm"
                      className={`
                        rounded-full px-4 h-10 text-sm transition-all
                        ${status === statusOption
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white'
                        }
                      `}
                      onPress={() => handleStatusChange(statusOption)}
                      role="radio"
                      aria-checked={status === statusOption}
                    >
                      {statusOption}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <span id="tags-label" className="block text-sm font-medium text-white/60 mb-2">
                  Tags
                </span>
                <div className="flex flex-wrap gap-2" aria-labelledby="tags-label" role="group">
                  {AVAILABLE_TAGS.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      className={`
                        rounded-full px-4 h-10 text-sm transition-all
                        ${selectedTags.includes(tag)
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white'
                        }
                      `}
                      onPress={() => handleTagToggle(tag)}
                      aria-pressed={selectedTags.includes(tag)}
                      role="checkbox"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="main-image-upload" className="block text-sm font-medium text-white/60 mb-2">
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
                    "relative transition-all duration-300 rounded-xl",
                    errors.mainImage ? "ring-2 ring-red-500/50" : ""
                  )}
                  onClick={() => mainImageInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && mainImageInputRef.current?.click()}
                  aria-label="Upload main image"
                >
                  <div className="relative w-full p-8 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20">
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
                      <div className="text-center">
                        <Upload className="mx-auto text-white/60" size={24} />
                        <p className="text-white/60">
                          Drop your main image or click to browse
                        </p>
                        <p className="text-xs text-white/40 mt-1">Supported formats: JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </div>
                </div>
                {errors.mainImage && (
                  <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="gallery-upload" className="block text-sm font-medium text-white/60">
                    Gallery Images
                  </label>
                  <span className="text-xs text-white/40">
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
                  className="group relative transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div 
                    className="relative w-full p-8 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors text-center"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && galleryInputRef.current?.click()}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    {galleryPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {galleryPreviews.map((preview, index) => (
                          <div 
                            key={preview.id} 
                            className="relative aspect-square bg-black/20 rounded-lg overflow-hidden group"
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img
                                src={preview.preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                style={{
                                  objectPosition: 'center',
                                  minWidth: '100%',
                                  minHeight: '100%'
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                isIconOnly
                                variant="light"
                                onPress={() => handlePreviewImage(preview.preview, index)}
                                className="bg-white/10 backdrop-blur-sm"
                              >
                                <Eye className="text-white" size={20} />
                              </Button>
                              <Button
                                isIconOnly
                                variant="light"
                                onPress={() => handleGalleryImageDelete(preview.id)}
                                className="bg-white/10 backdrop-blur-sm"
                              >
                                <Trash className="text-white" size={20} />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {galleryPreviews.length < MAX_GALLERY_IMAGES && (
                          <Button
                            className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex items-center justify-center bg-transparent"
                            onPress={() => galleryInputRef.current?.click()}
                          >
                            <Plus size={24} className="text-white/60" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-white/60" size={24} />
                        <div>
                          <p className="text-white/60">Drop up to 6 gallery images or click to browse</p>
                          <p className="text-xs text-white/40 mt-1">Supported formats: JPG, PNG, WEBP</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 h-12 text-sm font-medium"
                isLoading={loading}
              >
                Create Logo
              </Button>
            </form>
          </div>
        </div>
      </ModalContent>

      {/* Image Preview Modal */}
      <Modal 
        isOpen={!!previewOpen} 
        onClose={() => setPreviewOpen(null)}
        size="2xl"
        hideCloseButton
        classNames={{
          base: "bg-black/95 backdrop-blur-xl",
          wrapper: "p-4"
        }}
      >
        <ModalContent>
          <div className="relative">
            <Button
              isIconOnly
              className="absolute right-4 top-4 z-10 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
              size="sm"
              onPress={() => setPreviewOpen(null)}
            >
              <X size={18} />
            </Button>

            {galleryPreviews.length > 1 && (
              <>
                <Button
                  isIconOnly
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
                  size="sm"
                  onPress={handlePreviousImage}
                >
                  <ChevronLeft size={18} />
                </Button>

                <Button
                  isIconOnly
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
                  size="sm"
                  onPress={handleNextImage}
                >
                  <ChevronRight size={18} />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                  {currentGalleryIndex + 1} / {galleryPreviews.length}
                </div>
              </>
            )}

            {previewOpen && (
              <img 
                src={previewOpen} 
                alt="Preview" 
                className="w-full object-contain"
              />
            )}
          </div>
        </ModalContent>
      </Modal>
    </Modal>
  )
}
