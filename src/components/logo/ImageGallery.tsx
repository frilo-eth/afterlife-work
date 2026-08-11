'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { type DragEvent as ReactDragEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  title: string
  /** Admin edit chrome: add / delete / drag-drop onto the strip. */
  editable?: boolean
  maxImages?: number
  disabled?: boolean
  onAdd?: () => void
  onDropFiles?: (files: File[]) => void
  /** Called with the index in the visible `images` array. */
  onDelete?: (index: number) => void
}

function GalleryImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const local = src.startsWith('blob:') || src.startsWith('data:')
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      unoptimized={local}
      className={className}
    />
  )
}

export function ImageGallery({
  images,
  title,
  editable = false,
  maxImages = 6,
  disabled = false,
  onAdd,
  onDropFiles,
  onDelete,
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const dragDepth = useRef(0)

  const canAdd = editable && !disabled && images.length < maxImages

  const handleNext = useCallback(() => {
    if (images.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrev = useCallback(() => {
    if (images.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    if (previewIndex >= images.length) {
      setPreviewIndex(Math.max(0, images.length - 1))
    }
  }, [images.length, previewIndex])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrev()
      if (event.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev])

  const onDragEnter = (e: ReactDragEvent) => {
    if (!editable || disabled || !onDropFiles) return
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current += 1
    setDragOver(true)
  }

  const onDragOver = (e: ReactDragEvent) => {
    if (!editable || disabled || !onDropFiles) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = (e: ReactDragEvent) => {
    if (!editable || disabled) return
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragOver(false)
  }

  const onDrop = (e: ReactDragEvent) => {
    if (!editable || disabled || !onDropFiles) return
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = 0
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) onDropFiles(files)
  }

  if (images.length === 0 && !editable) return null

  const galleryBody = (
    <>
      {images.length === 0 ? (
        <button
          type="button"
          disabled={disabled || !canAdd}
          onClick={onAdd}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'relative flex aspect-video w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed',
            'transition-[border-color,background-color,transform] duration-80',
            dragOver
              ? 'scale-[1.01] border-foreground/40 bg-hover'
              : 'border-border bg-card hover:border-foreground/20',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <Upload className="h-6 w-6 text-foreground-muted" />
          <p className="text-caption text-foreground-muted">
            {dragOver ? 'Drop to upload' : 'Drop gallery images or click to browse'}
          </p>
          <p className="text-metadata text-foreground-subtle">
            Up to {maxImages} · PNG, JPG, WEBP, GIF
          </p>
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Open ${title} at full size`}
          onClick={() => {
            setCurrentIndex(previewIndex)
            setIsOpen(true)
          }}
          onDragEnter={editable ? onDragEnter : undefined}
          onDragOver={editable ? onDragOver : undefined}
          onDragLeave={editable ? onDragLeave : undefined}
          onDrop={editable ? onDrop : undefined}
          className={cn(
            'relative block aspect-video w-full min-w-0 overflow-hidden rounded-xl border border-border',
            'transition-colors duration-quick ease-settle hover:border-foreground/20',
            dragOver && 'border-foreground/40',
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={images[previewIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={spring.fast}
              className="absolute inset-0"
            >
              <GalleryImage
                src={images[previewIndex]}
                alt={title}
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <p className="text-caption text-foreground">
                {canAdd ? 'Drop to add' : 'Gallery is full'}
              </p>
            </div>
          )}
        </button>
      )}

      {(images.length > 1 || (editable && images.length > 0)) && (
        <div className="relative min-w-0">
          <div className="gallery-scroller min-w-0 overflow-x-auto">
            <div className="flex w-max gap-3 pb-2 sm:gap-4">
              <AnimatePresence initial={false}>
                {images.map((image, index) => (
                  <motion.div
                    key={image}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, transition: spring.fast.exit }}
                    transition={spring.fast}
                    className="group relative"
                  >
                    <button
                      type="button"
                      aria-label={`Show image ${index + 1} of ${images.length}`}
                      aria-current={previewIndex === index}
                      onClick={() => setPreviewIndex(index)}
                      className={cn(
                        'relative aspect-video w-28 flex-shrink-0 overflow-hidden rounded-xl border sm:w-48 sm:rounded-2xl',
                        'transition-colors duration-quick ease-settle',
                        previewIndex === index
                          ? 'border-foreground/40'
                          : 'border-border hover:border-foreground/20',
                      )}
                    >
                      <GalleryImage
                        src={image}
                        alt=""
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    </button>
                    {editable && onDelete && !disabled && (
                      <Button
                        type="button"
                        variant="tertiary"
                        size="icon-sm"
                        aria-label={`Delete image ${index + 1}`}
                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(index)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </motion.div>
                ))}

                {canAdd && (
                  <motion.button
                    key="add-gallery"
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, transition: spring.fast.exit }}
                    transition={spring.fast}
                    onClick={onAdd}
                    onDragEnter={onDragEnter}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                      'flex aspect-video w-28 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-border sm:w-48 sm:rounded-2xl',
                      'text-foreground-muted transition-colors duration-quick ease-settle',
                      'hover:border-foreground/20 hover:text-foreground',
                      dragOver && 'border-foreground/40 bg-hover',
                    )}
                    aria-label="Add gallery image"
                  >
                    <Plus className="h-6 w-6" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[3px] right-0 top-0 w-16 bg-gradient-to-l from-background to-transparent"
          />
        </div>
      )}

      {editable && images.length > 0 && (
        <p className="text-metadata text-foreground-subtle">
          Gallery {images.length}/{maxImages}
          {canAdd ? ' · drop images on the hero or add tile' : ''}
        </p>
      )}
    </>
  )

  return (
    <>
      <div className="w-full min-w-0 space-y-4">{galleryBody}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideClose
          className="h-screen w-screen max-w-none border-0 bg-background/95 p-0 backdrop-blur-xl"
        >
          <DialogTitle className="sr-only">
            {title} — image {currentIndex + 1} of {images.length}
          </DialogTitle>

          <div className="relative flex h-full w-full items-center justify-center">
            <Button
              variant="tertiary"
              size="icon"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-50"
            >
              <X />
            </Button>

            {images.length > 1 && (
              <Button
                variant="tertiary"
                size="icon-lg"
                aria-label="Previous image"
                onClick={handlePrev}
                className="absolute left-4 z-50"
              >
                <ChevronLeft />
              </Button>
            )}

            <div className="relative h-full w-full">
              {images[currentIndex] && (
                <GalleryImage
                  src={images[currentIndex]}
                  alt={`${title} — image ${currentIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              )}
            </div>

            {images.length > 1 && (
              <Button
                variant="tertiary"
                size="icon-lg"
                aria-label="Next image"
                onClick={handleNext}
                className="absolute right-4 z-50"
              >
                <ChevronRight />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
