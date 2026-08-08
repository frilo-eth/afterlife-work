'use client'

import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Badge,
  Button
} from '@nextui-org/react'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import type { Order, Logo } from '@prisma/client'

type OrderWithLogo = Order & {
  logo: Logo
}

interface OrdersTableProps {
  orders: OrderWithLogo[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Table aria-label="Orders table">
      <TableHeader>
        <TableColumn>ORDER ID</TableColumn>
        <TableColumn>LOGO</TableColumn>
        <TableColumn>CUSTOMER</TableColumn>
        <TableColumn>DATE</TableColumn>
        <TableColumn>TIER</TableColumn>
        <TableColumn>AMOUNT</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id.slice(0, 8)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <img 
                  src={order.logo.thumbnail} 
                  alt={order.logo.title}
                  className="w-8 h-8 rounded object-cover"
                />
                <span>{order.logo.title}</span>
              </div>
            </TableCell>
            <TableCell>{order.customerEmail}</TableCell>
            <TableCell>
              {format(order.createdAt, 'MMM d, yyyy')}
            </TableCell>
            <TableCell>
              <Badge color={order.tier === 'summon' ? 'primary' : 'secondary'}>
                {order.tier}
              </Badge>
            </TableCell>
            <TableCell>
              ${(order.amount / 100).toLocaleString()}
            </TableCell>
            <TableCell>
              <Button
                isIconOnly
                variant="light"
                onPress={() => window.open(`/download/${order.logoId}`, '_blank')}
              >
                <Download size={20} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 