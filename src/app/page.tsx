import { Hero } from '@/components/hero/Hero'
import { CatalogSection } from '@/components/catalog/CatalogSection'
import { getAvailableLogos } from '@/lib/catalog'

// Prerendered and served from the edge, revalidated hourly or on demand when
// an admin mutation calls revalidateTag(CATALOG_TAG). Previously this page was
// a client component that booted React and only then fetched /api/logos, so
// every visitor waited on a round trip before seeing anything.
export const revalidate = 3600

export default async function HomePage() {
  const logos = await getAvailableLogos()

  return (
    <div className="min-h-screen backdrop-blur-sm">
      <Hero />

      <section id="collection" className="min-h-screen bg-background/50">
        {logos.length > 0 ? (
          <CatalogSection logos={logos} />
        ) : (
          <div className="container mx-auto px-4 py-24">
            <h2 className="text-3xl font-bold mb-2">The collection is empty</h2>
            <p className="text-sm text-foreground-muted">
              No logos are available right now. Check back soon.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
