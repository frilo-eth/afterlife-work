import { format } from 'date-fns'
import type { ReactNode } from 'react'
import { fetchAnalyticsDashboard } from '@/app/actions/analytics'
import {
  AnalyticsDailyChart,
  AnalyticsTopLogosChart,
} from '@/components/admin/AnalyticsCharts'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function pct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <header className="mb-4 space-y-1">
        <h2 className="text-heading-16 text-foreground">{title}</h2>
        {description ? (
          <p className="text-caption text-foreground-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

export default async function AnalyticsPage() {
  const data = await fetchAnalyticsDashboard(30)
  const maxFunnel = Math.max(...data.funnel.map((s) => s.count), 1)
  const maxSubmit = Math.max(...data.submitFunnel.map((s) => s.count), 1)

  const stats = [
    {
      label: 'Logo views',
      value: data.totals.views.toLocaleString(),
      description: 'Product page opens',
    },
    {
      label: 'Checkouts started',
      value: data.totals.checkoutsStarted.toLocaleString(),
      description: 'Entered Stripe',
    },
    {
      label: 'Purchases',
      value: data.totals.orders.toLocaleString(),
      description: `${pct(data.totals.conversionRate)} of views`,
    },
    {
      label: 'Revenue',
      value: money(data.totals.revenue),
      description: `${data.totals.submitsCompleted} submissions`,
    },
  ]

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-heading-24 text-foreground">Observability</h1>
        <p className="text-caption text-foreground-muted max-w-xl text-pretty">
          Last {data.rangeDays} days — funnels, engagement, and purchase activity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-caption text-foreground-muted">{stat.label}</p>
            <p className="mt-1 text-heading-24 text-foreground tabular-nums">{stat.value}</p>
            <p className="mt-1 text-caption text-foreground-subtle">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Purchase funnel"
          description={`View → checkout → pay · conversion ${pct(data.totals.conversionRate)}`}
        >
          <div className="space-y-3">
            {data.funnel.map((step) => (
              <div key={step.key} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-caption text-foreground">{step.label}</span>
                  <span className="text-caption tabular-nums text-foreground-muted">
                    {step.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-foreground transition-all"
                    style={{ width: `${Math.max(4, (step.count / maxFunnel) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Submit funnel" description="Open → completed submission">
          <div className="space-y-3">
            {data.submitFunnel.map((step) => (
              <div key={step.key} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-caption text-foreground">{step.label}</span>
                  <span className="text-caption tabular-nums text-foreground-muted">
                    {step.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-foreground/70 transition-all"
                    style={{ width: `${Math.max(4, (step.count / maxSubmit) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Daily activity">
        <AnalyticsDailyChart data={data.daily} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top logos">
          <AnalyticsTopLogosChart data={data.topLogos} />
        </Panel>

        <Panel title="Recent events">
          {data.recent.length === 0 ? (
            <p className="text-caption text-foreground-muted">
              Events will appear as people browse, submit, and checkout.
            </p>
          ) : (
            <ul className="max-h-[280px] space-y-2 overflow-y-auto">
              {data.recent.map((event) => (
                <li
                  key={event.id}
                  className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-caption text-foreground">{event.name}</p>
                    <p className="truncate text-metadata text-foreground-subtle">
                      {event.path || event.logoId || '—'}
                    </p>
                  </div>
                  <time className="shrink-0 text-metadata tabular-nums text-foreground-subtle">
                    {format(new Date(event.createdAt), 'MMM d HH:mm')}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
