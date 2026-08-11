import { toast } from 'sonner'

export const DESTRUCTIVE_UNDO_MS = 5000

interface ScheduleUndoableActionOptions {
  /** Short success-style message shown while the undo window is open. */
  message: string
  description?: string
  undoLabel?: string
  durationMs?: number
  /** Runs after the undo window if the user does not undo. */
  onCommit: () => void | Promise<void>
  /** Restores optimistic UI when the user undoes (or commit fails). */
  onUndo: () => void
  /** Optional toast id so callers can dismiss/replace deliberately. */
  id?: string | number
}

/**
 * Optimistic destructive pattern: UI is already updated by the caller,
 * then this opens a Sonner toast with Undo. If Undo is pressed, onUndo runs
 * and the commit is cancelled. Otherwise onCommit fires after durationMs.
 */
export function scheduleUndoableAction({
  message,
  description,
  undoLabel = 'Undo',
  durationMs = DESTRUCTIVE_UNDO_MS,
  onCommit,
  onUndo,
  id,
}: ScheduleUndoableActionOptions): void {
  let cancelled = false
  let settled = false

  const commit = () => {
    if (cancelled || settled) return
    settled = true
    void Promise.resolve()
      .then(() => onCommit())
      .catch((error) => {
        onUndo()
        toast.error(error instanceof Error ? error.message : 'Something went wrong')
      })
  }

  const timer = window.setTimeout(commit, durationMs)

  toast(message, {
    id,
    description,
    duration: durationMs,
    action: {
      label: undoLabel,
      onClick: () => {
        if (settled) return
        cancelled = true
        window.clearTimeout(timer)
        onUndo()
      },
    },
  })
}
