'use client'

import { Card } from '@nextui-org/react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface CostMetric {
  name: string
  current: number
  previous: number
  trend: number // Percentage change
  unit: string
}

interface CostAnalysisProps {
  metrics: CostMetric[]
  burnRate: number // Monthly burn rate in cents
  estimatedAnnual: number // Estimated annual cost in cents
}

export function CostAnalysis({ metrics, burnRate, estimatedAnnual }: CostAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100)
  }

  return (
    <div className="space-y-6">
      {/* Monthly Burn Rate */}
      <div className="rounded-lg bg-black/40">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-white/60" />
          <h3 className="text-sm font-medium text-white/80">Monthly Burn Rate</h3>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(burnRate)}</p>
        <p className="text-xs text-white/40 mt-1">
          Estimated Annual: {formatCurrency(estimatedAnnual)}
        </p>
      </div>

      {/* Cost Metrics */}
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div 
            key={metric.name}
            className="rounded-lg bg-black/40"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">{metric.name}</span>
              <div className="flex items-center gap-1">
                {metric.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-xs ${
                  metric.trend > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {Math.abs(metric.trend)}%
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-medium">
                {metric.unit === 'currency' 
                  ? formatCurrency(metric.current)
                  : `${metric.current}${metric.unit}`
                }
              </p>
              <p className="text-sm text-white/40">
                vs {metric.unit === 'currency'
                  ? formatCurrency(metric.previous)
                  : `${metric.previous}${metric.unit}`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 