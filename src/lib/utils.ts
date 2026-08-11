import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a display-only reference number from an existing ID.
 * No database changes required.
 */
export function generatePublicReference(id: string | null | undefined): string {
  if (!id) return '#------'

  // Convert the string id to a number-based hash
  const numericHash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Use the numeric hash to generate the reference
  const hash = [
    numericHash.toString(36),
    (numericHash * 747).toString(36),
    (numericHash * 893).toString(36),
  ].join('')

  return `#${hash.slice(0, 6).toUpperCase()}`
}

/**
 * Validates if a reference number follows the correct format
 */
export function isValidReference(ref: string): boolean {
  return /^#[A-Z0-9]{6}$/.test(ref)
}
