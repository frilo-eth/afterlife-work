import { Modal, ModalContent, Button } from "@nextui-org/react"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface SuccessScreenProps {
  onClose: () => void
  onSubmitAnother: () => void
}

export function SuccessScreen({ onClose, onSubmitAnother }: SuccessScreenProps) {
  const router = useRouter()

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleClose = () => {
    onClose()
    router.push('/')
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
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
        <div className="h-full flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-center">
          <Image
            src="/oktomb.svg"
            alt="Success"
            width={120}
            height={120}
            className="mb-8"
            priority
          />
          <h2 className="text-3xl font-bold mb-4">Submission Successful!</h2>
          <div className="text-center text-foreground mt-4 mb-10">
            We&apos;ve received your submission! Our team will review it shortly.
          </div>
          <div className="flex gap-4">
            <Button
              variant="bordered"
              className="border-border hover:bg-secondary h-12"
              onPress={handleClose}
            >
              Back Home
            </Button>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90 h-12"
              onPress={onSubmitAnother}
            >
              Submit Another Logo
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
} 