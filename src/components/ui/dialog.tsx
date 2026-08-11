'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { useIcon } from '@/lib/icon-context'
import { useShape } from '@/lib/shape-context'
import { exitFallbackMs, spring } from '@/lib/springs'
import { surfaceClasses } from '@/lib/surface-classes'
import { SurfaceProvider, useSurface } from '@/lib/surface-context'
import { cn } from '@/lib/utils'

const DIALOG_OFFSET = 4

const DialogOpenContext = createContext(false)

function Dialog({
  children,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  ...props
}: DialogPrimitive.DialogProps) {
  // Internal state always tracks changes, and the consumer's onOpenChange is
  // notified alongside it — a listener must not replace state handling, or an
  // uncontrolled dialog with an onOpenChange prop could never open. The Root
  // below is always controlled by `open`, so defaultOpen seeds our state
  // instead of being forwarded.
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false)
  const open = controlledOpen ?? uncontrolledOpen
  const handleOpenChange = (next: boolean) => {
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <DialogOpenContext.Provider value={open}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props}>
        {children}
      </DialogPrimitive.Root>
    </DialogOpenContext.Provider>
  )
}

const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'lg'
  /** Hide the built-in corner close control when the caller supplies its own. */
  hideClose?: boolean
  /**
   * Where the panel sits.
   * - `center` — default modal
   * - `right` — top-right dock by the header CTA (bottom sheet on mobile)
   * - `fullscreen` — edge-to-edge takeover (submit / success flows)
   */
  placement?: 'center' | 'right' | 'fullscreen'
  /** Portal target. When set, the overlay and panel render inside this element
   *  (positioned `absolute`) instead of covering the viewport (`fixed`). Pair
   *  with a `position: relative; overflow: hidden` container — and usually
   *  `<Dialog modal={false}>` — to scope a dialog to a bounded region, e.g. a
   *  docs preview. Defaults to the document body / full-viewport behaviour. */
  container?: HTMLElement | null
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      className,
      children,
      size = 'sm',
      hideClose = false,
      placement = 'center',
      container,
      ...props
    },
    ref,
  ) => {
    const XIcon = useIcon('x')
    const open = useContext(DialogOpenContext)
    const shape = useShape()
    const substrate = useSurface()
    const dialogLevel = Math.min(substrate + DIALOG_OFFSET, 8)
    const [mounted, setMounted] = useState(false)
    // Right panels become bottom sheets below `sm` so they sit near the
    // thumb / CTA edge on phones; desktop keeps a top-right dock by the header.
    const [sheetBottom, setSheetBottom] = useState(() =>
      typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false,
    )
    const isRight = placement === 'right'
    const isFullscreen = placement === 'fullscreen'

    useEffect(() => {
      if (open) setMounted(true)
    }, [open])

    useEffect(() => {
      if (!isRight) {
        setSheetBottom(false)
        return
      }
      const mq = window.matchMedia('(max-width: 639px)')
      const update = () => setSheetBottom(mq.matches)
      update()
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }, [isRight])

    // Fallback release for the deferred unmount: onAnimationComplete on the
    // panel is the primary signal, but rAF-driven animation callbacks can
    // stall in throttled/background tabs — leaving an invisible full-screen
    // overlay (and Radix's scroll lock) in place. Both exit tweens run at
    // spring.slow.exit, so the fallback tracks that tier.
    useEffect(() => {
      if (open) return
      const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.slow))
      return () => clearTimeout(id)
    }, [open])

    const handleExitComplete = () => {
      if (!open) setMounted(false)
    }

    if (!mounted) return null

    const rightInitial = sheetBottom
      ? { opacity: 0, x: 0, y: 24 }
      : { opacity: 0, x: 20, y: 0 }
    const rightAnimate = sheetBottom
      ? { opacity: open ? 1 : 0, x: 0, y: open ? 0 : 24 }
      : { opacity: open ? 1 : 0, x: open ? 0 : 20, y: 0 }

    return (
      <DialogPrimitive.Portal forceMount container={container ?? undefined}>
        <DialogPrimitive.Overlay asChild forceMount>
          <motion.div
            className={cn(
              container ? 'absolute' : 'fixed',
              'inset-0 z-50',
              // Fullscreen panels own the canvas; keep the dimmer off so the
              // takeover reads as a page, not a card over a darkened site.
              isFullscreen ? 'bg-transparent' : 'bg-black/40 dark:bg-black/80',
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={open ? spring.slow : spring.slow.exit}
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content ref={ref} asChild forceMount {...props}>
          <motion.div
            className={cn(
              container ? 'absolute' : 'fixed',
              'z-50 focus:outline-none',
              !isFullscreen && surfaceClasses(dialogLevel),
              !isFullscreen && 'p-6',
              isFullscreen &&
                'inset-0 h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none border-0 bg-background p-0 shadow-none',
              // Mobile: bottom sheet. Desktop: top-right, under the header CTA.
              isRight &&
                'inset-x-4 bottom-4 top-auto max-h-[min(85dvh,40rem)] w-auto overflow-y-auto sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:w-[min(100%-2rem,28rem)]',
              !isRight && !isFullscreen && 'left-1/2 top-1/2 w-[calc(100%-2rem)]',
              !isRight && !isFullscreen && size === 'sm' && 'max-w-[400px]',
              !isRight && !isFullscreen && size === 'lg' && 'max-w-[540px]',
              !isFullscreen && shape.container,
              className,
            )}
            initial={
              isFullscreen
                ? { opacity: 0 }
                : isRight
                  ? rightInitial
                  : { opacity: 0, scale: 0.97, x: '-50%', y: '-50%' }
            }
            animate={
              isFullscreen
                ? { opacity: open ? 1 : 0 }
                : isRight
                  ? rightAnimate
                  : {
                      opacity: open ? 1 : 0,
                      scale: open ? 1 : 0.97,
                      x: '-50%',
                      y: '-50%',
                    }
            }
            transition={open ? spring.slow : spring.slow.exit}
            onAnimationComplete={handleExitComplete}
          >
            <SurfaceProvider value={isFullscreen ? substrate : dialogLevel}>
              {children}
              {!hideClose && (
                <DialogPrimitive.Close asChild>
                  <Button variant="ghost" size="icon-sm" className="absolute right-3 top-3">
                    <XIcon />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogPrimitive.Close>
              )}
            </SurfaceProvider>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )
  },
)
DialogContent.displayName = 'DialogContent'

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 mb-4', className)} {...props} />
}

function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end gap-2 mt-6', className)} {...props} />
}

const DialogTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[16px] text-foreground leading-tight', className)}
    style={{ fontVariationSettings: "'wght' 700" }}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
