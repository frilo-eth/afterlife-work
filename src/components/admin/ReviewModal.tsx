'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
    if (!message.trim()) return
    onSubmit(message)
    setMessage('')
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="review-message">Message to designer</Label>
          <Textarea
            id="review-message"
            placeholder="Enter your feedback…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {/*
            Rejection is destructive, so it reads as such rather than as the
            same neutral "primary" the request-changes flow uses.
          */}
          <Button
            variant={action === 'REJECT' ? 'secondary' : 'primary'}
            onClick={handleSubmit}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
