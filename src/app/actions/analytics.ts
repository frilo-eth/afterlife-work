'use server'

import { format, subDays } from 'date-fns'
import { prisma } from '@/lib/prisma'

export type FunnelStep = {
  key: string
  label: string
  count: number
}

export type DayPoint = {
  day: string
  views: number
  checkouts: number
  orders: number
  submits: number
  revenue: number
}

export type TopLogoRow = {
  logoId: string
  title: string
  views: number
  checkouts: number
  orders: number
}

export type RecentEventRow = {
  id: string
  name: string
  logoId: string | null
  path: string | null
  createdAt: string
}

export type AnalyticsDashboard = {
  rangeDays: number
  funnel: FunnelStep[]
  submitFunnel: FunnelStep[]
  daily: DayPoint[]
  topLogos: TopLogoRow[]
  recent: RecentEventRow[]
  totals: {
    views: number
    checkoutsStarted: number
    checkoutsCompleted: number
    orders: number
    revenue: number
    submitsOpened: number
    submitsCompleted: number
    conversionRate: number
  }
}

function emptyDay(day: string): DayPoint {
  return { day, views: 0, checkouts: 0, orders: 0, submits: 0, revenue: 0 }
}

export async function fetchAnalyticsDashboard(rangeDays = 30): Promise<AnalyticsDashboard> {
  const days = Math.min(Math.max(rangeDays, 7), 90)
  const since = subDays(new Date(), days)

  const [events, orders, checkoutLogs, logos] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
      select: {
        id: true,
        name: true,
        logoId: true,
        path: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        logoId: true,
        amount: true,
        createdAt: true,
        logo: { select: { title: true } },
      },
    }),
    prisma.checkoutLog.findMany({
      where: { createdAt: { gte: since } },
      select: { type: true, logoId: true, createdAt: true },
    }),
    prisma.logo.findMany({
      select: { id: true, title: true },
    }),
  ])

  const titleById = new Map(logos.map((l) => [l.id, l.title]))

  const views = events.filter((e) => e.name === 'logo_view').length
  const checkoutsStarted =
    events.filter((e) => e.name === 'checkout_started').length ||
    checkoutLogs.filter((c) => c.type === 'CHECKOUT_STARTED').length
  const checkoutsCompleted =
    events.filter((e) => e.name === 'checkout_completed').length ||
    checkoutLogs.filter((c) => c.type === 'CHECKOUT_COMPLETED').length ||
    orders.length
  const submitsOpened = events.filter((e) => e.name === 'submit_open').length
  const submitsCompleted = events.filter((e) => e.name === 'submit_complete').length
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0)

  const funnel: FunnelStep[] = [
    { key: 'logo_view', label: 'Logo views', count: views },
    { key: 'checkout_started', label: 'Checkouts started', count: checkoutsStarted },
    { key: 'checkout_completed', label: 'Purchases', count: checkoutsCompleted },
  ]

  const submitFunnel: FunnelStep[] = [
    { key: 'submit_open', label: 'Submit opened', count: submitsOpened },
    { key: 'submit_complete', label: 'Submissions', count: submitsCompleted },
  ]

  const dailyMap = new Map<string, DayPoint>()
  for (let i = days - 1; i >= 0; i--) {
    const day = format(subDays(new Date(), i), 'yyyy-MM-dd')
    dailyMap.set(day, emptyDay(day))
  }

  for (const e of events) {
    const day = format(e.createdAt, 'yyyy-MM-dd')
    const row = dailyMap.get(day)
    if (!row) continue
    if (e.name === 'logo_view') row.views += 1
    if (e.name === 'checkout_started') row.checkouts += 1
    if (e.name === 'submit_complete') row.submits += 1
  }

  for (const o of orders) {
    const day = format(o.createdAt, 'yyyy-MM-dd')
    const row = dailyMap.get(day)
    if (!row) continue
    row.orders += 1
    row.revenue += o.amount
  }

  const viewByLogo = new Map<string, number>()
  const checkoutByLogo = new Map<string, number>()
  for (const e of events) {
    if (!e.logoId) continue
    if (e.name === 'logo_view') viewByLogo.set(e.logoId, (viewByLogo.get(e.logoId) ?? 0) + 1)
    if (e.name === 'checkout_started')
      checkoutByLogo.set(e.logoId, (checkoutByLogo.get(e.logoId) ?? 0) + 1)
  }
  const ordersByLogo = new Map<string, number>()
  for (const o of orders) {
    ordersByLogo.set(o.logoId, (ordersByLogo.get(o.logoId) ?? 0) + 1)
  }

  const logoIds = new Set([
    ...viewByLogo.keys(),
    ...checkoutByLogo.keys(),
    ...ordersByLogo.keys(),
  ])
  const topLogos: TopLogoRow[] = [...logoIds]
    .map((logoId) => ({
      logoId,
      title: titleById.get(logoId) ?? logoId.slice(0, 8),
      views: viewByLogo.get(logoId) ?? 0,
      checkouts: checkoutByLogo.get(logoId) ?? 0,
      orders: ordersByLogo.get(logoId) ?? 0,
    }))
    .sort((a, b) => b.views + b.checkouts * 3 + b.orders * 5 - (a.views + a.checkouts * 3 + a.orders * 5))
    .slice(0, 10)

  const recent: RecentEventRow[] = events.slice(0, 40).map((e) => ({
    id: e.id,
    name: e.name,
    logoId: e.logoId,
    path: e.path,
    createdAt: e.createdAt.toISOString(),
  }))

  return {
    rangeDays: days,
    funnel,
    submitFunnel,
    daily: [...dailyMap.values()],
    topLogos,
    recent,
    totals: {
      views,
      checkoutsStarted,
      checkoutsCompleted,
      orders: orders.length,
      revenue,
      submitsOpened,
      submitsCompleted,
      conversionRate: views > 0 ? checkoutsCompleted / views : 0,
    },
  }
}
