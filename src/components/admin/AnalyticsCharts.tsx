'use client'

import { format } from 'date-fns'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { DayPoint, TopLogoRow } from '@/app/actions/analytics'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const dailyConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
  checkouts: {
    label: 'Checkouts',
    color: 'hsl(var(--chart-2))',
  },
  orders: {
    label: 'Orders',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

const topLogosConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function AnalyticsDailyChart({ data }: { data: DayPoint[] }) {
  return (
    <ChartContainer config={dailyConfig} className="aspect-auto h-[320px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 8, right: 8, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={(d) => format(new Date(`${d}T00:00:00`), 'MMM d')}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          allowDecimals={false}
          width={36}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                format(new Date(`${String(value)}T00:00:00`), 'MMM d, yyyy')
              }
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="views"
          type="natural"
          fill="var(--color-views)"
          fillOpacity={0.15}
          stroke="var(--color-views)"
          strokeWidth={1.5}
        />
        <Area
          dataKey="checkouts"
          type="natural"
          fill="var(--color-checkouts)"
          fillOpacity={0.2}
          stroke="var(--color-checkouts)"
          strokeWidth={1.5}
        />
        <Area
          dataKey="orders"
          type="natural"
          fill="var(--color-orders)"
          fillOpacity={0.25}
          stroke="var(--color-orders)"
          strokeWidth={1.5}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function AnalyticsTopLogosChart({ data }: { data: TopLogoRow[] }) {
  if (data.length === 0) {
    return <p className="text-caption text-foreground-muted">No engagement yet in this window.</p>
  }

  return (
    <ChartContainer config={topLogosConfig} className="aspect-auto h-[280px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 8, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" dataKey="views" hide allowDecimals={false} />
        <YAxis
          dataKey="title"
          type="category"
          tickLine={false}
          axisLine={false}
          width={120}
          tickMargin={8}
          tickFormatter={(value) =>
            String(value).length > 16 ? `${String(value).slice(0, 16)}…` : String(value)
          }
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
