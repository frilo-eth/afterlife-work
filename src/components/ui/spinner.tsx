import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  /** Describes what is loading. Rendered for assistive tech only. */
  label?: string
}

/**
 * Indeterminate progress.
 *
 * The @fluid registry ships no spinner — its ThinkingIndicator is shaped for
 * AI work, not page loads — so this is built on the project's own tokens.
 *
 * Rotation is the one place a purely decorative animation earns its place:
 * it is the signal that something is still happening. It stops under reduced
 * motion, where the label carries the meaning instead.
 */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={cn(
          'inline-block animate-spin rounded-full border-2 border-border border-t-foreground motion-reduce:animate-none',
          'h-5 w-5',
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
