'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { generatePublicReference } from '@/lib/utils'
import type { OrderWithLogo } from '@/types/admin'

function getOrderStatus(order: OrderWithLogo): string {
  return order.tier === 'summon' ? 'Delivered' : 'Deadline 3 days'
}

export function RecentOrders({ orders }: { orders: OrderWithLogo[] }) {
  return (
    <div className="space-y-6">
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/20 border border-white/5">
                <img 
                  src={order.logo.thumbnail} 
                  alt={order.wordmark}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-white/90">
                    {order.wordmark}
                  </h3>
                  <span className="text-sm text-white/40">
                    {generatePublicReference(order.logoId)}
                  </span>
                </div>
                <p className="text-sm text-white/40">{getOrderStatus(order)}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-white/60">{order.tier}</span>
              <span className="text-lg font-medium text-white/90">
                ${(order.amount / 100).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 