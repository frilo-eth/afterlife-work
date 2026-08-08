import { prisma } from '@/lib/prisma'
import { OrdersTable } from '@/components/admin/OrdersTable'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      logo: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Orders</h1>
      <OrdersTable orders={orders} />
    </div>
  )
} 