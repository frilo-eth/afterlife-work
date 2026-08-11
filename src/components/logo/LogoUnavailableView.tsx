import Link from 'next/link'

/**
 * Public product page when the id is unknown or not listed.
 * Same empty shell for missing and private logos so the response
 * does not leak whether a draft/hidden listing exists.
 */
export function LogoUnavailableView() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-start justify-center px-4 py-24">
      <p className="font-mono text-metadata uppercase text-foreground-subtle">Afterlife</p>
      <h1 className="mt-3 text-heading-24 text-foreground">Nothing here</h1>
      <p className="mt-2 max-w-md text-caption text-foreground-muted">
        This page is empty. Browse the collection for logos that are available.
      </p>
      <Link
        href="/#collection"
        className="mt-8 text-caption text-foreground underline-offset-4 transition-colors duration-80 hover:underline"
      >
        Browse collection
      </Link>
    </div>
  )
}
