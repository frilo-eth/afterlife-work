import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Signature maker credit used across Afterlife, Snifffit, Pawtrait, etc. */
export function FriloPill({ className }: { className?: string }) {
  return (
    <a
      href="https://frilo.io/"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card',
        'pl-0.5 pr-2.5 text-[12px] leading-none text-foreground-muted',
        'transition-colors duration-80 hover:border-foreground/20 hover:text-foreground',
        className,
      )}
    >
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
      <span>frilo</span>
    </a>
  )
}
