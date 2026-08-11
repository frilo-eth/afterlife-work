import { Package, Receipt, UserRound, Wallet } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardStatsProps {
  totalLogos: number
  pendingSubmissions: number
  totalOrders: number
  totalRevenue: number
  totalDesigners: number
  fulfilledThisMonth: number
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function DashboardStats({
  totalLogos = 0,
  pendingSubmissions = 0,
  totalOrders = 0,
  totalRevenue = 0,
  totalDesigners = 0,
  fulfilledThisMonth = 0,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Logos',
      value: String(totalLogos),
      description: pendingSubmissions > 0 ? `${pendingSubmissions} submitted` : 'Catalog live',
      href: pendingSubmissions > 0 ? '/admin/logos?status=REVIEW' : '/admin/logos',
      icon: Package,
    },
    {
      label: 'Revenue',
      value: formatCents(totalRevenue),
      description: `${totalOrders} orders total`,
      href: '/admin/orders',
      icon: Wallet,
    },
    {
      label: 'This month',
      value: String(fulfilledThisMonth),
      description: 'Orders fulfilled',
      href: '/admin/orders',
      icon: Receipt,
    },
    {
      label: 'Designers',
      value: String(totalDesigners),
      description: 'With logos on Afterlife',
      href: '/admin/designers',
      icon: UserRound,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Link
            key={stat.label}
            href={stat.href}
            className={cn(
              'group block border border-border bg-card p-5 rounded-lg',
              'transition-[border-color] duration-quick ease-settle',
              'hover:border-border-strong',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-caption text-foreground-muted">{stat.label}</p>
                <p className="text-heading-24 text-foreground">{stat.value}</p>
                <p className="text-caption text-foreground-subtle">{stat.description}</p>
              </div>
              <Icon
                className="h-4 w-4 shrink-0 text-foreground-subtle transition-colors duration-80 group-hover:text-foreground"
                aria-hidden="true"
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
