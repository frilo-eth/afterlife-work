'use client'

import React from 'react'
import { XCircle, Maximize2, Loader2 } from 'lucide-react'
import { Button } from '@nextui-org/react'
import Image from 'next/image'
import { toast } from 'sonner'

interface FilePreviewProps {
  preview: string
  loading?: boolean
  error?: string
  onRemove?: () => void
  onPreview?: () => void
  className?: string
  file?: File
}

export const FilePreview = ({ 
  preview, 
  loading, 
  error, 
  onRemove,
  onPreview,
  className = "",
  file
}: FilePreviewProps) => {
  // Helper to check if file is a vector (excluding SVG)
  const isNonPreviewableVector = file?.name.match(/\.(ai|eps|pdf)$/i)
  const isSvg = file?.name.toLowerCase().endsWith('.svg')
  
  const handleRemove = () => {
    if (onRemove && window.confirm('Are you sure you want to delete this file?')) {
      onRemove()
      toast.success("File deleted successfully")
    }
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      ) : null}
      
      <div className="group relative aspect-square">
        {isNonPreviewableVector ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 rounded-lg p-4">
            <img 
              src="/file-vector.svg"
              alt="File icon" 
              className="w-12 h-12 mb-2"
            />
            <p className="text-sm text-gray-600 truncate max-w-full">
              {file?.name}
            </p>
          </div>
        ) : isSvg ? (
          <Image
            src={preview}
            alt="SVG preview"
            fill
            className="object-contain rounded-lg p-4"
          />
        ) : (
          <Image
            src={preview}
            alt="File preview"
            fill
            className="object-cover rounded-lg"
          />
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {/* Only show preview for SVG files */}
          {isSvg && onPreview && (
            <Button
              isIconOnly
              size="sm"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={onPreview}
            >
              <Maximize2 size={16} />
            </Button>
          )}
          {onRemove && (
            <Button
              isIconOnly
              size="sm"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={handleRemove}
            >
              <XCircle size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 