import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { LogoDetailView } from '@/components/logo/LogoDetailView'
import { LogoUnavailableView } from '@/components/logo/LogoUnavailableView'
import { getLogoDetail, getPublishedLogoSlugs } from '@/lib/catalog'

export const revalidate = 3600

// Prerender every published logo at build time. Anything added later is
// rendered on first request and then cached, rather than 404'ing.
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getPublishedLogoSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  if (params.slug === 'teaser' || params.slug === 'about') {
    return { title: 'Afterlife' }
  }

  const logo = await getLogoDetail(params.slug)

  if (!logo) {
    // Same title for missing and private — no existence leak in the tab.
    return {
      title: 'Afterlife',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${logo.title} — Afterlife`,
    description: logo.description,
    openGraph: {
      title: logo.title,
      description: logo.description,
      images: logo.thumbnail ? [logo.thumbnail] : undefined,
      url: `/${logo.slug}`,
    },
    alternates: {
      canonical: `/${logo.slug}`,
    },
  }
}

export default async function LogoDetailPage({ params }: { params: { slug: string } }) {
  // Reserved paths that have their own routes — never treat as a logo id.
  if (params.slug === 'teaser' || params.slug === 'about') {
    return <LogoUnavailableView />
  }

  const logo = await getLogoDetail(params.slug)

  // getLogoDetail only returns AVAILABLE and SOLD listings. Missing ids and
  // private statuses share the same empty shell so guessing an id cannot
  // confirm a draft, hidden, or trashed logo exists.
  // Admins preview private logos at /admin/logos/preview/[id].
  if (!logo) {
    return <LogoUnavailableView />
  }

  // Old cuid links permanently redirect to the pretty slug.
  if (params.slug !== logo.slug) {
    permanentRedirect(`/${logo.slug}`)
  }

  return <LogoDetailView logo={logo} />
}
