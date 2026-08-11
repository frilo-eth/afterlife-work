import Image from 'next/image'
import { cn } from '@/lib/utils'

export type DesignerPillData = {
  name: string
  website?: string | null
  twitter?: string | null
  email?: string | null
}

function designerHref(designer: DesignerPillData): string | null {
  const website = designer.website?.trim()
  if (website) {
    return website.startsWith('http') ? website : `https://${website}`
  }
  const handle = designer.twitter?.trim().replace(/^@/, '')
  if (handle) return `https://x.com/${handle}`
  return null
}

function isFrilo(designer: DesignerPillData): boolean {
  const haystack = [designer.name, designer.email, designer.website]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes('frilo')
}

/** Small credit pill for the logo meta — same shape as the footer Frilo pill. */
export function DesignerPill({
  designer,
  className,
}: {
  designer: DesignerPillData
  className?: string
}) {
  const href = designerHref(designer) ?? (isFrilo(designer) ? 'https://frilo.io/' : null)
  const label = isFrilo(designer) ? 'frilo' : designer.name
  const showFriloAvatar = isFrilo(designer)

  const classNames = cn(
    'inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card',
    'pl-0.5 pr-2.5 text-[12px] leading-none text-foreground-muted',
    'transition-colors duration-80 hover:border-foreground/20 hover:text-foreground',
    !showFriloAvatar && 'pl-2.5',
    className,
  )

  const inner = (
    <>
      {showFriloAvatar ? (
        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-background">
          <Image
            src="/frilo-avatar.jpg"
            alt=""
            width={20}
            height={20}
            unoptimized
            className="h-full w-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        </span>
      ) : null}
      <span>{label}</span>
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classNames}>
        {inner}
      </a>
    )
  }

  return <span className={classNames}>{inner}</span>
}
