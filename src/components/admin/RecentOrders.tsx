'use client'

import { format } from 'date-fns'
import { generatePublicReference } from '@/lib/utils'
import type { OrderWithLogo } from '@/types/admin'

export function RecentOrders({ orders }: { orders: OrderWithLogo[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {orders.map((order) => (
        <li key={order.id} className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={order.logo.thumbnail}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-label text-foreground">
                {order.wordmark || order.logo.title}
              </p>
              <p className="text-caption text-foreground-subtle">
                {generatePublicReference(order.logoId)}
                <span className="mx-1.5 text-foreground-subtle/50">·</span>
                {format(new Date(order.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-label text-foreground">${(order.amount / 100).toLocaleString()}</p>
            <p className="text-caption capitalize text-foreground-subtle">{order.tier}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
