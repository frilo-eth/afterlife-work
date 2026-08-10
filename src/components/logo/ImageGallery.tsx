'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previewIndex, setPreviewIndex] = useState(0)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Arrow keys page through the lightbox. Escape is handled by the dialog.
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrev()
      if (event.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev])

  if (images.length === 0) return null

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          aria-label={`Open ${title} at full size`}
          onClick={() => {
            setCurrentIndex(previewIndex)
            setIsOpen(true)
          }}
          className="relative block aspect-video w-full overflow-hidden rounded-xl border border-border transition-colors duration-quick ease-settle hover:border-foreground/20"
        >
          <Image
            src={images[previewIndex]}
            alt={title}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        </button>

        {images.length > 1 && (
          <div className="relative">
            <div className="gallery-scroller overflow-x-auto">
              {/*
                A tablist-style strip of real buttons. These were NextUI Buttons
                wrapping images with transform overrides fighting the component's
                own press animation; plain buttons need none of that.
              */}
              <div className="flex gap-4 pb-2">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show image ${index + 1} of ${images.length}`}
                    aria-current={previewIndex === index}
                    onClick={() => setPreviewIndex(index)}
                    className={cn(
                      'relative aspect-video w-48 flex-shrink-0 overflow-hidden rounded-2xl border',
                      'transition-colors duration-quick ease-settle',
                      previewIndex === index
                        ? 'border-foreground/40'
                        : 'border-border hover:border-foreground/20',
                    )}
                  >
                    <Image src={image} alt="" fill sizes="192px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
            {/*
              Right-edge fade only. Stops above the 3px scrollbar track so the
              thumb stays fully visible and un-tinted.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[3px] right-0 top-0 w-16 bg-gradient-to-l from-background to-transparent"
            />
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideClose
          className="h-screen w-screen max-w-none border-0 bg-background/95 p-0 backdrop-blur-xl"
        >
          {/* Named for assistive tech; the lightbox itself is purely visual. */}
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
              <Image
                src={images[currentIndex]}
                alt={`${title} — image ${currentIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
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
