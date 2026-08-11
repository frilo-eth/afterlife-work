import type { LogoStatus } from '@/types'

/**
 * Single source of truth for logo status rules.
 *
 * SOLD is owned by Stripe checkout (webhook). Admins never set or clear it
 * by hand — that keeps catalog truth linked to payment, even with hundreds
 * of logos.
 *
 * TRASH is soft-delete. Catalog ignores it; only Trash can hard-delete.
 */

export const ALL_LOGO_STATUSES = [
  'AVAILABLE',
  'REVIEW',
  'DRAFT',
  'HIDDEN',
  'SOLD',
  'TRASH',
] as const satisfies readonly LogoStatus[]

/** Statuses an admin may choose when creating a logo. */
export const CREATE_STATUSES = ['DRAFT', 'AVAILABLE'] as const satisfies readonly LogoStatus[]

/** Statuses an admin may move a logo between (excludes Stripe-owned SOLD). */
export const MANUAL_STATUSES = [
  'AVAILABLE',
  'REVIEW',
  'DRAFT',
  'HIDDEN',
  'TRASH',
] as const satisfies readonly LogoStatus[]

/** Default status when restoring out of Trash. */
export const TRASH_RESTORE_STATUS = 'DRAFT' as const satisfies LogoStatus

export type ManualLogoStatus = (typeof MANUAL_STATUSES)[number]
export type CreateLogoStatus = (typeof CREATE_STATUSES)[number]

export function isLogoStatus(value: unknown): value is LogoStatus {
  return typeof value === 'string' && (ALL_LOGO_STATUSES as readonly string[]).includes(value)
}

export function isManualStatus(value: unknown): value is ManualLogoStatus {
  return typeof value === 'string' && (MANUAL_STATUSES as readonly string[]).includes(value)
}

export function isCreateStatus(value: unknown): value is CreateLogoStatus {
  return typeof value === 'string' && (CREATE_STATUSES as readonly string[]).includes(value)
}

/** Sold listings are payment-locked — no admin content or status edits. */
export function isStatusLocked(status: LogoStatus): boolean {
  return status === 'SOLD'
}

export function isTrashed(status: LogoStatus): boolean {
  return status === 'TRASH'
}

/** Visible on the public product page (catalog + sold archive). */
export function isPubliclyListed(status: LogoStatus): boolean {
  return status === 'AVAILABLE' || status === 'SOLD'
}

/**
 * Whether an admin may change status from `from` to `to`.
 * Stripe is the only path into SOLD; nothing leaves SOLD via admin.
 */
export function canManuallyTransition(from: LogoStatus, to: LogoStatus): boolean {
  if (from === to) return true
  if (isStatusLocked(from)) return false
  if (to === 'SOLD') return false
  return isManualStatus(to)
}

export function assertManualStatusChange(
  from: LogoStatus,
  to: LogoStatus,
): { ok: true } | { ok: false; message: string } {
  if (from === to) return { ok: true }
  if (isStatusLocked(from)) {
    return { ok: false, message: 'Sold logos are locked. Status is set by Stripe checkout.' }
  }
  if (to === 'SOLD') {
    return {
      ok: false,
      message: 'Sold is set automatically when a checkout completes. Choose another status.',
    }
  }
  if (!isManualStatus(to)) {
    return { ok: false, message: `Invalid status: ${to}` }
  }
  return { ok: true }
}

/** Hard delete is only allowed for logos already in Trash. */
export function assertPermanentDelete(
  status: LogoStatus,
): { ok: true } | { ok: false; message: string } {
  if (isStatusLocked(status)) {
    return { ok: false, message: 'Sold logos cannot be deleted from admin.' }
  }
  if (!isTrashed(status)) {
    return {
      ok: false,
      message: 'Move the logo to Trash first. Permanent delete is only available from Trash.',
    }
  }
  return { ok: true }
}
