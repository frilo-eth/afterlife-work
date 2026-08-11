'use client'

import { Field } from '@base-ui/react/field'
import { ChevronLeft, ChevronRight, Eye, Plus, Trash2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  DesignerField,
  type DesignerFieldValue,
  designerFieldChanged,
  designerFieldFromLogo,
  designerFieldToFormData,
  isDesignerFieldValid,
} from '@/components/admin/DesignerField'
import { LogoStatusDropdown } from '@/components/admin/LogoStatusDropdown'
import { Button } from '@/components/ui/button'
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { fontWeights } from '@/lib/font-weight'
import { isStatusLocked, MANUAL_STATUSES } from '@/lib/logo-status'
import { useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'
import type { LogoGalleryItem, LogoStatus, LogoWithDetails } from '@/types'

interface LogoEditModalProps {
  logo: LogoWithDetails
  isOpen: boolean
  onClose: () => void
}

interface FilePreviewData {
  id: string
  preview: string
  loading?: boolean
  error?: string
  // Remove direct file reference from state
  fileInfo?: {
    name: string
    size: number
    type: string
  }
}

interface MainImageState {
  preview: string | null
  // Store file info instead of the file object
  fileInfo?: {
    name: string
    size: number
    type: string
  }
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
] as const

// Title formatting utilities
const formatTitle = (input: string): string => {
  // Only remove special characters, keep spaces
  return input
    .replace(/[^\w\s-]/g, '') // Keep word chars, spaces, and hyphens
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim()
}

const generateCloudinaryName = (title: string): string => {
  // Convert "Sigma Flux" to "sigma-flux"
  return title.toLowerCase().replace(/\s+/g, '-')
}

// Add a helper function for file validation
const _validateFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
    }
  }

  // Check file type
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  return { isValid: true }
}

