'use client'

import { Tooltip as NextUITooltip } from '@nextui-org/react'
import { format } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface RevenueDataPoint {
  date: Date
  amount: number
  tier: 'summon' | 'revival' | 'afterlife'
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: RevenueDataPoint
  }>
  label?: string
}

export function RevenueChart({ data }: RevenueChartProps) {
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload?.length) {
      return (
        <NextUITooltip
          content={
            <div className="py-2 px-4 text-sm">
              <div className="text-foreground-muted">{format(new Date(label || ''), 'MMM dd')}</div>
              <div className="font-mono">${payload[0].value}</div>
            </div>
          }
          placement="top"
        >
          <div className="bg-background/80 border border-border rounded-lg p-2" />
        </NextUITooltip>
      )
    }
    return null
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(date) => format(new Date(date), 'MMM').charAt(0)}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="amount" stroke="#fff" fill="rgba(255,255,255,0.1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
