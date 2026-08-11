'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  type AskUserAnswer,
  type AskUserQuestion,
  AskUserQuestions,
} from '@/components/ui/ask-user-questions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropZone } from '@/components/ui/drop-zone'
import { FileThumbnail } from '@/components/ui/file-thumbnail'
import { InputMessage } from '@/components/ui/input-message'
import { useIcon } from '@/lib/icon-context'
import { useShape } from '@/lib/shape-context'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/utils'
import { SuccessScreen } from './SuccessScreen'

interface SubmitLogoModalProps {
  isOpen: boolean
  onClose: () => void
}

type Phase = 'questions' | 'logo' | 'mockups' | 'success'

const LOGO_ACCEPT = '.ai,.eps,.svg,.pdf,application/pdf,image/svg+xml'
const MOCKUP_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif'
const LOGO_EXTENSIONS = ['.ai', '.eps', '.svg', '.pdf']
const MOCKUP_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_MOCKUPS = 6
const MAX_FILE_SIZE = 10 * 1024 * 1024

const stepMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12, transition: spring.moderate.exit },
  transition: spring.moderate,
}

function fileExt(file: File) {
  const i = file.name.lastIndexOf('.')
  return i >= 0 ? file.name.toLowerCase().slice(i) : ''
}

function isLogoFile(file: File) {
  return LOGO_EXTENSIONS.includes(fileExt(file))
}

function isMockupFile(file: File) {
  const ext = fileExt(file)
  return MOCKUP_EXTENSIONS.includes(ext) || file.type.startsWith('image/')
}

function answerText(answers: Record<string, AskUserAnswer>, id: string) {
  const a = answers[id]
  if (!a || a.skipped) return ''
  return (a.otherText ?? '').trim()
}

const QUESTIONS: AskUserQuestion[] = [
  {
    id: 'designerName',
    title: 'What’s your name?',
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: 'Your name',
    skippable: false,
    freeTextValidate: (value) => (value.trim() ? null : 'Add your name'),
  },
  {
    id: 'email',
    title: 'What’s your email?',
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: 'you@studio.com',
    skippable: false,
    freeTextValidate: (value) => {
      const v = value.trim()
      if (!v.includes('@')) return 'Include an @ in your email'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Check that email and try again'
      return null
    },
  },
  {
    id: 'twitter',
    title: 'Got an X handle? (optional)',
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: '@handle',
    skippable: true,
    nextLabel: 'Continue',
  },
]

