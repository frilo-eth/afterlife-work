"use client"

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onDrop: (files: File[]) => void
  multiple?: boolean
  className?: string
  accept?: Record<string, string[]>
  children?: React.ReactNode
}

export function DropZone({ 
  onDrop, 
  multiple = false, 
  className,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp']
  },
  children 
}: DropZoneProps) {
  const onDropCallback = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles)
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    multiple,
    accept
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
        className
      )}
    >
      <input {...getInputProps()} />
      {children || (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop files here, or click to select"}
          </p>
        </div>
      )}
    </div>
  )
} 