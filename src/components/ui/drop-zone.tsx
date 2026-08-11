'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { type DragEvent as ReactDragEvent, type ReactNode, useRef, useState } from 'react'
import { useShape } from '@/lib/shape-context'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  active?: boolean
  disabled?: boolean
  label: string
  hint?: string
  onBrowse: () => void
  onDropFiles: (files: File[]) => void
  children?: ReactNode
  className?: string
  /** When filled, still accept drops (e.g. replace / add more). Default false. */
  dropWhenFilled?: boolean
}

export function DropZone({
  active = false,
  disabled = false,
  label,
  hint,
  onBrowse,
  onDropFiles,
  children,
  className,
  dropWhenFilled = false,
}: DropZoneProps) {
  const shape = useShape()
  const [dragOver, setDragOver] = useState(false)
  const dragDepth = useRef(0)
  const isEmpty = !children

  const onDragEnter = (e: ReactDragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    if (!isEmpty && !dropWhenFilled) return
    dragDepth.current += 1
    setDragOver(true)
  }

  const onDragOver = (e: ReactDragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    if (!isEmpty && !dropWhenFilled) return
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = (e: ReactDragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragOver(false)
  }

  const onDrop = (e: ReactDragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = 0
    setDragOver(false)
    if (disabled) return
    if (!isEmpty && !dropWhenFilled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onDropFiles(files)
  }

  return (
    <div
      role={isEmpty ? 'button' : undefined}
      tabIndex={disabled || !isEmpty ? -1 : 0}
      aria-label={isEmpty ? label : undefined}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled && isEmpty) onBrowse()
      }}
      onKeyDown={(e) => {
        if (disabled || !isEmpty) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onBrowse()
        }
      }}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'relative w-full border text-left transition-[border-color,background-color,transform] duration-80',
        shape.container,
        isEmpty ? 'cursor-pointer p-8 text-center' : 'p-2',
        disabled && 'pointer-events-none opacity-50',
        dragOver || active
          ? 'border-foreground/40 bg-hover'
          : 'border-border bg-card hover:border-foreground/20',
        dragOver && 'scale-[1.01]',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {children ? (
          <motion.div
            key="filled"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: spring.fast.exit }}
            transition={spring.fast}
            className="relative"
          >
            {children}
            {dragOver && dropWhenFilled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-background/70"
              >
                <p className="text-caption text-foreground">Drop to replace</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: spring.fast.exit }}
            transition={spring.fast}
            className="space-y-1"
          >
            <p className="text-caption text-foreground-muted">
              {dragOver ? 'Drop to upload' : label}
            </p>
            {hint && <p className="text-metadata text-foreground-subtle">{hint}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
