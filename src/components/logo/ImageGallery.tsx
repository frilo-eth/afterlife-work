'use client'

import { useState, useEffect, useCallback } from "react"
import { Image, Button } from "@nextui-org/react"
import { Modal, ModalContent, ModalBody } from "@nextui-org/react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previewIndex, setPreviewIndex] = useState(0)

  // Memoize navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Keyboard navigation with memoized handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev])

  return (
    <>
      <div className="space-y-4">
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
          <Button 
            className="w-full h-full p-0 bg-transparent min-w-0 rounded-none [transform:none!important]"
            onPress={() => {
              setCurrentIndex(previewIndex)
              setIsOpen(true)
            }}
          >
            <Image
              src={images[previewIndex]}
              alt={title}
              classNames={{
                wrapper: "w-full h-full rounded-none",
                img: "w-full h-full object-cover rounded-none [transform:none!important]"
              }}
            />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {images.map((image, index) => (
              <div 
                key={image}
                className={`w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 transition-colors
                  ${previewIndex === index 
                    ? 'border border-white/20' 
                    : 'border border-white/10 hover:border-white/20'}`}
              >
                <Button
                  className="w-full h-full p-0 min-w-0 bg-transparent rounded-none [transform:none!important]"
                  onPress={() => setPreviewIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${title} - ${index + 1}`}
                    classNames={{
                      wrapper: "w-full h-full rounded-none",
                      img: "w-full h-full object-cover rounded-none [transform:none!important]"
                    }}
                  />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal 
        size="full" 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        hideCloseButton
        className="bg-black/95 backdrop-blur-xl"
      >
        <ModalContent>
          <ModalBody className="flex items-center justify-center p-0">
            <Button
              isIconOnly
              className="fixed right-4 top-4 z-50 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
              size="sm"
              onPress={() => setIsOpen(false)}
            >
              <X size={18} />
            </Button>

            <Button
              isIconOnly
              onPress={handlePrev}
              className="absolute left-4 z-50 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
              variant="bordered"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Image
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-h-screen object-contain"
            />
            
            <Button
              isIconOnly
              onPress={handleNext}
              className="absolute right-4 z-50 bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
              variant="bordered"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 