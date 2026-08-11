import Link from 'next/link'
import { fetchDashboardData } from '@/app/actions/dashboard'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentOrders } from '@/components/admin/RecentOrders'

export default async function AdminPage() {
  const data = await fetchDashboardData()

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-heading-24 text-foreground">Overview</h1>
        <p className="text-caption text-foreground-muted max-w-xl text-pretty">
          Catalog health, revenue, and the latest orders in one place.
        </p>
      </header>

      <DashboardStats
        totalLogos={data.totalLogos}
        pendingSubmissions={data.pendingSubmissions}
        totalOrders={data.totalOrders}
        totalRevenue={data.totalRevenue}
        totalDesigners={data.totalDesigners}
        fulfilledThisMonth={data.fulfilledThisMonth}
      />

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-heading-16 text-foreground">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-caption text-foreground-subtle transition-colors duration-80 hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="text-caption text-foreground-muted">No orders yet.</p>
        ) : (
          <RecentOrders orders={data.recentOrders} />
        )}
      </section>
    </div>
  )
}
