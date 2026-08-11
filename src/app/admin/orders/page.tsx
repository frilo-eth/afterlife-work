import { OrdersTable } from '@/components/admin/OrdersTable'
import { prisma } from '@/lib/prisma'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      logo: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-heading-24 text-foreground">Orders</h1>
        <p className="text-caption text-foreground-muted">Purchases and downloads.</p>
      </header>
      <OrdersTable orders={orders} />
    </div>
  )
}
