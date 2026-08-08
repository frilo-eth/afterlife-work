'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalContent,
  Button,
  Input,
  Textarea,
  Chip,
  Image
} from "@nextui-org/react"
import { X, Upload, Eye, Trash, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import type { LogoWithDetails, LogoStatus } from '@/types'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Logo } from "@prisma/client"

// Add gallery type to match Prisma schema
interface LogoGalleryItem {
  id: string
  imageUrl: string
  logoId: string
}

// Extend LogoWithDetails type
interface ExtendedLogoDetails extends LogoWithDetails {
  gallery?: LogoGalleryItem[]
}

interface LogoEditModalProps {
  logo: LogoWithDetails & { 
    gallery?: { 
      id: string
      imageUrl: string 
    }[] 
  }
  isOpen: boolean
  onClose: () => void
}

interface FilePreviewData {
  id: string
  file: File | null
  preview: string
}

interface FilePreviewProps {
  preview: string | null
  loading?: boolean
  error?: string
  onRemove?: () => void
  onPreview?: () => void
  className?: string
}

interface MainImageState {
  preview: string | null;
  // Store file info instead of the file object
  fileInfo?: {
    name: string
    size: number
    type: string
  }
}

interface FilePreview {
  id: string
  file: File | null  // Allow null for existing images
  preview: string
}

interface DragState {
  mainImage: boolean;
  gallery: boolean;
}

const statusColorMap: Record<LogoStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  AVAILABLE: "success",
  SOLD: "primary",
  REVIEW: "warning",
  DRAFT: "default",
  HIDDEN: "danger"
}

const FilePreview = ({ preview, loading, error, onRemove, className }: FilePreviewProps) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <img src={preview || ''} alt="Preview" className="w-full h-full object-cover rounded-lg" />
      {onRemove && (
        <Button
          isIconOnly
          className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          size="sm"
          onPress={onRemove}
        >
          <Trash size={16} />
        </Button>
      )}
    </div>
  )
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
] as const

// Title formatting utilities
const formatTitle = (input: string): string => {
  // Only remove special characters, keep spaces
  return input
    .replace(/[^\w\s-]/g, '')  // Keep word chars, spaces, and hyphens
    .replace(/\s+/g, ' ')      // Normalize multiple spaces to single space
    .trim()
}

const generateCloudinaryName = (title: string): string => {
  // Convert "Sigma Flux" to "sigma-flux"
  return title.toLowerCase().replace(/\s+/g, '-')
}

