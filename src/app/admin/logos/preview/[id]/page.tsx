import { notFound } from 'next/navigation'
import { LogoDetailView } from '@/components/logo/LogoDetailView'
import { getLogoDetailForAdmin } from '@/lib/catalog'
import { isPubliclyListed } from '@/lib/logo-status'
import type { LogoStatus } from '@/types'

/**
 * Admin-only product preview. Public /[slug] stays empty for private statuses
 * so we never leak drafts/rejected/trash; this route is behind /admin auth.
 */
export default async function AdminLogoPreviewPage({ params }: { params: { id: string } }) {
  const logo = await getLogoDetailForAdmin(params.id)
  if (!logo) notFound()

  const status = logo.status as LogoStatus
  const listed = isPubliclyListed(status)

  return (
    <>
      {!listed ? (
        <div className="border-b border-border bg-surface-1 px-4 py-2 text-center font-mono text-metadata uppercase text-foreground-subtle">
          Admin preview · {status.toLowerCase()} · not publicly listed
        </div>
      ) : null}
      <LogoDetailView logo={logo} />
    </>
  )
}
