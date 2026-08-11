import type { PrismaClient } from '@prisma/client'

/** Paths that must never become a logo URL. */
export const RESERVED_LOGO_SLUGS = new Set([
  'about',
  'admin',
  'api',
  'download',
  'login',
  'teaser',
  'success',
  'cancel',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
])

/** Turn a title into a URL-safe slug. */
export function slugifyTitle(title: string): string {
  const base = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  return base || 'logo'
}

function withReservedGuard(slug: string): string {
  return RESERVED_LOGO_SLUGS.has(slug) ? `logo-${slug}` : slug
}

/**
 * Build a unique slug from a title. Pass `excludeId` when updating an existing logo.
 */
export async function allocateLogoSlug(
  prisma: PrismaClient,
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = withReservedGuard(slugifyTitle(title))
  let candidate = base
  let n = 2

  for (;;) {
    const existing = await prisma.logo.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${base}-${n}`
    n += 1
  }
}

/** Normalize a website to an absolute https URL, or null if empty. */
export function normalizeWebsiteUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(withProtocol)
    if (!url.hostname.includes('.')) return null
    url.hash = ''
    // Drop trailing slash on bare domains / paths for cleaner storage.
    if (url.pathname === '/') url.pathname = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

/**
 * Accept @handle, handle, or a full x.com / twitter.com URL → bare handle.
 */
export function normalizeTwitterHandle(raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null

  // Full profile URLs, with or without a leading @
  const fromUrl = value.match(/(?:x\.com|twitter\.com)\/@?([A-Za-z0-9_]+)/i)
  if (fromUrl?.[1]) return fromUrl[1]

  let handle = value.replace(/^@+/, '').trim()
  handle = handle.replace(/^https?:\/\//i, '')
  if (handle.includes('/')) {
    const tail = handle.split('/').filter(Boolean).pop()
    if (tail) handle = tail.replace(/^@/, '')
  }

  if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) return handle
  return null
}