// Add a helper function for file validation
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`
    };
  }
  
  // Check file type
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }
  
  return { isValid: true };
};

// Add a helper function to create file previews
const createFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const LogoEditModal = ({ logo, isOpen, onClose }: LogoEditModalProps) => {
  console.log('LogoEditModal render with state:', { 
    logoId: logo.id, 
    isOpen,
    currentStatus: logo.status,
    hasMainImage: !!logo.thumbnail,
    galleryCount: logo.gallery?.length,
    selectedTags: logo.tags,
    description: logo.description
  })
  
  const [displayTitle, setDisplayTitle] = useState('')
  const [cloudinaryName, setCloudinaryName] = useState('')
  const [description, setDescription] = useState(logo?.description || '')
  const [status, setStatus] = useState<LogoStatus>(logo.status || 'DRAFT')
  const [selectedTags, setSelectedTags] = useState<string[]>(logo?.tags || [])
  const [isLoading, setIsLoading] = useState(false)
  
  // Simplified approach - store the actual file objects directly
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(logo.thumbnail || null)
  
  const [galleryFiles, setGalleryFiles] = useState<{id: string, file: File}[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<{id: string, preview: string}[]>(
    logo.gallery?.map(item => ({
      id: item.id,
      preview: item.imageUrl
    })) || []
  )
  
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([])
  const [tagChanges, setTagChanges] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [dragState, setDragState] = useState<DragState>({
    mainImage: false,
    gallery: false
  })
  
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const MAX_GALLERY_IMAGES = 6
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  
  useEffect(() => {
    if (logo) {
      setDescription(logo.description)
      setStatus(logo.status as LogoStatus)
      setSelectedTags(logo.tags)
      
      // Reset gallery previews when logo changes
      setGalleryPreviews(
        logo.gallery?.map(item => ({
          id: item.id,
          preview: item.imageUrl
        })) || []
      )
      
      // Reset gallery files
      setGalleryFiles([])
      
      // Reset main image preview
      if (logo.thumbnail) {
        setMainImagePreview(logo.thumbnail)
      } else {
        setMainImagePreview(null)
      }
      
      // Reset main image file
      setMainImageFile(null)
      
      // Reset deleted gallery IDs
      setDeletedGalleryIds([])
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
      setIsDeleting(false)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = ''
      }
      
      // Force a router refresh when the modal closes to ensure the table is updated
      router.refresh()
    }
  }, [isOpen, router])

  // Add drag and drop handlers
  const handleDrag = (e: React.DragEvent, type: 'mainImage' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      [type]: e.type === "dragenter" || e.type === "dragover"
    }));
  };

  const handleDrop = async (e: React.DragEvent, type: 'mainImage' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      [type]: false
    }));

    const files = Array.from(e.dataTransfer.files);
    
    if (type === 'mainImage') {
      if (files.length > 1) {
        toast.error('Please upload only one main image file');
        return;
      }
      
      const file = files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      // Pass the file to the upload handler
      handleMainImageUpload(e.dataTransfer.files);
    } else {
      // Handle gallery files
      const validFiles = files.filter(file => {
        const validation = validateFile(file);
        if (!validation.isValid) {
          toast.error(validation.error);
          return false;
        }
        return true;
      });

      if (validFiles.length) {
        // Create a DataTransfer object to convert array back to FileList
        const dataTransfer = new DataTransfer();
        for (const file of validFiles) {
          dataTransfer.items.add(file);
        }
        handleGalleryUpload(dataTransfer.files);
      }
    }
  };

  // Update the handleMainImageUpload function
  const handleMainImageUpload = useCallback((files: FileList | null) => {
    console.log('handleMainImageUpload called with files:', files?.length || 0)
    
    if (!files?.length) {
      console.warn('No files selected')
      return
    }

    const file = files[0]
    console.log(`Processing main image: ${file.name}, size: ${file.size}, type: ${file.type}`)
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type)
      toast.error('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`)
      return
    }

    try {
      // Store the file directly
      setMainImageFile(file)
      
      // Create a simple object URL for preview
      const objectUrl = URL.createObjectURL(file)
      setMainImagePreview(objectUrl)
      setHasChanges(true)
      toast.success("Main image updated successfully")
      
      // Reset the file input
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to process image:', error)
      toast.error('Failed to load image')
    }
  }, [])

  // Update the handleGalleryUpload function
  const handleGalleryUpload = (files: FileList | null) => {
    console.log('handleGalleryUpload called with files:', files?.length || 0)
    
    if (!files?.length) {
      console.log('No files selected for gallery upload')
      return
    }
    
    // Check if adding these files would exceed the maximum
    const currentCount = galleryPreviews.filter(p => !deletedGalleryIds.includes(p.id)).length
    const newFilesCount = files.length
    
    console.log('Gallery upload check:', { currentCount, newFilesCount, max: MAX_GALLERY_IMAGES })
    
    if (currentCount + newFilesCount > MAX_GALLERY_IMAGES) {
      console.warn(`Maximum gallery images exceeded: ${currentCount + newFilesCount}/${MAX_GALLERY_IMAGES}`)
      toast.error(`You can only upload up to ${MAX_GALLERY_IMAGES} gallery images (${currentCount} already uploaded)`)
      return
    }
    
    const newGalleryFiles: {id: string, file: File}[] = []
    const newGalleryPreviews: {id: string, preview: string}[] = []
    
    let successCount = 0;
    let errorCount = 0;
    
    // Limit the number of files to process to avoid exceeding MAX_GALLERY_IMAGES
    const filesToProcess = Array.from(files).slice(0, MAX_GALLERY_IMAGES - currentCount)
    
    for (const file of filesToProcess) {
      console.log(`Processing gallery file: ${file.name}, size: ${file.size}, type: ${file.type}`)
      
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} is too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`)
        errorCount++;
        continue
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image`)
        errorCount++;
        continue
      }
      
      try {
        const id = crypto.randomUUID()
        
        // Store the file directly
        newGalleryFiles.push({ id, file })
        
        // Create a simple object URL for preview
        const objectUrl = URL.createObjectURL(file)
        newGalleryPreviews.push({ id, preview: objectUrl })
        successCount++;
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        toast.error(`Error processing ${file.name}`)
        errorCount++;
      }
    }
    
    if (newGalleryFiles.length > 0) {
      // Update state with new files and previews
      setGalleryFiles(prev => [...prev, ...newGalleryFiles])
      setGalleryPreviews(prev => [...prev, ...newGalleryPreviews])
      setHasChanges(true)
      
      const newTotalCount = currentCount + successCount;
      if (successCount === 1) {
        toast.success(`Added 1 gallery image (${newTotalCount}/${MAX_GALLERY_IMAGES})`)
      } else if (successCount > 1) {
        toast.success(`Added ${successCount} gallery images (${newTotalCount}/${MAX_GALLERY_IMAGES})`)
      }
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to add ${errorCount} image${errorCount > 1 ? 's' : ''}`)
    }
    
    // Reset the file input
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''
    }
  }

  const handleDeleteGalleryImage = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this image? This will remove it from the database when you save.')
    if (!confirmed) return

    console.log('Marking existing gallery image for deletion:', id)
    setDeletedGalleryIds(prev => [...prev, id])
    
    // Calculate the new visible gallery count after deletion
    const newVisibleCount = galleryPreviews.filter(p => !deletedGalleryIds.includes(p.id) && p.id !== id).length
    console.log(`Gallery image marked for deletion. New visible count: ${newVisibleCount}/${MAX_GALLERY_IMAGES}`)
    
    toast.success(`Image marked for deletion (${newVisibleCount}/${MAX_GALLERY_IMAGES} images remaining)`)
    setHasChanges(true)
  }

  const handleDeleteNewGalleryImage = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this image?')
    if (!confirmed) return
    
    console.log('Deleting new gallery image:', id)
    
    // Remove from state
    setGalleryPreviews(prev => prev.filter(p => p.id !== id))
    
    // Also remove from galleryFiles if it exists there
    setGalleryFiles(prev => prev.filter(f => f.id !== id))
    
    // Revoke the object URL if it's a blob URL
    const preview = galleryPreviews.find(p => p.id === id)?.preview
    if (preview?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(preview)
        console.log(`Revoked object URL for deleted gallery image: ${id}`)
      } catch (error) {
        console.error(`Failed to revoke object URL for gallery image: ${id}`, error)
      }
    }
    
    // Calculate the new visible gallery count after deletion
    const newVisibleCount = galleryPreviews.filter(p => !deletedGalleryIds.includes(p.id) && p.id !== id).length
    console.log(`Gallery image deleted. New visible count: ${newVisibleCount}/${MAX_GALLERY_IMAGES}`)
    
    toast.success(`Image removed (${newVisibleCount}/${MAX_GALLERY_IMAGES} images remaining)`)
    setHasChanges(true)
  }

  const handleStatusChange = useCallback((newStatus: LogoStatus) => {
    setStatus(newStatus)
    setHasChanges(true)
  }, [])

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag].slice(0, 2)
    
    // Check if we're adding or removing a tag
    if (selectedTags.includes(tag)) {
      toast.info(`Removed "${tag}" tag (${newTags.length}/2)`)
    } else if (selectedTags.length < 2) {
      toast.success(`Added "${tag}" tag (${newTags.length}/2)`)
    } else {
      toast.info(`Replaced tag with "${tag}" (2/2 maximum)`)
    }
    
    setSelectedTags(newTags)
    setTagChanges(newTags)
    setHasChanges(true)
  }

  const handleDescriptionChange = (value: string) => {
    console.log('Description changed:', value)
    setDescription(value)
    setHasChanges(true)
  }

  const handleMainImageReplace = () => {
    if (!mainImageInputRef.current) return
    mainImageInputRef.current.click()
  }

  const handleMainImageDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image? This will be applied when you save.')) {
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
      if (mainImagePreview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(mainImagePreview)
          console.log('Revoked object URL for deleted main image')
        } catch (error) {
          console.error('Failed to revoke object URL for main image', error)
        }
      }
      
      // Clear the preview and file
      setMainImagePreview(null)
      setMainImageFile(null)
      
      toast.success('Main image will be deleted when you save changes')
      setHasChanges(true)
    } catch (error) {
      console.error('Failed to delete image:', error)
      toast.error('Failed to delete image')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePreviewOpen = useCallback<(previewUrl: string | null, index?: number) => void>((previewUrl, index = 0) => {
    if (!previewUrl) return
    try {
      setPreviewOpen(previewUrl)
      setCurrentGalleryIndex(index)
    } catch (error) {
      console.error('Failed to open preview:', error)
      toast.error('Failed to open image preview')
    }
  }, [])

  const handlePreviousImage = useCallback(() => {
    const visiblePreviews = galleryPreviews.filter(p => !deletedGalleryIds.includes(p.id));
    if (visiblePreviews.length <= 1) return;
    
    setCurrentGalleryIndex(prev => {
      const newIndex = prev === 0 ? visiblePreviews.length - 1 : prev - 1;
      setPreviewOpen(visiblePreviews[newIndex].preview);
      return newIndex;
    });
  }, [galleryPreviews, deletedGalleryIds]);

  const handleNextImage = useCallback(() => {
    const visiblePreviews = galleryPreviews.filter(p => !deletedGalleryIds.includes(p.id));
    if (visiblePreviews.length <= 1) return;
    
    setCurrentGalleryIndex(prev => {
      const newIndex = prev === visiblePreviews.length - 1 ? 0 : prev + 1;
      setPreviewOpen(visiblePreviews[newIndex].preview);
      return newIndex;
    });
  }, [galleryPreviews, deletedGalleryIds]);

  // Add keyboard navigation for gallery preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePreviousImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'Escape':
          setPreviewOpen(null);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewOpen, handlePreviousImage, handleNextImage]);

  const handleSaveWithValidation = async () => {
    console.log('Starting save with validation')
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    try {
      setIsLoading(true)
      toast.info("Saving changes...", { duration: 2000 })
      const formData = new FormData()
      
      console.log('Building FormData with:', {
        title: displayTitle,
        description: description.length > 20 ? `${description.substring(0, 20)}...` : description,
        status,
        tags: selectedTags,
        hasNewMainImage: !!mainImageFile,
        deletedGalleryIds: deletedGalleryIds.length,
        newGalleryImagesCount: galleryFiles.length
      })

      formData.append('title', displayTitle.trim())
      formData.append('description', description.trim())
      formData.append('status', status)
      formData.append('tags', JSON.stringify(selectedTags))

      // Simplified main image handling
      if (mainImageFile) {
        console.log(`Adding main image to FormData: ${mainImageFile.name}, size: ${mainImageFile.size}`)
        formData.append('mainImage', mainImageFile)
      }

      if (deletedGalleryIds.length > 0) {
        console.log(`Adding ${deletedGalleryIds.length} deleted gallery IDs to FormData:`, deletedGalleryIds)
        formData.append('deletedGalleryIds', JSON.stringify(deletedGalleryIds))
      }
      
      // Simplified gallery images handling
      console.log(`Processing ${galleryFiles.length} new gallery images for upload`)
      
      for (const { file } of galleryFiles) {
        console.log(`Adding gallery image to FormData: ${file.name}, size: ${file.size}`)
        formData.append('galleryImages', file)
      }

      // Log FormData entries for debugging
      console.log('FormData entries:')
      for (const pair of formData.entries()) {
        const value = pair[1];
        if (value instanceof File) {
          console.log(`FormData entry: ${pair[0]} = File(${value.name}, ${value.size} bytes, ${value.type})`)
        } else {
          console.log(`FormData entry: ${pair[0]} = ${typeof value === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value}`)
        }
      }

      const apiUrl = `/api/admin/logos/${logo.id}/edit`;
      console.log('Sending request to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        body: formData
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const responseData = await response.json()
        console.error('Server error response:', responseData)
        toast.error(`Failed to update logo: ${responseData?.error || responseData?.message || 'Unknown error'}`)
        throw new Error(responseData?.error || responseData?.message || 'Failed to update logo')
      }

      const responseData = await response.json()
      console.log('Response data:', responseData)
      
      // Update local state with the server response data
      if (responseData.data) {
        // Update gallery previews with the new data from server
        setGalleryPreviews(
          responseData.data.gallery.map((item: LogoGalleryItem) => ({
            id: item.id,
            preview: item.imageUrl
          }))
        )
        
        // Update main image preview if it changed
        if (responseData.data.thumbnail) {
          setMainImagePreview(responseData.data.thumbnail)
        }
        
        // Reset deleted gallery IDs since they've been processed
        setDeletedGalleryIds([])
        
        // Reset gallery files since they've been uploaded
        setGalleryFiles([])
        
        // Reset main image file since it's been uploaded
        setMainImageFile(null)
      }
      
      console.log('Update successful:', responseData)
      toast.success('Logo updated successfully')
      
      // Reset the hasChanges flag
      setHasChanges(false)
      
    } catch (error) {
      console.error('Save failed:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      toast.error(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.log('🏁 Finishing save process, resetting loading state')
      setIsLoading(false)
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
      hasImage: !!mainImagePreview || !!mainImageFile
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

    if (!status || !['AVAILABLE', 'SOLD', 'REVIEW', 'DRAFT', 'HIDDEN'].includes(status)) {
      console.error('Invalid status:', status)
      toast.error(`Invalid status: ${status}`)
      return false
    }

    return true
  }

  // Track changes in form data
  useEffect(() => {
    const hasModifications = 
      !!mainImageFile ||
      description !== logo?.description ||
      status !== logo?.status ||
      JSON.stringify(selectedTags) !== JSON.stringify(logo?.tags) ||
      deletedGalleryIds.length > 0 ||
      galleryFiles.length > 0
    
    setHasChanges(hasModifications)
  }, [mainImageFile, description, status, selectedTags, logo, deletedGalleryIds, galleryFiles])

  // Calculate visible gallery count (excluding deleted items)
  const visibleGalleryCount = galleryPreviews.filter(p => !deletedGalleryIds.includes(p.id)).length;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up object URLs')
      
      // Revoke main image preview URL if it's an object URL
      if (mainImagePreview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(mainImagePreview)
          console.log('Revoked main image preview URL')
        } catch (error) {
          console.error('Failed to revoke main image preview URL:', error)
        }
      }
      
      // Revoke gallery preview URLs if they're object URLs
      for (const { preview } of galleryPreviews) {
        if (preview?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(preview)
            console.log(`Revoked gallery preview URL: ${preview.substring(0, 30)}...`)
          } catch (error) {
            console.error(`Failed to revoke gallery preview URL: ${preview.substring(0, 30)}...`, error)
          }
        }
      }
    }
  }, [mainImagePreview, galleryPreviews])

  // Add a handleClose function
  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) return
    }
    
    // Clean up any object URLs before closing
    if (mainImagePreview?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(mainImagePreview)
      } catch (error) {
        console.error('Failed to revoke main image URL:', error)
      }
    }
    
    for (const { preview } of galleryPreviews) {
      if (preview?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(preview)
        } catch (error) {
          console.error('Failed to revoke gallery preview URL:', error)
        }
      }
    }
    
    setError(null)
    onClose()
  }, [hasChanges, onClose, mainImagePreview, galleryPreviews])

  // Error boundary
  if (error) {
    console.error('Rendering error state:', error)
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <div className="p-4">
            <h3 className="text-red-500">Error occurred</h3>
            <p>{error}</p>
            <Button onPress={onClose}>Close</Button>
          </div>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      classNames={{
        base: "bg-black/95 backdrop-blur-xl",
        wrapper: "p-0 max-w-full h-[100dvh] max-h-[100dvh] overflow-hidden",
        body: "p-0 max-h-[100dvh] overflow-hidden",
        closeButton: "hidden",
      }}
      size="full"
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent className="max-h-[100dvh] overflow-hidden">
        <div className="relative h-[100dvh] overflow-y-auto">
          {/* Close Button */}
          <Button
            isIconOnly
            className="fixed right-4 top-4 z-[101] bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
            size="sm"
            onPress={handleClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </Button>

          <div className="container mx-auto px-4 py-24">
            <div className="space-y-4 text-center mb-16">
              <span className="font-mono text-sm tracking-wider opacity-50 uppercase block">
                Edit Logo
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Update Logo Details
              </h2>
            </div>

            <form className="max-w-xl mx-auto space-y-8" onSubmit={(e) => {
              e.preventDefault()
              handleSaveWithValidation()
            }}>
              {/* Title Input */}
              <div className="space-y-2">
                <Input
                  id="title-input"
                  label="Title"
                  labelPlacement="outside"
                  value={displayTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
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
              </div>

              {/* Status Pills */}
              <div className="space-y-2">
                <span 
                  id="status-group-label" 
                  className="block text-sm font-medium text-white/60"
                >
                  Status
                </span>
                <div 
                  role="group" 
                  aria-labelledby="status-group-label"
                  className="flex flex-wrap gap-2"
                >
                  {Object.entries(statusColorMap).map(([statusKey, color]) => (
                    <Button
                      key={statusKey}
                      size="sm"
                      aria-pressed={status === statusKey}
                      variant={status === statusKey ? "solid" : "bordered"}
                      className={`
                        rounded-full px-4 h-10 text-sm transition-all
                        ${status === statusKey
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white'
                        }
                      `}
                      onPress={() => handleStatusChange(statusKey as LogoStatus)}
                    >
                      {statusKey}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Image Upload */}
              <div className="space-y-4">
                <label htmlFor="main-image-input" className="block text-sm font-medium text-white/60">
                  Main Image
                </label>
                <input
                  id="main-image-input"
                  type="file"
                  className="hidden"
                  ref={mainImageInputRef}
                  accept="image/*"
                  onChange={(e) => handleMainImageUpload(e.target.files)}
                  aria-label="Upload main image"
                />
                
                <div
                  className={`
                    relative transition-all duration-300 rounded-xl
                    ${dragState.mainImage ? "ring-2 ring-white/40 scale-[0.99]" : ""}
                  `}
                  onDragEnter={(e) => handleDrag(e, 'mainImage')}
                  onDragLeave={(e) => handleDrag(e, 'mainImage')}
                  onDragOver={(e) => handleDrag(e, 'mainImage')}
                  onDrop={(e) => handleDrop(e, 'mainImage')}
                >
                  {mainImagePreview ? (
                    <div className="relative group">
                      <img 
                        src={mainImagePreview} 
                        alt="Logo preview" 
                        className="w-full rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => mainImageInputRef.current?.click()}
                          className="bg-white/10 backdrop-blur-sm"
                          aria-label="Replace main image"
                        >
                          <Upload className="text-white" size={20} />
                        </Button>
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={handleMainImageDelete}
                          className="bg-white/10 backdrop-blur-sm"
                          aria-label="Delete main image"
                        >
                          <Trash className="text-white" size={20} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`
                        relative w-full p-8 rounded-xl bg-black/20 backdrop-blur-sm 
                        border border-white/10 hover:border-white/20 cursor-pointer
                        ${dragState.mainImage ? "border-white/30" : ""}
                      `}
                      onClick={() => mainImageInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          mainImageInputRef.current?.click();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Upload main image"
                    >
                      <div className={`
                        text-center transition-all
                        ${dragState.mainImage ? "scale-105" : ""}
                      `}>
                        <Upload className="mx-auto text-white/60" size={24} />
                        <p className="text-white/60">
                          {dragState.mainImage ? "Drop to upload image" : "Drop your image or click to browse"}
                        </p>
                        <p className="text-xs text-white/40 mt-1">Supported formats: JPG, PNG, WEBP, GIF</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <input
                  id="gallery-images-input"
                  type="file"
                  className="hidden"
                  ref={galleryInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                  aria-label="Gallery images upload"
                />
                <div className="flex items-center justify-between">
                  <span 
                    id="gallery-images-label" 
                    aria-label="Gallery images count"
                    role="status"
                    className="block text-sm font-medium text-white/60"
                  >
                    Gallery Images ({visibleGalleryCount}/{MAX_GALLERY_IMAGES})
                  </span>
                </div>
                
                <div
                  className={`
                    group relative transition-all
                    ${dragState.gallery ? 'ring-2 ring-white/20 scale-[0.99]' : ''}
                  `}
                  onDragEnter={(e) => handleDrag(e, 'gallery')}
                  onDragLeave={(e) => handleDrag(e, 'gallery')}
                  onDragOver={(e) => handleDrag(e, 'gallery')}
                  onDrop={(e) => handleDrop(e, 'gallery')}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div 
                    role="group" 
                    aria-labelledby="gallery-images-label"
                    className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20"
                  >
                    {/* Gallery images */}
                    {galleryPreviews.filter(item => !deletedGalleryIds.includes(item.id)).map((item) => (
                      <div key={item.id} className="relative aspect-square bg-black/20 rounded-lg overflow-hidden group">
                        <img
                          src={item.preview}
                          alt={`Gallery pic ${item.id}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            isIconOnly
                            variant="light"
                            onPress={() => handlePreviewOpen(item.preview)}
                            className="bg-white/10 backdrop-blur-sm"
                            aria-label={`Preview gallery image ${item.id}`}
                          >
                            <Eye size={20} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            onPress={() => {
                              // Check if this is a new image or an existing one
                              const isNewImage = galleryFiles.some(f => f.id === item.id)
                              if (isNewImage) {
                                handleDeleteNewGalleryImage(item.id)
                              } else {
                                handleDeleteGalleryImage(item.id)
                              }
                            }}
                            className="bg-white/10 backdrop-blur-sm"
                            aria-label={`Delete gallery image ${item.id}`}
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Upload button - only show if we have less than MAX_GALLERY_IMAGES */}
                    {visibleGalleryCount < MAX_GALLERY_IMAGES && (
                      <div 
                        className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex items-center justify-center bg-transparent cursor-pointer"
                        onClick={() => galleryInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            galleryInputRef.current?.click();
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Add gallery image"
                      >
                        <Plus size={24} className="text-white/60" />
                      </div>
                    )}
                    
                    {/* Empty state */}
                    {visibleGalleryCount === 0 && (
                      <div className="col-span-3 text-center py-8">
                        <Upload className="mx-auto text-white/60 mb-2" size={24} />
                        <p className="text-white/60">
                          {dragState.gallery ? "Drop to upload gallery images" : "Drop up to 6 gallery images or click to browse"}
                        </p>
                        <p className="text-xs text-white/40 mt-1">Supported formats: JPG, PNG, WEBP, GIF</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span id="tags-group-label" className="block text-sm font-medium text-white/60">
                    Tags ({selectedTags.length}/2)
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
                      size="sm"
                      aria-pressed={selectedTags.includes(tag)}
                      variant={selectedTags.includes(tag) ? "solid" : "bordered"}
                      className={`
                        rounded-full px-4 h-10 text-sm transition-all
                        ${selectedTags.includes(tag)
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white'
                        }
                      `}
                      endContent={selectedTags.includes(tag) && 
                        <X size={14} className="ml-1" />
                      }
                      onPress={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Textarea
                  id="description-input"
                  label="Description"
                  labelPlacement="outside"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
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
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 h-12"
                isLoading={isLoading}
                aria-label="Save changes"
              >
                Save Changes
              </Button>
            </form>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={!!previewOpen}
          onClose={() => setPreviewOpen(null)}
          classNames={{
            base: "bg-black/95 backdrop-blur-xl",
            wrapper: "p-0 max-w-full h-[100dvh] max-h-[100dvh] overflow-hidden",
            body: "p-0 max-h-[100dvh] overflow-hidden",
            closeButton: "hidden",
          }}
          size="full"
          scrollBehavior="inside"
          hideCloseButton
        >
          <ModalContent className="max-h-[100dvh] overflow-hidden">
            <div className="relative h-[100dvh] flex items-center justify-center">
              {/* Close Button */}
              <Button
                isIconOnly
                className="fixed right-4 top-4 z-[101] bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
                size="sm"
                onPress={() => setPreviewOpen(null)}
                aria-label="Close preview"
              >
                <X size={18} />
              </Button>

              {/* Navigation buttons */}
              {visibleGalleryCount > 1 && (
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
                    {currentGalleryIndex + 1} / {visibleGalleryCount}
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
      </ModalContent>
    </Modal>
  )
}

export default LogoEditModal 