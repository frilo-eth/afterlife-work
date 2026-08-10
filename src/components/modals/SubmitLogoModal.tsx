'use client'

import React, { useState, useCallback, useRef } from "react"
import { Modal, ModalContent, Button, Input, Textarea, CircularProgress } from "@nextui-org/react"
import { X, Upload, ChevronLeft, ChevronRight, Maximize2, XCircle, Plus, Eye, Trash, FileIcon } from "lucide-react"
import { clsx } from "clsx"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
  logo: boolean;
  mockup: boolean;
}

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
  onPreview?: () => void
  className?: string
  file: File
}

const FilePreview = ({ preview, loading, error, onRemove, file, className }: FilePreviewProps) => {
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

  // Check if preview is a data URL (image) or filename (vector)
  const isImage = preview.startsWith('data:image')

  return (
    <div className={cn("relative group", className)}>
      {isImage ? (
        <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
      ) : (
        <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4 text-center">
          <FileIcon className="mx-auto mb-2 text-foreground-muted" size={24} />
          <p className="text-sm text-foreground-muted truncate">{preview}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        {onRemove && (
          <Button
            isIconOnly
            variant="light"
            onPress={onRemove}
            className="bg-accent backdrop-blur-sm"
          >
            <Trash className="text-foreground" size={20} />
          </Button>
        )}
      </div>
    </div>
  )
}

export const SubmitLogoModal = ({ isOpen, onClose }: SubmitLogoModalProps) => {
  const router = useRouter()
  
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [designerName, setDesignerName] = React.useState("")
  const [twitter, setTwitter] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [logoTitle, setLogoTitle] = React.useState("")
  const [logoPreview, setLogoPreview] = React.useState<FilePreviewData | null>(null)
  const [mockupPreviews, setMockupPreviews] = React.useState<FilePreviewData[]>([])
  const [previewOpen, setPreviewOpen] = React.useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    logo: false,
    mockup: false
  })
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>()
  const [showSuccess, setShowSuccess] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const mockupInputRef = useRef<HTMLInputElement>(null)

  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const MAX_MOCKUPS = 6;
  const LOGO_EXTENSIONS = ['.ai', '.eps', '.svg', '.pdf'];
  const MOCKUP_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  interface FileValidationResult {
    isValid: boolean;
    error?: string;
    details?: {
      size: number;
      type: string;
      name: string;
    };
  }

  const validateFile = (file: File, type: 'logo' | 'mockup'): FileValidationResult => {
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const validExtensions = type === 'logo' ? LOGO_EXTENSIONS : MOCKUP_EXTENSIONS;
    
    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File ${file.name} is too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
        details: {
          size: file.size,
          type: fileExt,
          name: file.name
        }
      };
    }

    // Type validation
    if (!validExtensions.includes(fileExt)) {
      return {
        isValid: false,
        error: `Invalid file type for ${file.name}. ${type === 'logo' 
          ? 'Please upload AI, EPS, SVG or PDF files for logos'
          : 'Please upload JPG, PNG, WEBP or GIF files for mockups'}`,
        details: {
          size: file.size,
          type: fileExt,
          name: file.name
        }
      };
    }

    return {
      isValid: true,
      details: {
        size: file.size,
        type: fileExt,
        name: file.name
      }
    };
  };

  const handleDelete = (type: 'logo' | 'mockup', id?: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    if (type === 'logo') {
      setLogoPreview(null)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
      toast.success("Logo deleted successfully")
    } else if (type === 'mockup' && id) {
      setMockupPreviews(prev => prev.filter(p => p.id !== id))
      if (mockupInputRef.current) {
        mockupInputRef.current.value = ''
      }
      toast.success("Mockup deleted successfully")
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

      const validation = await validateFile(file, 'mockup')
      if (!validation.isValid) {
        toast.error(validation.error)
        continue
      }

      try {
        const preview = await createFilePreview(file)
        setMockupPreviews(prev => {
          // Double-check we don't exceed limit
          if (prev.length >= MAX_MOCKUPS) {
            toast.error(`Maximum ${MAX_MOCKUPS} mockups allowed`)
            return prev
          }
          return [...prev, {
            id: crypto.randomUUID(),
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
    if (mockupInputRef.current) {
      mockupInputRef.current.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent, type: 'logo' | 'mockup') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      [type]: e.type === "dragenter" || e.type === "dragover"
    }));
  };

  const handleLogoUpload = async (files: FileList | null) => {
    console.log('handleLogoUpload called with files:', files?.length)
    if (!files?.length) return
    
    const file = files[0]
    console.log('Attempting to upload logo file:', file.name, 'type:', file.type)
    
    const validation = await validateFile(file, 'logo')
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
        loading: false
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000) // Reset after 2 seconds
      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error("Error previewing file")
    } finally {
      setLoading(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = '' // Reset input
      }
    }
  }

  const handleDrop = async (e: React.DragEvent, type: 'logo' | 'mockup') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      [type]: false
    }));

    const files = Array.from(e.dataTransfer.files);
    
    if (type === 'logo') {
      if (files.length > 1) {
        toast.error('Please upload only one logo file');
        return;
      }
      
      const validation = validateFile(files[0], 'logo');
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      // Pass the original FileList for logo upload
      handleLogoUpload(e.dataTransfer.files);
    } else {
      // Handle mockup files
      const validFiles = files.filter(file => {
        const validation = validateFile(file, 'mockup');
        if (!validation.isValid) {
          toast.error(validation.error);
          return false;
        }
        return true;
      });

      if (validFiles.length) {
        // Create a DataTransfer object to convert array back to FileList
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        handleMockupsUpload(dataTransfer.files);
      }
    }
  };

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
    setUploadProgress([{ 
      id: 'logo', 
      progress: 0, 
      status: 'uploading', 
      fileName: logoPreview.file.name,
      fileSize: logoPreview.file.size 
    }])

    try {
      const formData = new FormData()
      formData.append('designerName', designerName)
      formData.append('email', email)
      if (twitter) formData.append('twitter', twitter)
      formData.append('description', description)
      formData.append('logo', logoPreview.file)
      formData.append('logoTitle', logoTitle)
      
      mockupPreviews.forEach(preview => {
        formData.append('mockup', preview.file)
      })

      setUploadProgress(prev => prev.map(p => ({ ...p, progress: 30 })))

      const response = await fetch('/api/submit-logo', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(prev => prev.map(p => ({ ...p, progress: 60 })))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit logo')
      }

      setUploadProgress(prev => prev.map(p => ({ ...p, progress: 100, status: 'completed' })))
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Submission error:', error)
      setUploadProgress(prev => prev.map(p => ({ 
        ...p, 
        progress: 100, 
        status: 'error' 
      })))
      toast.error(error instanceof Error ? error.message : 'Failed to submit logo')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousImage = () => {
    setCurrentMockupIndex(prev => {
      const newIndex = prev === 0 ? mockupPreviews.length - 1 : prev - 1
      setPreviewOpen(mockupPreviews[newIndex].preview)
      return newIndex
    })
  }

  const handleNextImage = () => {
    setCurrentMockupIndex(prev => {
      const newIndex = prev === mockupPreviews.length - 1 ? 0 : prev + 1
      setPreviewOpen(mockupPreviews[newIndex].preview)
      return newIndex
    })
  }

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

  React.useEffect(() => {
    if (previewOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [previewOpen, currentMockupIndex])

  const resetForm = () => {
    setEmail("")
    setDesignerName("")
    setTwitter("")
    setDescription("")
    setLogoTitle("")
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
      toast.success("Logo deleted successfully")
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="full"
      hideCloseButton
      classNames={{
        base: "bg-background/95 backdrop-blur-xl h-[100dvh] m-0 fixed inset-0 z-[100]",
        wrapper: "p-0 h-[100dvh] m-0",
        backdrop: "opacity-100",
        body: "p-0 h-full"
      }}
    >
      <ModalContent>
        <div className="relative h-[100dvh] overflow-y-auto">
          <Button
            isIconOnly
            className="fixed right-4 top-4 z-[101] bg-background/20 backdrop-blur-sm border border-border hover:bg-accent"
            size="sm"
            onPress={onClose}
          >
            <X size={18} />
          </Button>

          <div className="container mx-auto px-4 py-24">
            <div className="space-y-4 text-center mb-16">
              <span className="font-mono text-sm tracking-wider opacity-50 uppercase block">
                Submit Logo
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Share your creation
              </h2>
              <p className="text-sm text-foreground-muted max-w-xl mx-auto">
                Give your unused logo a second chance at life. And get paid generously for it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
              <Input
                type="text"
                label="Designer Name"
                placeholder="Enter your name"
                value={designerName}
                onChange={(e) => setDesignerName(e.target.value)}
                isRequired
                errorMessage={errors.designerName}
                isInvalid={!!errors.designerName}
                classNames={{
                  label: "text-foreground-muted text-sm",
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-background/20",
                    "backdrop-blur-sm",
                    "border border-border",
                    "hover:border-border-strong",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />

              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                errorMessage={errors.email}
                isInvalid={!!errors.email}
                classNames={{
                  label: "text-foreground-muted text-sm",
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-background/20",
                    "backdrop-blur-sm",
                    "border border-border",
                    "hover:border-border-strong",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />

              <div className="relative">
                <Input
                  type="text"
                  label="Twitter (Optional)"
                  placeholder="username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value.replace('@', ''))}
                  startContent={
                    <span className="text-foreground-subtle">@</span>
                  }
                  classNames={{
                    label: "text-foreground-muted text-sm",
                    input: "bg-transparent text-sm pl-1",
                    inputWrapper: [
                      "bg-background/20",
                      "backdrop-blur-sm",
                      "border border-border",
                      "hover:border-border-strong",
                      "px-3",
                      "!rounded-lg",
                    ],
                    innerWrapper: "flex items-center",
                  }}
                />
              </div>

              <Input
                type="text"
                label="Logo Name"
                placeholder="Enter a name for your logo"
                value={logoTitle}
                onChange={(e) => setLogoTitle(e.target.value)}
                isRequired
                errorMessage={errors.logoTitle}
                isInvalid={!!errors.logoTitle}
                classNames={{
                  label: "text-foreground-muted text-sm",
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-background/20",
                    "backdrop-blur-sm",
                    "border border-border",
                    "hover:border-border-strong",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />

              <Textarea
                label="Description"
                placeholder="Tell us about your logo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isRequired
                errorMessage={errors.description}
                isInvalid={!!errors.description}
                classNames={{
                  label: "text-foreground-muted text-sm",
                  input: "bg-transparent text-sm",
                  inputWrapper: [
                    "bg-background/20",
                    "backdrop-blur-sm",
                    "border border-border",
                    "hover:border-border-strong",
                    "px-3",
                    "!rounded-lg",
                  ]
                }}
              />

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Logo
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".ai,.eps,.svg,.pdf"
                  onChange={(e) => handleLogoUpload(e.target.files)}
                  className="hidden"
                  id="logo-upload"
                />
                
                <div
                  className={cn(
                    "relative transition-all duration-300 rounded-xl",
                    dragState.logo ? "ring-2 ring-foreground/40 scale-[0.99]" : "",
                    errors.logo ? "ring-2 ring-red-500/50" : "",
                    showSuccess ? "ring-2 ring-green-500/50" : ""
                  )}
                  onClick={() => logoInputRef.current?.click()}
                  onDragEnter={(e) => handleDrag(e, 'logo')}
                  onDragLeave={(e) => handleDrag(e, 'logo')}
                  onDragOver={(e) => handleDrag(e, 'logo')}
                  onDrop={(e) => handleDrop(e, 'logo')}
                  role="button"
                  aria-label="Upload logo"
                >
                  <div className="relative w-full p-8 rounded-xl bg-background/20 backdrop-blur-sm border border-border hover:border-border-strong">
                    {logoPreview ? (
                      <FilePreview
                        preview={logoPreview.preview}
                        loading={logoPreview.loading}
                        error={logoPreview.error}
                        onRemove={handleLogoDelete}
                        file={logoPreview.file}
                        className={cn(
                          "transition-all",
                          logoPreview && !errors.logo ? "border-green-500/20" : ""
                        )}
                      />
                    ) : (
                      <div className={cn(
                        "text-center transition-all",
                        dragState.logo ? "scale-105" : ""
                      )}>
                        <Upload className="mx-auto text-foreground-muted" size={24} />
                        <p className="text-foreground-muted">
                          {dragState.logo ? "Drop to upload logo" : "Drop your logo file or click to browse"}
                        </p>
                        <p className="text-xs text-foreground-subtle mt-1">Supported formats: AI, EPS, SVG, PDF</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
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
                  className={`
                    group relative transition-all
                    ${dragState.mockup ? 'ring-2 ring-foreground/20 scale-[0.99]' : ''}
                  `}
                  onDragEnter={(e) => handleDrag(e, 'mockup')}
                  onDragLeave={(e) => handleDrag(e, 'mockup')}
                  onDragOver={(e) => handleDrag(e, 'mockup')}
                  onDrop={(e) => handleDrop(e, 'mockup')}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div 
                    className="relative w-full p-8 rounded-xl bg-background/20 backdrop-blur-sm border border-border hover:border-border-strong transition-colors text-center"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && mockupInputRef.current?.click()}
                    onClick={() => mockupInputRef.current?.click()}
                  >
                    {mockupPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {mockupPreviews.map((preview) => (
                          <div 
                            key={preview.id} 
                            className="relative aspect-square bg-background/20 rounded-lg overflow-hidden group"
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
                            <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                isIconOnly
                                variant="light"
                                onPress={() => setPreviewOpen(preview.preview)}
                                className="bg-accent backdrop-blur-sm"
                              >
                                <Eye className="text-foreground" size={20} />
                              </Button>
                              <Button
                                isIconOnly
                                variant="light"
                                onPress={() => handleDelete('mockup', preview.id)}
                                className="bg-accent backdrop-blur-sm"
                              >
                                <Trash className="text-foreground" size={20} />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {mockupPreviews.length < 6 && (
                          <Button
                            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-border-strong flex items-center justify-center bg-transparent"
                            onPress={() => mockupInputRef.current?.click()}
                          >
                            <Plus size={24} className="text-foreground-muted" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-foreground-muted" size={24} />
                        <div>
                          <p className="text-foreground-muted">Drop up to 6 mockup images or click to browse</p>
                          <p className="text-xs text-foreground-subtle mt-1">Supported formats: PNG, JPG, WEBP, GIF</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-sm font-medium"
                isLoading={loading}
              >
                Submit Logo
              </Button>
            </form>
          </div>
        </div>
      </ModalContent>

      <Modal 
        isOpen={!!previewOpen} 
        onClose={() => setPreviewOpen(null)}
        size="2xl"
        hideCloseButton
        classNames={{
          base: "bg-background/95 backdrop-blur-xl",
          wrapper: "p-4"
        }}
      >
        <ModalContent>
          <div className="relative">
            <Button
              isIconOnly
              className="absolute right-4 top-4 z-10 bg-background/20 backdrop-blur-sm border border-border hover:bg-accent"
              size="sm"
              onPress={() => setPreviewOpen(null)}
            >
              <X size={18} />
            </Button>

            {mockupPreviews.length > 1 && (
              <>
                <Button
                  isIconOnly
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/20 backdrop-blur-sm border border-border hover:bg-accent"
                  size="sm"
                  onPress={handlePreviousImage}
                >
                  <ChevronLeft size={18} />
                </Button>

                <Button
                  isIconOnly
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/20 backdrop-blur-sm border border-border hover:bg-accent"
                  size="sm"
                  onPress={handleNextImage}
                >
                  <ChevronRight size={18} />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-foreground-muted text-sm">
                  {currentMockupIndex + 1} / {mockupPreviews.length}
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

      {uploadProgress.length > 0 && (
        <div className="space-y-2 mt-4">
          {uploadProgress.map((progress) => (
            <div key={progress.id} className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground-muted">{progress.fileName}</span>
                <span className="text-foreground-subtle">
                  {progress.status === 'completed' 
                    ? 'Completed' 
                    : `${progress.progress}%`}
                </span>
              </div>
              <div className="h-1 bg-accent rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-200 ${
                    progress.status === 'error' 
                      ? 'bg-red-500' 
                      : progress.status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
} 