export const SubmitLogoModal = ({ isOpen, onClose }: SubmitLogoModalProps) => {
  const Plus = useIcon('plus')
  const X = useIcon('x')
  const ArrowLeft = useIcon('arrow-left')
  const shape = useShape()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const mockupInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('questions')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AskUserAnswer>>({})
  const [story, setStory] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [mockups, setMockups] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const designerName = answerText(answers, 'designerName')
  const email = answerText(answers, 'email')
  const twitterRaw = answerText(answers, 'twitter')
  const twitter = twitterRaw.replace(/^@/, '')

  const hasProgress = useMemo(() => {
    return (
      designerName.length > 0 ||
      email.length > 0 ||
      twitterRaw.length > 0 ||
      story.trim().length > 0 ||
      !!logoFile ||
      mockups.length > 0 ||
      phase !== 'questions'
    )
  }, [designerName, email, twitterRaw, story, logoFile, mockups.length, phase])

  const reset = useCallback(() => {
    setPhase('questions')
    setQuestionIndex(0)
    setAnswers({})
    setStory('')
    setLogoFile(null)
    setMockups([])
    setLoading(false)
    if (logoInputRef.current) logoInputRef.current.value = ''
    if (mockupInputRef.current) mockupInputRef.current.value = ''
  }, [])

  const requestClose = useCallback(() => {
    if (phase === 'success') {
      reset()
      onClose()
      return
    }
    if (hasProgress && !window.confirm('Leave without submitting?')) {
      return
    }
    reset()
    onClose()
  }, [hasProgress, onClose, phase, reset])

  const handleQuestionsComplete = useCallback((next: Record<string, AskUserAnswer>) => {
    setAnswers(next)
    setPhase('logo')
  }, [])

  const pickLogoFile = useCallback((file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit`)
      return
    }
    if (!isLogoFile(file)) {
      toast.error('Use an editable logo file (AI, EPS, SVG, or PDF)')
      return
    }
    setLogoFile(file)
  }, [])

  const handleLogoDrop = useCallback(
    (files: File[]) => {
      if (files.length > 1) toast.error('Drop one editable file')
      pickLogoFile(files[0])
    },
    [pickLogoFile],
  )

  const addMockups = useCallback((incoming: File[]) => {
    setMockups((prev) => {
      const next = [...prev]
      for (const file of incoming) {
        if (next.length >= MAX_MOCKUPS) {
          toast.error(`Up to ${MAX_MOCKUPS} mockup images`)
          break
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit`)
          continue
        }
        if (!isMockupFile(file)) {
          toast.error(`${file.name} isn’t an image mockup`)
          continue
        }
        const dup = next.some(
          (f) =>
            f.name === file.name && f.size === file.size && f.lastModified === file.lastModified,
        )
        if (!dup) next.push(file)
      }
      return next
    })
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      const description = text.trim()
      if (!description) {
        toast.error('Add a short description')
        return
      }
      if (!designerName || !email) {
        toast.error('Finish the quick questions first')
        setPhase('questions')
        return
      }
      if (!logoFile) {
        toast.error('Add an editable logo file first')
        setPhase('logo')
        return
      }

      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('designerName', designerName)
        formData.append('email', email)
        if (twitter) formData.append('twitter', twitter)
        formData.append('description', description)
        formData.append('logo', logoFile)
        mockups.forEach((file) => formData.append('mockup', file))

        const response = await fetch('/api/submit-logo', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(typeof error.error === 'string' ? error.error : 'Failed to submit logo')
        }

        setPhase('success')
      } catch (error) {
        console.error('Submission error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to submit logo')
      } finally {
        setLoading(false)
      }
    },
    [designerName, email, twitter, logoFile, mockups],
  )

  // Enter continues from the logo step when a file is ready.
  useEffect(() => {
    if (phase !== 'logo' || !logoFile || loading) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      e.preventDefault()
      setPhase('mockups')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, logoFile, loading])

  const title =
    phase === 'success'
      ? 'Got it'
      : phase === 'logo'
        ? 'Editable file'
        : phase === 'mockups'
          ? 'Mockups & note'
          : 'Revive to earn'

  const description =
    phase === 'success'
      ? 'We’ll review it and email you.'
      : phase === 'logo'
        ? 'Drop your AI, EPS, SVG, or PDF — one source file.'
        : phase === 'mockups'
          ? 'Optional mockups, then a short note about the logo.'
          : 'Sell an unused logo. A few quick questions first.'

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose()
      }}
    >
      <DialogContent placement="right" className="border border-border bg-background shadow-none">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative max-h-[70vh] overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'questions' && (
              <motion.div key="questions" {...stepMotion} className="-mx-1 px-1">
                <AskUserQuestions
                  questions={QUESTIONS}
                  currentIndex={questionIndex}
                  onCurrentIndexChange={setQuestionIndex}
                  answers={answers}
                  onAnswersChange={setAnswers}
                  onComplete={handleQuestionsComplete}
                  className="max-w-none border-0 bg-transparent"
                />
              </motion.div>
            )}

            {phase === 'logo' && (
              <motion.div key="logo" {...stepMotion} className="flex flex-col gap-4">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={LOGO_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    pickLogoFile(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />

                <DropZone
                  active={!!logoFile}
                  disabled={loading}
                  label="Drop editable file or click to browse"
                  hint="AI, EPS, SVG, or PDF"
                  onBrowse={() => logoInputRef.current?.click()}
                  onDropFiles={handleLogoDrop}
                >
                  {logoFile ? (
                    <div className="flex items-center gap-3">
                      <FileThumbnail file={logoFile} size={56} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-caption text-foreground">{logoFile.name}</p>
                        <p className="text-metadata text-foreground-subtle">
                          {(logoFile.size / 1024).toFixed(0)} KB
                        </p>
                        <button
                          type="button"
                          className="mt-1 text-caption text-foreground-muted underline-offset-2 hover:text-foreground hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            logoInputRef.current?.click()
                          }}
                        >
                          Replace file
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove editable file"
                        disabled={loading}
                        onClick={(e) => {
                          e.stopPropagation()
                          setLogoFile(null)
                        }}
                      >
                        <X size={14} strokeWidth={2} />
                      </Button>
                    </div>
                  ) : null}
                </DropZone>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leadingIcon={ArrowLeft}
                    disabled={loading}
                    onClick={() => setPhase('questions')}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!logoFile || loading}
                    onClick={() => setPhase('mockups')}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Continue
                      <kbd
                        aria-hidden
                        className={cn(
                          'hidden h-[18px] min-w-[18px] items-center justify-center px-1 text-[11px] leading-none sm:inline-flex',
                          'bg-background/15 text-background',
                          shape.bg,
                        )}
                      >
                        ↵
                      </kbd>
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}

            {phase === 'mockups' && (
              <motion.div key="mockups" {...stepMotion} className="flex flex-col gap-4">
                <input
                  ref={mockupInputRef}
                  type="file"
                  accept={MOCKUP_ACCEPT}
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addMockups(Array.from(event.target.files ?? []))
                    event.target.value = ''
                  }}
                />

                <DropZone
                  active={mockups.length > 0}
                  disabled={loading || mockups.length >= MAX_MOCKUPS}
                  label="Drop mockups or click to browse"
                  hint={`PNG, JPG, WEBP, or GIF · up to ${MAX_MOCKUPS}`}
                  onBrowse={() => mockupInputRef.current?.click()}
                  onDropFiles={addMockups}
                >
                  {mockups.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      <AnimatePresence initial={false}>
                        {mockups.map((file) => (
                          <motion.div
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92, transition: spring.fast.exit }}
                            transition={spring.fast}
                            className={cn(
                              'group relative aspect-square overflow-hidden border border-border bg-card',
                              shape.bg,
                            )}
                          >
                            <FileThumbnail file={file} size={120} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove ${file.name}`}
                              className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                              disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation()
                                setMockups((prev) => prev.filter((f) => f !== file))
                              }}
                            >
                              <X size={14} strokeWidth={2} />
                            </Button>
                          </motion.div>
                        ))}
                        {mockups.length < MAX_MOCKUPS && (
                          <motion.button
                            key="add-mockup"
                            type="button"
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92, transition: spring.fast.exit }}
                            transition={spring.fast}
                            disabled={loading}
                            onClick={(e) => {
                              e.stopPropagation()
                              mockupInputRef.current?.click()
                            }}
                            className={cn(
                              'flex aspect-square items-center justify-center border border-dashed border-border text-foreground-muted transition-colors hover:border-foreground/20 hover:text-foreground',
                              shape.bg,
                            )}
                            aria-label="Add another mockup"
                          >
                            <Plus size={20} strokeWidth={2} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : null}
                </DropZone>

                <InputMessage
                  value={story}
                  onValueChange={setStory}
                  placeholder="What is this logo, and who is it for?"
                  sendLabel="Submit"
                  disabled={loading}
                  minRows={3}
                  maxRows={8}
                  onSend={(text) => {
                    void handleSend(text)
                  }}
                />

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leadingIcon={ArrowLeft}
                    disabled={loading}
                    onClick={() => setPhase('logo')}
                  >
                    Back
                  </Button>
                  {loading && <p className="text-caption text-foreground-subtle">Sending…</p>}
                </div>
              </motion.div>
            )}

            {phase === 'success' && (
              <motion.div key="success" {...stepMotion}>
                <SuccessScreen
                  embedded
                  onClose={() => {
                    reset()
                    onClose()
                  }}
                  onSubmitAnother={() => {
                    reset()
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