// Add a helper function to create file previews
const _createFilePreview = async (file: File): Promise<string> => {
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

// Add debug mode constant
const DEBUG = process.env.NODE_ENV === 'development'

// Memoize expensive computations
const generateInitialGalleryPreviews = (gallery: LogoGalleryItem[] = []) =>
  gallery.map((item) => ({
    id: item.id,
    preview: `${item.imageUrl}?t=${Date.now()}`,
  }))

// Add displayName to the component to fix ESLint error
const LogoEditModal = memo(({ logo, isOpen, onClose }: LogoEditModalProps) => {
  if (DEBUG) {
    console.log('LogoEditModal render with state:', {
      logoId: logo.id,
      isOpen,
      currentStatus: logo.status,
      hasMainImage: !!logo.thumbnail,
      galleryCount: logo.gallery?.length,
      selectedTags: logo.tags,
      description: logo.description,
    })
  }

  // Initialize state with memoized values
  const [displayTitle, setDisplayTitle] = useState('')
  const [_cloudinaryName, setCloudinaryName] = useState('')
  const [description, setDescription] = useState(logo?.description || '')
  const [status, setStatus] = useState<LogoStatus>(logo.status || 'DRAFT')
  const [selectedTags, setSelectedTags] = useState<string[]>(logo?.tags || [])
  const [designer, setDesigner] = useState<DesignerFieldValue>(() => designerFieldFromLogo(logo))
  const [isLoading, setIsLoading] = useState(false)
  const [mainImage, setMainImage] = useState<MainImageState>({ preview: null })
  const [_galleryImages, setGalleryImages] = useState<FilePreviewData[]>([])
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([])
  const [_tagChanges, setTagChanges] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)
  const [_isDeleting, setIsDeleting] = useState(false)
  const [_deleteMainImage, _setDeleteMainImage] = useState(false)
  const [previewUrl, _setPreviewUrl] = useState<string | null>(null)

  // Store file objects in refs instead of state
  const mainImageFileRef = useRef<File | null>(null)
  const galleryFilesRef = useRef<Map<string, File>>(new Map())

  // Memoize gallery previews initialization
  const initialGalleryPreviews = useMemo(
    () => generateInitialGalleryPreviews(logo.gallery),
    [logo.gallery],
  )

  // Initialize gallery previews from memoized value
  const [galleryPreviews, setGalleryPreviews] = useState<FilePreviewData[]>(initialGalleryPreviews)
  const [_currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const _router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  const MAX_GALLERY_IMAGES = 6
  const _ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  // Auto-refresh is always enabled (UI hidden)
  const [autoRefreshEnabled, _setAutoRefreshEnabled] = useState(true)

  useEffect(() => {
    if (logo) {
      setDescription(logo.description)
      setStatus(logo.status as LogoStatus)
      setSelectedTags(logo.tags)
      setDesigner(designerFieldFromLogo(logo))

      // Reset gallery previews when logo changes with distinct cache-busting timestamp
      const uniqueTimestamp = Date.now()
      console.log(`🔄 [LOGO-EDIT] Initializing with fresh cache timestamp: ${uniqueTimestamp}`)

      setGalleryPreviews(
        logo.gallery?.map((item) => ({
          id: item.id,
          preview: `${item.imageUrl}?t=${uniqueTimestamp}&r=${Math.random().toString(36).substring(7)}`,
        })) || [],
      )

      // Ensure we get fresh image content by adding robust cache-busting
      if (logo.thumbnail) {
        console.log('🖼️ [LOGO-EDIT] Setting main image from logo thumbnail with cache-busting')
        const cacheBuster = `?t=${uniqueTimestamp}&r=${Math.random().toString(36).substring(7)}`
        setMainImage({ preview: `${logo.thumbnail}${cacheBuster}` })
      } else {
        setMainImage({ preview: null })
      }

      // Reset deleted gallery IDs
      setDeletedGalleryIds([])

      // Reset file refs when logo changes
      mainImageFileRef.current = null
      galleryFilesRef.current.clear()

      // Reset loading state and error
      setIsLoading(false)
      setError(null)

      // Reset changes tracking
      setHasChanges(false)
    }
  }, [logo])

  useEffect(() => {
    if (logo?.title) {
      // Clean the title if it comes with cloudinary format
      const cleanTitle = logo.title
        .replace(/^Logo_/i, '')
        .replace(/_placeholder.*$/, '')
        .replace(/_/g, ' ')

      const formattedTitle = formatTitle(cleanTitle)
      setDisplayTitle(formattedTitle)
      setCloudinaryName(generateCloudinaryName(formattedTitle))
    }
  }, [logo?.title])

  // Reset preview when closing modal
  useEffect(() => {
    if (!isOpen) {
      setPreviewOpen(null)
      setMainImage({ preview: null })
      setIsDeleting(false)
      setDiscardOpen(false)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = ''
      }

      // Clear file refs when modal closes
      mainImageFileRef.current = null
      galleryFilesRef.current.clear()
    } else {
      // When modal opens, log the current gallery state
      const visibleCount = galleryPreviews.filter((p) => !deletedGalleryIds.includes(p.id)).length
      console.log('🔄 [LOGO-EDIT] Modal opened, gallery state:', {
        galleryPreviews: galleryPreviews.length,
        deletedGalleryIds: deletedGalleryIds.length,
        visibleCount,
        maxAllowed: MAX_GALLERY_IMAGES,
      })
    }
  }, [isOpen, galleryPreviews, deletedGalleryIds])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      console.log('Cleanup starting')

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
      if (mainImage?.preview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(mainImage.preview)
        } catch (err) {
          console.error('Failed to revoke URL:', err)
        }
      }

      // Clean up preview URL
      if (previewUrl?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(previewUrl)
        } catch (err) {
          console.error('Failed to revoke URL:', err)
        }
      }

      console.log('Cleanup complete')
    }
  }, [galleryPreviews, mainImage.preview, previewUrl])

  // Complete rewrite of the file handling approach
  const triggerFileInput = useCallback(() => {
    console.log('🔍 [LOGO-EDIT] Triggering file input with direct DOM approach')

    // Create a key identifier for this specific upload attempt
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    console.log(`🔑 [LOGO-EDIT] Generated uploadId: ${uploadId}`)

    // Create a fresh file input for each selection to avoid browser caching issues
    const tempInput = document.createElement('input')
    tempInput.type = 'file'
    tempInput.accept = 'image/*'
    tempInput.id = uploadId // Set a unique ID to help with debugging
    tempInput.setAttribute('data-purpose', 'main-image-upload')

    // Apply styles to make it invisible but accessible
    tempInput.style.position = 'fixed'
    tempInput.style.top = '0'
    tempInput.style.left = '0'
    tempInput.style.opacity = '0.01' // Nearly invisible but still technically visible for browser focus
    tempInput.style.pointerEvents = 'none' // Prevent it from interfering with user interaction
    tempInput.style.height = '1px'
    tempInput.style.width = '1px'
    tempInput.style.overflow = 'hidden'
    tempInput.style.clip = 'rect(0px, 0px, 0px, 0px)'

    // Define the change handler before triggering click
    tempInput.onchange = async (e) => {
      console.log(`🔄 [LOGO-EDIT] File input change event triggered for ${uploadId}`)
      const files = (e.target as HTMLInputElement).files

      // Log detailed information about the event
      console.log('🔍 Event details:', {
        uploadId,
        hasFiles: !!files,
        fileCount: files?.length || 0,
        inputValue: (e.target as HTMLInputElement).value,
        targetType: e.target?.constructor?.name,
      })

      // Defensive check for files
      if (!files || files.length === 0) {
        console.error(`🔴 [LOGO-EDIT] No files in change event for ${uploadId}`)
        toast.error('No file selected. Please try again.')
        return
      }

      // Process the file immediately and with a backup delayed approach in case of timing issues
      const file = files[0]
      processMainImageFile(file)

      // Safety check with delay as backup
      setTimeout(() => {
        if (!mainImageFileRef.current) {
          console.log(`🔄 [LOGO-EDIT] Delayed file processing for ${uploadId}`)
          processMainImageFile(file)
        }
      }, 100)
    }

    // Also handle the click event in case the browser fires it before change
    tempInput.onclick = () => {
      console.log(`🔍 [LOGO-EDIT] File input click event for ${uploadId}`)
    }

    // Append to DOM and focus before clicking
    document.body.appendChild(tempInput)

    // Wait for DOM to fully process the element
    setTimeout(() => {
      try {
        console.log(`🔍 [LOGO-EDIT] Triggering click for ${uploadId}`)
        tempInput.focus()
        tempInput.click()
        console.log(`✅ [LOGO-EDIT] Click triggered for ${uploadId}`)
      } catch (clickError) {
        console.error(`🔴 [LOGO-EDIT] Error triggering click: ${clickError}`)
        toast.error('Could not open file selector. Please try again.')
      }
    }, 50)

    // Clean up after click - but not too soon
    setTimeout(() => {
      try {
        if (document.body.contains(tempInput)) {
          document.body.removeChild(tempInput)
          console.log(`🧹 [LOGO-EDIT] Cleaned up input ${uploadId}`)
        }
      } catch (cleanupError) {
        console.error(`⚠️ [LOGO-EDIT] Cleanup error for ${uploadId}:`, cleanupError)
      }
    }, 5000) // Keep in DOM longer to ensure event fires
  }, [])

  // Separate file processing from event handling for cleaner code
  const processMainImageFile = async (file: File) => {
    try {
      // Check file type
      if (!file.type.startsWith('image/')) {
        console.error(`🔴 [LOGO-EDIT] Invalid file type: ${file.type}`)
        toast.error('Please select an image file')
        return
      }

      // Check file size
      if (file.size === 0) {
        console.error('🔴 [LOGO-EDIT] File is empty (0 bytes)')
        toast.error('Selected file is empty')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        console.error(`🔴 [LOGO-EDIT] File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB`)
        toast.error(
          `File too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
        )
        return
      }

      // Verify file access by reading a small sample
      console.log('🔍 [LOGO-EDIT] Verifying file content access...')
      let testSlice: ArrayBuffer
      try {
        testSlice = await file.slice(0, Math.min(1024, file.size)).arrayBuffer()
        console.log(`✅ [LOGO-EDIT] Successfully read ${testSlice.byteLength} bytes from file`)
      } catch (error) {
        console.error('🔴 [LOGO-EDIT] Failed to read file sample:', error)
        toast.error('Cannot access file content. Please try again with a different file.')
        return
      }

      if (!testSlice || testSlice.byteLength === 0) {
        console.error('🔴 [LOGO-EDIT] File sample is empty')
        toast.error('Cannot read file content. The file may be corrupted.')
        return
      }

      // Create a copy of the file to avoid browser reference issues
      const fileData = await file.arrayBuffer()
      const fileCopy = new File([fileData], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      })

      // Store file in ref
      mainImageFileRef.current = fileCopy

      // Create preview URL
      const previewUrl = URL.createObjectURL(fileCopy)
      console.log(`🖼️ [LOGO-EDIT] Created preview URL: ${previewUrl}`)

      // Update state
      setMainImage({
        preview: previewUrl,
        fileInfo: {
          name: fileCopy.name,
          size: fileCopy.size,
          type: fileCopy.type,
        },
      })

      console.log(`✅ [LOGO-EDIT] Main image prepared successfully: ${fileCopy.name}`)
      toast.success(`Image selected: ${fileCopy.name}`)
      setHasChanges(true)
    } catch (error) {
      console.error('🔴 [LOGO-EDIT] Error processing image:', error)
      toast.error(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  // Add a direct DOM approach for gallery uploads as well
  const triggerGalleryInput = useCallback(() => {
    console.log('🔍 [LOGO-EDIT] Triggering gallery file input with direct DOM approach')

    // Debug log the current state of the gallery
    const currentVisibleCount = galleryPreviews.filter(
      (p) => !deletedGalleryIds.includes(p.id),
    ).length
    const availableSlots = MAX_GALLERY_IMAGES - currentVisibleCount

    console.log('📊 [LOGO-EDIT] Gallery state at upload trigger:', {
      totalGalleryItems: galleryPreviews.length,
      deletedItems: deletedGalleryIds.length,
      visibleItems: currentVisibleCount,
      availableSlots: availableSlots,
      maxAllowed: MAX_GALLERY_IMAGES,
    })

    // Create a key identifier for this specific gallery upload
    const galleryUploadId = `gallery_upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    console.log(`🔑 [LOGO-EDIT] Generated galleryUploadId: ${galleryUploadId}`)

    // Create a fresh file input for each selection
    const tempInput = document.createElement('input')
    tempInput.type = 'file'
    tempInput.accept = 'image/*'
    tempInput.multiple = true
    tempInput.id = galleryUploadId
    tempInput.setAttribute('data-purpose', 'gallery-upload')

    // Apply styles to make it invisible but accessible
    tempInput.style.position = 'fixed'
    tempInput.style.top = '0'
    tempInput.style.left = '0'
    tempInput.style.opacity = '0.01'
    tempInput.style.pointerEvents = 'none'
    tempInput.style.height = '1px'
    tempInput.style.width = '1px'
    tempInput.style.overflow = 'hidden'
    tempInput.style.clip = 'rect(0px, 0px, 0px, 0px)'

    // Define the change handler
    tempInput.onchange = async (e) => {
      console.log(`🔄 [LOGO-EDIT] Gallery input change event triggered for ${galleryUploadId}`)
      const files = (e.target as HTMLInputElement).files

      // Log details
      console.log('🔍 Gallery event details:', {
        galleryUploadId,
        hasFiles: !!files,
        fileCount: files?.length || 0,
        inputValue: (e.target as HTMLInputElement).value,
      })

      // Check for files
      if (!files || files.length === 0) {
        console.error(`🔴 [LOGO-EDIT] No files in gallery selection for ${galleryUploadId}`)
        toast.error('No files selected for gallery. Please try again.')
        return
      }

      // Process immediately and with a backup delayed approach
      processGalleryFiles(files)
    }

    // Also handle the click event
    tempInput.onclick = () => {
      console.log(`🔍 [LOGO-EDIT] Gallery input click event for ${galleryUploadId}`)
    }

    // Append to DOM and focus before clicking
    document.body.appendChild(tempInput)

    // Wait for DOM to fully process the element
    setTimeout(() => {
      try {
        console.log(`🔍 [LOGO-EDIT] Triggering gallery click for ${galleryUploadId}`)
        tempInput.focus()
        tempInput.click()
        console.log(`✅ [LOGO-EDIT] Gallery click triggered for ${galleryUploadId}`)
      } catch (clickError) {
        console.error(`🔴 [LOGO-EDIT] Error triggering gallery click: ${clickError}`)
        toast.error('Could not open gallery file selector. Please try again.')
      }
    }, 50)

    // Clean up
    setTimeout(() => {
      try {
        if (document.body.contains(tempInput)) {
          document.body.removeChild(tempInput)
          console.log(`🧹 [LOGO-EDIT] Cleaned up gallery input ${galleryUploadId}`)
        }
      } catch (cleanupError) {
        console.error(`⚠️ [LOGO-EDIT] Gallery cleanup error for ${galleryUploadId}:`, cleanupError)
      }
    }, 5000)
  }, [galleryPreviews, deletedGalleryIds])

  // Process gallery files separately
  const processGalleryFiles = async (files: FileList) => {
    console.log(`🔴 [LOGO-EDIT] Processing ${files.length} gallery files`)

    // Get current count of visible gallery images (not marked for deletion)
    const currentVisibleCount = galleryPreviews.filter(
      (p) => !deletedGalleryIds.includes(p.id),
    ).length
    const availableSlots = MAX_GALLERY_IMAGES - currentVisibleCount

    console.log(
      `🔢 [LOGO-EDIT] Current visible gallery count: ${currentVisibleCount}/${MAX_GALLERY_IMAGES}, available slots: ${availableSlots}`,
    )

    // Check if adding these files would exceed the maximum
    if (files.length > availableSlots) {
      console.error(
        `🔴 [LOGO-EDIT] Too many files selected: ${files.length} files, but only ${availableSlots} slots available`,
      )
      toast.error(
        `You can only add ${availableSlots} more image(s). Maximum ${MAX_GALLERY_IMAGES} gallery images allowed.`,
      )
      return
    }

    const newPreviews: FilePreviewData[] = []

    for (const file of Array.from(files)) {
      try {
        console.log(`🔍 [LOGO-EDIT] Processing gallery file: ${file.name}`)

        // Validate file
        if (!file.type.startsWith('image/')) {
          console.error(`🔴 [LOGO-EDIT] Invalid gallery file type: ${file.type}`)
          toast.error(`${file.name} is not a valid image file`)
          continue
        }

        if (file.size === 0) {
          console.error(`🔴 [LOGO-EDIT] Gallery file is empty: ${file.name}`)
          toast.error(`${file.name} appears to be empty`)
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          console.error(`🔴 [LOGO-EDIT] Gallery file too large: ${file.name}`)
          toast.error(
            `${file.name} exceeds maximum size of ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
          )
          continue
        }

        // Test file access
        try {
          const testSlice = await file.slice(0, Math.min(1024, file.size)).arrayBuffer()
          if (testSlice.byteLength === 0) {
            console.error(`🔴 [LOGO-EDIT] Cannot read gallery file content: ${file.name}`)
            toast.error(`Cannot read content from ${file.name}`)
            continue
          }
        } catch (error) {
          console.error(`🔴 [LOGO-EDIT] Failed to access gallery file: ${file.name}`, error)
          toast.error(`Cannot access file: ${file.name}`)
          continue
        }

        // Create a copy to avoid browser reference issues
        const fileData = await file.arrayBuffer()
        const fileCopy = new File([fileData], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        })

        // Generate ID and store in ref
        const newId = crypto.randomUUID()
        galleryFilesRef.current.set(newId, fileCopy)

        // Create preview URL
        const previewUrl = URL.createObjectURL(fileCopy)

        // Add to previews
        newPreviews.push({
          id: newId,
          preview: previewUrl,
          fileInfo: {
            name: fileCopy.name,
            size: fileCopy.size,
            type: fileCopy.type,
          },
        })

        console.log(`✅ [LOGO-EDIT] Gallery image prepared: ${file.name}`)
      } catch (error) {
        console.error(`🔴 [LOGO-EDIT] Error processing gallery image: ${file.name}`, error)
        toast.error(`Error processing ${file.name}`)
      }
    }

    if (newPreviews.length > 0) {
      console.log(`✅ [LOGO-EDIT] Adding ${newPreviews.length} new gallery images`)
      const newTotalVisibleCount = currentVisibleCount + newPreviews.length
      const remainingSlots = MAX_GALLERY_IMAGES - newTotalVisibleCount

      console.log(
        `🔢 [LOGO-EDIT] Visible gallery count will change from ${currentVisibleCount} to ${newTotalVisibleCount} after addition`,
      )
      console.log(
        `🔢 [LOGO-EDIT] Available slots will change from ${availableSlots} to ${remainingSlots}`,
      )

      // Update both galleryPreviews and galleryImages
      setGalleryPreviews((prev) => [...prev, ...newPreviews])
      setGalleryImages((prev) => [...prev, ...newPreviews])
      setHasChanges(true)
      toast.success(
        `Added ${newPreviews.length} gallery image(s). ${remainingSlots} slot(s) remaining.`,
      )
    } else {
      console.error('🔴 [LOGO-EDIT] No valid gallery images were processed')
      toast.error('No valid images were found in your selection')
    }
  }

  const handleDeleteGalleryImage = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this image?')
    if (!confirmed) return

    console.log('🗑️ [LOGO-EDIT] Marking existing gallery image for deletion:', id)

    // Get current count before deletion
    const currentVisibleCount = galleryPreviews.filter(
      (p) => !deletedGalleryIds.includes(p.id),
    ).length

    setDeletedGalleryIds((prev) => {
      const newDeletedIds = [...prev, id]
      const newVisibleCount = currentVisibleCount - 1
      console.log(
        `🔢 [LOGO-EDIT] Visible gallery count will change from ${currentVisibleCount} to ${newVisibleCount} after deletion`,
      )
      console.log(
        `🔢 [LOGO-EDIT] Available slots will change from ${MAX_GALLERY_IMAGES - currentVisibleCount} to ${MAX_GALLERY_IMAGES - newVisibleCount}`,
      )
      return newDeletedIds
    })

    toast.success(
      `Image marked for deletion (${MAX_GALLERY_IMAGES - (currentVisibleCount - 1)} slots available)`,
    )
    setHasChanges(true)
  }

  const handleDeleteNewGalleryImage = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this image?')
    if (!confirmed) return

    console.log('🗑️ [LOGO-EDIT] Deleting new gallery image:', id)

    // Get current count before deletion
    const currentVisibleCount = galleryPreviews.filter(
      (p) => !deletedGalleryIds.includes(p.id),
    ).length
    const newVisibleCount = currentVisibleCount - 1
    console.log(
      `🔢 [LOGO-EDIT] Visible gallery count will change from ${currentVisibleCount} to ${newVisibleCount} after deletion`,
    )
    console.log(
      `🔢 [LOGO-EDIT] Available slots will change from ${MAX_GALLERY_IMAGES - currentVisibleCount} to ${MAX_GALLERY_IMAGES - newVisibleCount}`,
    )

    // Find the preview to get its URL
    const previewToDelete = galleryPreviews.find((p) => p.id === id)

    // Revoke the object URL if it's a blob URL
    if (previewToDelete?.preview?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(previewToDelete.preview)
      } catch (err) {
        console.error('Failed to revoke URL:', err)
      }
    }

    // Remove from the gallery files ref
    galleryFilesRef.current.delete(id)

    // Remove from both state arrays
    setGalleryPreviews((prev) => prev.filter((p) => p.id !== id))
    setGalleryImages((prev) => prev.filter((p) => p.id !== id))
    toast.success(`Image removed (${MAX_GALLERY_IMAGES - newVisibleCount} slots available)`)
    setHasChanges(true)
  }

  const handleStatusChange = useCallback((newStatus: LogoStatus) => {
    setStatus(newStatus)
    setHasChanges(true)
  }, [])

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag].slice(0, 2)

    setSelectedTags(newTags)
    setTagChanges(newTags)
    setHasChanges(true)
  }

  const handleDescriptionChange = (value: string) => {
    console.log('Description changed:', value)
    setDescription(value)
    setHasChanges(true)
  }

  const _handleMainImageReplace = () => {
    console.log('🔍 [LOGO-EDIT] Handling main image replacement')
    triggerFileInput()
  }

  const _handleMainImageDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }

    try {
      setIsDeleting(true)
      setPreviewOpen(null) // Close preview if open

      // Clear the file input
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }

      // Revoke the object URL if it's a blob URL
      if (mainImage.preview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(mainImage.preview)
        } catch (err) {
          console.error('Failed to revoke URL:', err)
        }
      }

      // Clear the preview and file ref
      setMainImage({ preview: null })
      mainImageFileRef.current = null

      toast.success('Main image will be deleted when you save changes')
      setHasChanges(true)
    } catch (error) {
      console.error('Failed to delete image:', error)
      toast.error('Failed to delete image')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePreviewOpen = useCallback<(previewUrl: string | null, index?: number) => void>(
    (previewUrl, index = 0) => {
      if (!previewUrl) return
      try {
        setPreviewOpen(previewUrl)
        setCurrentGalleryIndex(index)
      } catch (error) {
        console.error('Failed to open preview:', error)
        toast.error('Failed to open image preview')
      }
    },
    [],
  )

  const handlePreviousImage = useCallback(() => {
    const visiblePreviews = galleryPreviews.filter((p) => !deletedGalleryIds.includes(p.id))
    if (visiblePreviews.length <= 1) return

    setCurrentGalleryIndex((prev) => {
      const newIndex = prev === 0 ? visiblePreviews.length - 1 : prev - 1
      setPreviewOpen(visiblePreviews[newIndex].preview)
      return newIndex
    })
  }, [galleryPreviews, deletedGalleryIds])

  const handleNextImage = useCallback(() => {
    const visiblePreviews = galleryPreviews.filter((p) => !deletedGalleryIds.includes(p.id))
    if (visiblePreviews.length <= 1) return

    setCurrentGalleryIndex((prev) => {
      const newIndex = prev === visiblePreviews.length - 1 ? 0 : prev + 1
      setPreviewOpen(visiblePreviews[newIndex].preview)
      return newIndex
    })
  }, [galleryPreviews, deletedGalleryIds])

  // Add keyboard navigation for gallery preview
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewOpen, handlePreviousImage, handleNextImage])

  const handleSaveWithValidation = async () => {
    console.group('🚀 [LOGO-EDIT] Save Operation')
    console.log('Starting save with validation')

    if (!validateForm()) {
      console.error('❌ Form validation failed')
      console.groupEnd()
      return
    }

    try {
      setIsLoading(true)
      console.log('⏳ Setting loading state')

      // Use this timestamp for all cache-busting operations in this session
      const sessionTimestamp = Date.now()
      console.log(`🔑 Session timestamp for cache-busting: ${sessionTimestamp}`)

      const formData = new FormData()
      // Add session timestamp to form data to help with cache invalidation
      formData.append('clientTimestamp', sessionTimestamp.toString())

      // Add a unique request ID to track this specific save operation
      const requestId = `client_${sessionTimestamp}_${Math.random().toString(36).substring(2, 10)}`
      formData.append('requestId', requestId)
      console.log(`🔑 Generated request ID for tracking: ${requestId}`)

      // Add auto-refresh preference to form data
      formData.append('autoRefresh', autoRefreshEnabled.toString())
      console.log(`🔄 Auto-refresh preference: ${autoRefreshEnabled ? 'enabled' : 'disabled'}`)

      // Find gallery images that have fileInfo (new uploads)
      const newGalleryImageIds = galleryPreviews
        .filter((p) => p.fileInfo && !deletedGalleryIds.includes(p.id))
        .map((p) => p.id)

      console.log('📝 Building FormData with:', {
        logoId: logo.id,
        requestId,
        title: displayTitle,
        description: description.length > 20 ? `${description.substring(0, 20)}...` : description,
        status,
        tags: selectedTags,
        hasNewMainImage: !!mainImageFileRef.current,
        deletedGalleryIds: deletedGalleryIds.length,
        newGalleryImagesCount: newGalleryImageIds.length,
        timestamp: new Date().toISOString(),
      })

      formData.append('title', displayTitle.trim())
      formData.append('description', description.trim())
      formData.append('status', status)
      formData.append('tags', JSON.stringify(selectedTags))
      designerFieldToFormData(designer, formData)

      // Handle main image
      if (mainImageFileRef.current) {
        const mainImage = mainImageFileRef.current
        console.log(
          `🖼️ Adding main image to FormData: ${mainImage.name}, size: ${mainImage.size}, type: ${mainImage.type}, lastModified: ${new Date(mainImage.lastModified).toISOString()}`,
        )

        // Check if file is still valid (not null or empty)
        if (!mainImage.size) {
          console.error('🔴 Main image file appears empty or invalid', {
            name: mainImage.name,
            size: mainImage.size,
            type: mainImage.type,
          })
          toast.error('Main image appears invalid. Please try uploading again.')
          console.groupEnd()
          return
        }

        try {
          console.log('🔍 Verifying main image file access...')
          // Check if we can still access the file data
          const testSlice = await mainImage.slice(0, Math.min(1024, mainImage.size)).arrayBuffer()
          console.log(`✅ File access verified, read ${testSlice.byteLength} bytes sample`)
        } catch (fileAccessError) {
          console.error('🔴 Cannot access file data:', fileAccessError)
          toast.error('Cannot access image data. Please try uploading again.')
          console.groupEnd()
          return
        }

        formData.append('mainImage', mainImage)
        // Add header flag to indicate main image is expected
        console.log('✅ Main image added to FormData')
      } else {
        console.log('ℹ️ No new main image to upload')
      }

      if (deletedGalleryIds.length > 0) {
        console.log(
          `🗑️ Adding ${deletedGalleryIds.length} deleted gallery IDs to FormData:`,
          deletedGalleryIds,
        )
        formData.append('deletedGalleryIds', JSON.stringify(deletedGalleryIds))
      }

      // Add new gallery images to form data
      console.log(`🖼️ Processing ${newGalleryImageIds.length} new gallery images for upload`)

      for (const id of newGalleryImageIds) {
        const file = galleryFilesRef.current.get(id)
        if (file) {
          console.log(
            `🖼️ Adding gallery image to FormData: ${file.name}, size: ${file.size}, type: ${file.type}, lastModified: ${new Date(file.lastModified).toISOString()}`,
          )

          try {
            // Verify file is still accessible
            const testSlice = await file.slice(0, Math.min(1024, file.size)).arrayBuffer()
            console.log(
              `✅ Gallery file ${id} access verified, read ${testSlice.byteLength} bytes sample`,
            )
            formData.append('galleryImages', file)
          } catch (fileAccessError) {
            console.error(`🔴 Cannot access gallery file ${id} data:`, fileAccessError)
            toast.error('Cannot access gallery image data. Please try uploading again.')
            // Continue with other files
          }
        } else {
          console.warn(`⚠️ File not found for gallery image ID: ${id}`)
        }
      }

      // Log FormData entries
      console.log('📋 FormData entries:')
      let entryCount = 0
      for (const pair of formData.entries()) {
        entryCount++
        const value = pair[1]
        if (value instanceof File) {
          console.log(
            `📋 FormData entry ${entryCount}: ${pair[0]} = File(${value.name}, ${value.size} bytes, ${value.type})`,
          )
        } else {
          console.log(
            `📋 FormData entry ${entryCount}: ${pair[0]} = ${typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value}`,
          )
        }
      }

      const apiUrl = `/api/admin/logos/${logo.id}/edit`
      console.log('🔄 Sending request to:', apiUrl)

      // Add a timestamp to force fresh request
      const urlWithTimestamp = `${apiUrl}?t=${sessionTimestamp}&r=${Math.random().toString(36).substring(7)}`
      console.log('🔄 URL with timestamp:', urlWithTimestamp)

      // Add request start time for timing analysis
      const requestStartTime = Date.now()
      console.log(`⏱️ Request start time: ${new Date(requestStartTime).toISOString()}`)

      // Create AbortController for request timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error('🔴 Request timeout after 60 seconds')
        controller.abort()
      }, 60000) // 60 second timeout

      // Visual progress notification
      const loadingToast = toast.loading('Uploading logo...', {
        id: `upload-${requestId}`,
        duration: 60000,
      })

      try {
        // Before sending request, check files one more time
        if (mainImageFileRef.current && !mainImageFileRef.current.size) {
          console.error('🔴 Main image validation failed right before upload')
          throw new Error('Image file is no longer valid. Please try uploading again.')
        }

        const response = await fetch(urlWithTimestamp, {
          method: 'PATCH',
          body: formData,
          // Disable cache to get fresh response
          cache: 'no-store',
          headers: {
            'X-Request-Time': sessionTimestamp.toString(),
            'X-Request-ID': requestId,
            'X-Cache-Buster': Math.random().toString(36).substring(7),
            'X-Has-Main-Image': mainImageFileRef.current ? 'true' : 'false',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        })

        // Clear the timeout since request completed
        clearTimeout(timeoutId)
        toast.dismiss(loadingToast)

        const requestDuration = Date.now() - requestStartTime
        console.log(`⏱️ Request completed in ${requestDuration}ms with status: ${response.status}`)

        // Log response headers
        const responseHeaders: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value
        })
        console.log('🔄 Response headers:', JSON.stringify(responseHeaders, null, 2))

        // Get response data with error handling
        let responseData: Record<string, unknown>
        try {
          const responseText = await response.text()
          console.log(
            `📄 Raw response (first 300 chars): ${responseText.substring(0, 300)}${responseText.length > 300 ? '...' : ''}`,
          )

          try {
            responseData = JSON.parse(responseText)
            console.log('🔄 Parsed response data:', JSON.stringify(responseData, null, 2))
          } catch (parseError) {
            console.error('❌ Failed to parse response as JSON:', parseError)
            throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`)
          }
        } catch (textError: unknown) {
          console.error('❌ Failed to get response text:', textError)
          throw new Error(
            `Failed to read server response: ${textError instanceof Error ? textError.message : 'Unknown error'}`,
          )
        }

        if (!response.ok) {
          console.error('❌ Server error response:', responseData)
          throw new Error(
            typeof responseData.error === 'string'
              ? responseData.error
              : typeof responseData.message === 'string'
                ? responseData.message
                : `Server returned ${response.status} ${response.statusText}`,
          )
        }

        console.log('✅ Update successful:', responseData)

        // Clear cache more aggressively with better error handling
        console.log('🧹 Starting cache refresh request')
        try {
          const cacheResponse = await fetch(`/api/admin/logos/${logo.id}/refresh-cache`, {
            method: 'POST',
            cache: 'no-store',
            headers: {
              'X-Request-Source': 'logo-edit-modal',
              'X-Request-ID': requestId,
              'X-Request-Time': Date.now().toString(),
            },
          })

          const cacheStatus = cacheResponse.status
          console.log(`🧹 Cache refresh response status: ${cacheStatus}`)

          if (cacheResponse.ok) {
            try {
              const cacheData = await cacheResponse.json()
              console.log('🧹 Cache refresh response:', JSON.stringify(cacheData, null, 2))
            } catch (e) {
              console.warn('⚠️ Failed to parse cache refresh response:', e)
            }
          } else {
            console.warn(`⚠️ Cache refresh failed with status: ${cacheStatus}`)
          }
        } catch (cacheError) {
          console.warn('⚠️ Cache refresh request failed:', cacheError)
          // Continue even if cache refresh fails
        }

        toast.success('Logo updated successfully')
        console.log('✅ Closing modal')
        onClose()

        // Use a longer delay before refreshing to allow server to process
        console.log('⏳ Setting timeout for page reload')
        if (autoRefreshEnabled) {
          setTimeout(() => {
            console.log('🔄 Executing page reload')

            try {
              // Force reload the page to ensure fresh content
              window.location.href = `${window.location.pathname}?t=${sessionTimestamp}`
            } catch (reloadError) {
              console.error('❌ Failed to reload page:', reloadError)
              // Try alternative reload method if the first fails
              window.location.reload()
            }
          }, 1000) // Increased from 500ms to 1000ms for more reliable refreshing
        } else {
          console.log('🔄 Page reload skipped (auto-refresh disabled)')
        }
      } catch (fetchError: unknown) {
        // Clear the timeout if there was an error
        clearTimeout(timeoutId)

        console.error('❌ Fetch error:', fetchError)

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 60 seconds. The server may be overloaded.')
        }

        // Check for network errors
        if (!navigator.onLine) {
          throw new Error(
            'Network connection lost. Please check your internet connection and try again.',
          )
        }

        throw fetchError
      }
    } catch (error: unknown) {
      console.error('❌ Save failed:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      toast.error(
        `Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )

      // Log extra diagnostic info for errors
      console.error('❌ Error details:', {
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        online: navigator.onLine,
        timeOfError: new Date().toISOString(),
      })
    } finally {
      console.log('🏁 Finishing save process, resetting loading state')
      setIsLoading(false)
      console.groupEnd()
    }
  }

  const handleTitleChange = (value: string) => {
    // Allow direct input including spaces
    setDisplayTitle(value)

    // Generate cloudinary name without spaces
    const cloudinaryValue = value.replace(/\s+/g, '_').toLowerCase()
    setCloudinaryName(generateCloudinaryName(cloudinaryValue))
    setHasChanges(true)
  }

  // Validate form with better logging
  const validateForm = (): boolean => {
    console.log('Validating form with:', {
      title: displayTitle,
      description,
      status,
      selectedTags,
      hasImage: !!mainImageFileRef.current || !!logo.thumbnail,
    })

    if (!displayTitle?.trim()) {
      toast.error('Title is required')
      return false
    }

    if (!description?.trim()) {
      toast.error('Description is required')
      return false
    }

    if (!selectedTags?.length) {
      toast.error('At least one tag is required')
      return false
    }

    if (!status || !MANUAL_STATUSES.includes(status as (typeof MANUAL_STATUSES)[number])) {
      console.error('Invalid status:', status)
      toast.error(`Invalid status: ${status}`)
      return false
    }

    if (!isDesignerFieldValid(designer)) {
      toast.error('Designer name and a valid email are required')
      return false
    }

    return true
  }

  const baselineTitle = useMemo(() => {
    if (!logo?.title) return ''
    const cleanTitle = logo.title
      .replace(/^Logo_/i, '')
      .replace(/_placeholder.*$/, '')
      .replace(/_/g, ' ')
    return formatTitle(cleanTitle)
  }, [logo?.title])

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setDiscardOpen(true)
      return
    }
    toast.message('No changes made')
    onClose()
  }, [hasChanges, onClose])

  const confirmDiscard = useCallback(() => {
    setDiscardOpen(false)
    setHasChanges(false)
    onClose()
  }, [onClose])

  // Track changes in form data
  useEffect(() => {
    if (!isOpen) {
      setHasChanges(false)
      return
    }

    const tagsChanged =
      JSON.stringify([...selectedTags].sort()) !== JSON.stringify([...(logo.tags ?? [])].sort())

    const hasModifications =
      !!mainImage.fileInfo ||
      displayTitle.trim() !== baselineTitle.trim() ||
      description !== (logo.description ?? '') ||
      status !== logo.status ||
      tagsChanged ||
      designerFieldChanged(designer, logo) ||
      deletedGalleryIds.length > 0 ||
      galleryPreviews.some((p) => p.fileInfo !== undefined)

    setHasChanges(hasModifications)
  }, [
    isOpen,
    mainImage.fileInfo,
    displayTitle,
    baselineTitle,
    description,
    status,
    selectedTags,
    designer,
    logo.description,
    logo.status,
    logo.tags,
    logo.designerId,
    logo.designer,
    deletedGalleryIds,
    galleryPreviews,
  ])

  // Log gallery state changes
  useEffect(() => {
    // Only log when component is mounted and visible
    if (isOpen) {
      const totalGalleryItems = galleryPreviews.length
      const deletedItems = deletedGalleryIds.length
      const visibleItems = totalGalleryItems - deletedItems
      const availableSlots = MAX_GALLERY_IMAGES - visibleItems

      console.log('📊 [LOGO-EDIT] Gallery state updated:', {
        total: totalGalleryItems,
        visible: visibleItems,
        deleted: deletedItems,
        available: availableSlots,
        maxAllowed: MAX_GALLERY_IMAGES,
      })
    }
  }, [isOpen, galleryPreviews, deletedGalleryIds])

  // Calculate visible gallery count (excluding deleted items)
  const visibleGalleryCount = useMemo(() => {
    // Get all gallery preview IDs
    const allIds = galleryPreviews.map((p) => p.id)

    // Filter out deleted IDs
    const visibleIds = allIds.filter((id) => !deletedGalleryIds.includes(id))

    // Count unique visible IDs
    const uniqueVisibleIds = new Set(visibleIds)
    const count = uniqueVisibleIds.size

    console.log('🔢 [LOGO-EDIT] Visible gallery count calculation:', {
      total: galleryPreviews.length,
      deleted: deletedGalleryIds.length,
      visible: count,
      available: MAX_GALLERY_IMAGES - count,
    })

    return count
  }, [galleryPreviews, deletedGalleryIds])

  // Force UI update when gallery state changes
  useEffect(() => {
    if (isOpen && (galleryPreviews.length > 0 || deletedGalleryIds.length > 0)) {
      console.log('🔄 [LOGO-EDIT] Gallery state changed, forcing UI update')

      // This is just to ensure React re-renders the component
      // when the gallery state changes
      const forceUpdate = () => {}
      forceUpdate()
    }
  }, [isOpen, galleryPreviews, deletedGalleryIds])

  // Error boundary
  if (error) {
    console.error('Rendering error state:', error)
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent hideClose className="max-w-md border border-border bg-background">
          <DialogTitle className="sr-only">Error</DialogTitle>
          <div className="space-y-4 p-2">
            <h3 className="text-heading-24 text-destructive">Error occurred</h3>
            <p className="text-caption text-foreground-muted">{error}</p>
            <Button type="button" variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const mainPreviewSrc = mainImage.preview || logo.thumbnail || null
  const locked = isStatusLocked(logo.status)

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose()
        }}
      >
        <DialogContent hideClose placement="fullscreen">
          <DialogTitle className="sr-only">Edit logo</DialogTitle>

          <Button
            type="button"
            variant="tertiary"
            size="icon"
            aria-label="Close modal"
            onClick={handleClose}
            className="fixed right-4 top-4 z-[101]"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="container mx-auto px-4 py-20 sm:py-24">
            <div className="mx-auto max-w-xl">
              <div className="mb-10 space-y-3 sm:mb-14">
                <span className="block font-mono text-metadata uppercase text-foreground-subtle">
                  Edit logo
                </span>
                <h2 className="text-heading-24 text-foreground">Update logo details</h2>
                <p className="text-caption text-foreground-muted">
                  {locked
                    ? 'This logo is sold. Checkout set the status — admin edits are locked.'
                    : 'Edit title, status, images, and tags for this logo.'}
                </p>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (locked) {
                    toast.error('Sold logos cannot be edited')
                    return
                  }
                  handleSaveWithValidation()
                }}
              >
                <fieldset disabled={locked} className="space-y-6 disabled:opacity-70">
                  <InputGroup className="w-full">
                    <InputField
                      index={0}
                      label="Title"
                      hideLabel
                      placeholder="Title"
                      value={displayTitle}
                      onChange={handleTitleChange}
                    />
                  </InputGroup>

                  <div className="flex items-center justify-between gap-3">
                    <span
                      id="status-group-label"
                      className="shrink-0 text-caption text-foreground-muted"
                    >
                      Status
                    </span>
                    <LogoStatusDropdown
                      value={status}
                      options={MANUAL_STATUSES}
                      onChange={handleStatusChange}
                      readOnly={locked}
                      aria-labelledby="status-group-label"
                    />
                  </div>

                  <DesignerField
                    value={designer}
                    onChange={setDesigner}
                    disabled={locked}
                    currentDesigner={
                      logo.designer
                        ? {
                            id: logo.designer.id,
                            name: logo.designer.name,
                            email: logo.designer.email,
                          }
                        : null
                    }
                  />

                  <div className="space-y-2">
                    <input
                      type="file"
                      className="hidden"
                      ref={mainImageInputRef}
                      accept="image/*"
                      onChange={() => console.log('Native input change event - not used anymore')}
                      aria-label="Upload main image"
                    />

                    {mainPreviewSrc ? (
                      <div className="group relative overflow-hidden rounded-xl border border-border bg-card">
                        <img src={mainPreviewSrc} alt="Logo preview" className="w-full" />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/40 opacity-0 transition-opacity duration-80 group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="tertiary"
                            size="icon"
                            onClick={triggerFileInput}
                            aria-label="Replace main image"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        aria-label="Upload image"
                        className="relative flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-8 text-center transition-colors duration-80 hover:border-border-strong"
                      >
                        <Upload className="h-6 w-6 text-foreground-muted" />
                        <p className="text-caption text-foreground-muted">
                          Drop your image or click to browse
                        </p>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      id="gallery-images-input"
                      type="file"
                      className="hidden"
                      ref={galleryInputRef}
                      accept="image/*"
                      multiple
                      onChange={() => console.log('Native gallery input change - not used anymore')}
                      aria-label="Gallery images upload"
                    />
                    <div className="flex items-center justify-between">
                      <span
                        id="gallery-images-label"
                        aria-label="Gallery images count"
                        role="status"
                        className="block text-caption text-foreground-muted"
                      >
                        Gallery Images ({visibleGalleryCount}/{MAX_GALLERY_IMAGES})
                        {deletedGalleryIds.length > 0 && (
                          <span className="ml-2 text-metadata text-foreground-subtle">
                            ({deletedGalleryIds.length} marked for deletion)
                          </span>
                        )}
                      </span>
                      {visibleGalleryCount < MAX_GALLERY_IMAGES && (
                        <span className="text-metadata text-foreground-subtle">
                          {MAX_GALLERY_IMAGES - visibleGalleryCount} slot
                          {MAX_GALLERY_IMAGES - visibleGalleryCount !== 1 ? 's' : ''} available
                        </span>
                      )}
                    </div>
                    <div
                      role="group"
                      aria-labelledby="gallery-images-label"
                      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                    >
                      {galleryPreviews
                        .filter((item) => !deletedGalleryIds.includes(item.id))
                        .map((item) => (
                          <div
                            key={item.id}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card"
                          >
                            <img
                              src={item.preview}
                              alt={`Gallery pic ${item.id}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/40 opacity-0 transition-opacity duration-80 group-hover:opacity-100">
                              <Button
                                type="button"
                                variant="tertiary"
                                size="icon"
                                onClick={() => handlePreviewOpen(item.preview)}
                                aria-label={`Preview gallery image ${item.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="tertiary"
                                size="icon"
                                onClick={() =>
                                  item.fileInfo
                                    ? handleDeleteNewGalleryImage(item.id)
                                    : handleDeleteGalleryImage(item.id)
                                }
                                aria-label={`Delete gallery image ${item.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                      {visibleGalleryCount < MAX_GALLERY_IMAGES && (
                        <button
                          type="button"
                          onClick={triggerGalleryInput}
                          className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-foreground-muted transition-colors duration-80 hover:border-border-strong hover:text-foreground"
                          aria-label="Add gallery image"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        id="tags-group-label"
                        className="block text-caption text-foreground-muted"
                      >
                        Tags (max 2)
                      </span>
                    </div>
                    <div
                      role="group"
                      aria-labelledby="tags-group-label"
                      className="flex flex-wrap gap-2"
                    >
                      {AVAILABLE_TAGS.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          size="sm"
                          variant={selectedTags.includes(tag) ? 'primary' : 'tertiary'}
                          aria-pressed={selectedTags.includes(tag)}
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <FormTextarea
                    id="edit-logo-description"
                    label="Description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Description"
                  />
                </fieldset>

                {!locked && (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    className="w-full"
                    aria-label="Save changes"
                  >
                    Save Changes
                  </Button>
                )}
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

            {visibleGalleryCount > 1 && (
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
              </>
            )}

            {previewOpen && (
              <img src={previewOpen} alt="Preview" className="w-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDestructiveDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard edits?"
        description={
          <>
            You changed this logo but haven’t saved. If you leave now, those edits will be lost and
            the logo will stay as it was.
          </>
        }
        confirmLabel="Discard edits"
        cancelLabel="Keep editing"
        onConfirm={confirmDiscard}
      />
    </>
  )
})

// Add displayName to fix the ESLint error
LogoEditModal.displayName = 'LogoEditModal'

export default LogoEditModal
