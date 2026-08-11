'use client'

import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DayPoint, TopLogoRow } from '@/app/actions/analytics'

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'var(--radius)',
  color: 'hsl(var(--popover-foreground))',
  fontSize: 12,
}

export function AnalyticsDailyChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickFormatter={(d) => format(new Date(`${d}T00:00:00`), 'MMM d')}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Line
            type="monotone"
            dataKey="views"
            name="Views"
            stroke="hsl(var(--foreground))"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="checkouts"
            name="Checkouts"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="hsl(var(--foreground-subtle))"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AnalyticsTopLogosChart({ data }: { data: TopLogoRow[] }) {
  if (data.length === 0) {
    return <p className="text-caption text-foreground-muted">No engagement yet in this window.</p>
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
          <YAxis
            type="category"
            dataKey="title"
            width={120}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="views" name="Views" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
