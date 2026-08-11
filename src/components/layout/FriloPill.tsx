import { DesignerPill } from '@/components/logo/DesignerPill'

/** Signature maker credit used across Afterlife, Snifffit, Pawtrait, etc. */
export function FriloPill({ className }: { className?: string }) {
  return (
    <DesignerPill
      className={className}
      designer={{
        name: 'frilo',
        website: 'https://frilo.io/',
        email: 'hey@frilo.io',
      }}
    />
  )
}
