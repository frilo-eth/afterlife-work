'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface OrderCount {
  tier: string
  _count: number
}

interface PopularLogo {
  id: string
  title: string
  _count: {
    orders: number
  }
}

interface AnalyticsData {
  revenue: {
    _sum: {
      amount: number | null
    }
  }
  ordersByTier: OrderCount[]
  popularLogos: PopularLogo[]
}

export function AnalyticsChart({ data }: { data: AnalyticsData }) {
  const chartData = data.ordersByTier.map((tier) => ({
    name: tier.tier,
    orders: tier._count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fill: '#fff' }} />
        <YAxis tick={{ fill: '#fff' }} />
        <Tooltip />
        <Bar dataKey="orders" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
