'use client'

import type { Logo, Order } from '@prisma/client'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type OrderWithLogo = Order & {
  logo: Logo
}

interface OrdersTableProps {
  orders: OrderWithLogo[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return <p className="text-caption text-foreground-muted">No orders yet.</p>
  }

  return (
    <Table aria-label="Orders">
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Logo</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-caption text-foreground-muted">
              {order.id.slice(0, 8)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {order.logo.thumbnail && (
                  <Image
                    src={order.logo.thumbnail}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-md border border-border object-cover"
                  />
                )}
                <span className="text-label text-foreground">{order.logo.title}</span>
              </div>
            </TableCell>
            <TableCell className="text-caption text-foreground-muted">
              {order.customerEmail}
            </TableCell>
            <TableCell className="text-caption text-foreground-muted">
              {format(order.createdAt, 'MMM d, yyyy')}
            </TableCell>
            <TableCell>
              <Badge>{order.tier}</Badge>
            </TableCell>
            {/* Amounts are stored in cents. */}
            <TableCell className="text-label text-foreground">
              ${(order.amount / 100).toLocaleString()}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Download files for ${order.logo.title}`}
                onClick={() => window.open(`/download/${order.logoId}`, '_blank')}
              >
                <Download />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
