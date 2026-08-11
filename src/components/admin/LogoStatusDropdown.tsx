'use client'

import { ChevronDown } from 'lucide-react'
import { Badge, type BadgeColor, badgeColors } from '@/components/ui/badge'
import { DropdownContent, DropdownMenu, DropdownTrigger } from '@/components/ui/dropdown'
import { MenuItem } from '@/components/ui/menu-item'
import type { IconComponent, IconComponentProps } from '@/lib/icon-context'
import { MANUAL_STATUSES } from '@/lib/logo-status'
import { useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'
import type { LogoStatus } from '@/types'

export const STATUS_BADGE_COLOR: Record<LogoStatus, BadgeColor> = {
  AVAILABLE: 'emerald',
  REVIEW: 'purple',
  DRAFT: 'gray',
  HIDDEN: 'yellow',
  SOLD: 'blue',
  TRASH: 'red',
}

export const STATUS_LABEL: Record<LogoStatus, string> = {
  AVAILABLE: 'Live',
  REVIEW: 'Submitted',
  DRAFT: 'Draft',
  HIDDEN: 'Rejected',
  SOLD: 'Sold',
  TRASH: 'Trash',
}

/** Dot fill for menu icons — always a concrete color (never a channel-only CSS var). */
function statusDotFill(color: BadgeColor): string {
  return badgeColors[color]
}

function statusDotIcon(color: BadgeColor): IconComponent {
  const fill = statusDotFill(color)
  return function StatusDot({ size = 16, className }: IconComponentProps) {
    // Match Lucide’s 24-viewBox optical center so the 6px fill sits on the
    // same midline as MenuItem labels (which use text-box trim).
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn('shrink-0', className)}
      >
        <circle cx="12" cy="12" r="4" fill={fill} />
      </svg>
    )
  }
}

const STATUS_DOT: Record<LogoStatus, IconComponent> = {
  AVAILABLE: statusDotIcon('emerald'),
  REVIEW: statusDotIcon('purple'),
  DRAFT: statusDotIcon('gray'),
  HIDDEN: statusDotIcon('yellow'),
  SOLD: statusDotIcon('blue'),
  TRASH: statusDotIcon('red'),
}

interface LogoStatusDropdownProps {
  value: LogoStatus
  /** Defaults to statuses an admin may set by hand (excludes SOLD). */
  options?: readonly LogoStatus[]
  onChange: (status: LogoStatus) => void
  /** When true, show the badge only — used for Stripe-locked SOLD logos. */
  readOnly?: boolean
  id?: string
  'aria-labelledby'?: string
}

export function LogoStatusDropdown({
  value,
  options = MANUAL_STATUSES,
  onChange,
  readOnly = false,
  id,
  'aria-labelledby': ariaLabelledBy,
}: LogoStatusDropdownProps) {
  const shape = useShape()
  const checkedIndex = options.indexOf(value as (typeof options)[number])

  const badge = (
    <Badge variant="dot" color={STATUS_BADGE_COLOR[value]} size="sm">
      {STATUS_LABEL[value]}
    </Badge>
  )

  if (readOnly) {
    return (
      <span id={id} className="inline-flex">
        {badge}
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownTrigger
        id={id}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabelledBy ? undefined : `Change status, currently ${STATUS_LABEL[value]}`}
        render={
          <button
            type="button"
            className={cn(
              'group/status inline-flex items-center gap-1 outline-none cursor-pointer',
              'h-8 px-1.5 -ml-1.5',
              'transition-colors duration-80',
              'hover:bg-hover active:bg-active',
              'focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]',
              shape.item,
            )}
          >
            {badge}
            <ChevronDown
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-80 group-hover/status:text-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        }
      />
      <DropdownContent checkedIndex={checkedIndex >= 0 ? checkedIndex : undefined}>
        {options.map((status, index) => (
          <MenuItem
            key={status}
            index={index}
            icon={STATUS_DOT[status]}
            label={STATUS_LABEL[status]}
            checked={value === status}
            onSelect={() => onChange(status)}
          />
        ))}
      </DropdownContent>
    </DropdownMenu>
  )
}
