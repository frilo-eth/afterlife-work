import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LogoDetailView } from '@/components/logo/LogoDetailView'
import { getLogoDetail, getPublishedLogoIds } from '@/lib/catalog'

export const revalidate = 3600

// Prerender every published logo at build time. Anything added later is
// rendered on first request and then cached, rather than 404'ing.
export const dynamicParams = true

export async function generateStaticParams() {
  const ids = await getPublishedLogoIds()
  return ids.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const logo = await getLogoDetail(params.slug)

  if (!logo) {
    return { title: 'Logo not found' }
  }

  return {
    title: `${logo.title} — Afterlife`,
    description: logo.description,
    openGraph: {
      title: logo.title,
      description: logo.description,
      images: logo.thumbnail ? [logo.thumbnail] : undefined,
    },
  }
}

export default async function LogoDetailPage({ params }: { params: { slug: string } }) {
  // Reserved paths that have their own routes — never treat as a logo id.
  if (params.slug === 'teaser' || params.slug === 'about') {
    notFound()
  }

  const logo = await getLogoDetail(params.slug)

  // getLogoDetail only returns AVAILABLE and SOLD listings, so hidden, draft,
  // and in-review work is not reachable by guessing an id.
  if (!logo) {
    notFound()
  }

  return <LogoDetailView logo={logo} />
}
