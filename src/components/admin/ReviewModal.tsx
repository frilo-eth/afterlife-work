import { useState } from 'react'
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Textarea
} from "@nextui-org/react"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: string) => void
  title: string
  action: 'REQUEST_CHANGES' | 'REJECT'
}

export function ReviewModal({ isOpen, onClose, onSubmit, title, action }: ReviewModalProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    onSubmit(message)
    setMessage('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Textarea
            label="Message to Designer"
            placeholder="Enter your feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            minRows={4}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isDisabled={!message.trim()}>
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 