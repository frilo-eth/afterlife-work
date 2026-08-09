import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

/**
 * Cache tag for anything derived from the public catalog. Admin mutations
 * call revalidateTag(CATALOG_TAG) so a listing change is reflected without
 * waiting for the time-based window to lapse.
 */
export const CATALOG_TAG = 'catalog'

/** One hour. The catalog changes a few times a week, not a few times a minute. */
const CATALOG_REVALIDATE_SECONDS = 3600

export type CatalogLogo = {
  id: string
  title: string
  thumbnail: string
  tags: string[]
}

export type LogoDetail = CatalogLogo & {
  description: string
  images: string[]
  status: string
  price: {
    summon: number
    revival: number
    afterlife: string
  } | null
  gallery: { id: string; imageUrl: string }[]
}

/**
 * Logos shown on the catalog.
 *
 * Status is filtered in the query. The previous implementation returned every
 * logo with its full gallery and let the browser discard the ones it should
 * not see, which shipped unreleased and already-sold work to every visitor.
 * Only the four fields the card renders are selected.
 */
export const getAvailableLogos = unstable_cache(
  async (): Promise<CatalogLogo[]> =>
    prisma.logo.findMany({
      where: { status: 'AVAILABLE' },
      select: { id: true, title: true, thumbnail: true, tags: true },
      orderBy: { createdAt: 'desc' }
    }),
  ['catalog-available-logos'],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
)

/** Every id that should get a prerendered product page. */
export const getPublishedLogoIds = unstable_cache(
  async (): Promise<string[]> => {
    const logos = await prisma.logo.findMany({
      where: { status: { in: ['AVAILABLE', 'SOLD'] } },
      select: { id: true }
    })
    return logos.map(logo => logo.id)
  },
  ['catalog-published-ids'],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
)

/**
 * A single logo's public detail. Returns null for hidden, draft, and
 * in-review listings so unreleased work is not reachable by guessing an id.
 */
export const getLogoDetail = unstable_cache(
  async (id: string): Promise<LogoDetail | null> => {
    const logo = await prisma.logo.findFirst({
      where: { id, status: { in: ['AVAILABLE', 'SOLD'] } },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        tags: true,
        description: true,
        status: true,
        price: { select: { summon: true, revival: true, afterlife: true } },
        gallery: { select: { id: true, imageUrl: true }, orderBy: { id: 'asc' } }
      }
    })

    if (!logo) return null

    // The gallery viewer takes a single ordered list, so the thumbnail leads
    // and the gallery rows follow. The Logo.images column is deliberately not
    // used here: it holds only the main image (one entry against six gallery
    // rows on current records), so reading it directly showed one image of
    // seven. The endpoint this replaced merged the two the same way.
    return {
      ...logo,
      images: [logo.thumbnail, ...logo.gallery.map(item => item.imageUrl)].filter(Boolean)
    }
  },
  ['catalog-logo-detail'],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
)
