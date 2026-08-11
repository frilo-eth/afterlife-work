# Product analytics

First-party event tracking for funnels and engagement. Vercel Analytics still covers pageviews; this stack is for product actions.

## Storage

Prisma model `AnalyticsEvent` → table `analytics_events` (migration `20260811220000_add_analytics_events`).

| Field | Use |
| --- | --- |
| `name` | Event type (see below) |
| `sessionId` | Anonymous client id or Stripe session |
| `logoId` | Related logo when known |
| `path` | Client pathname |
| `props` | Small JSON bag (tier, amount, etc.) |
| `createdAt` | Event time |

## Event names

| Name | Source |
| --- | --- |
| `logo_view` | Client — logo detail mount (skips `/admin`) |
| `submit_open` | Client — submit modal opens |
| `submit_complete` | Server — `/api/submit-logo` success |
| `checkout_started` | Server — `/api/create-checkout` |
| `checkout_completed` | Server — Stripe webhook |
| `checkout_failed` | Server — checkout error |
| `subscribe` | Reserved for client allowlist |

Client helper: `src/lib/track.ts` → `POST /api/track`  
Server helper: `src/lib/track-event.ts`

## Admin UI

`/admin/analytics` — last 30 days:

- KPIs (views, checkouts, purchases, revenue)
- Purchase funnel (view → checkout → pay)
- Submit funnel (open → complete)
- Daily activity chart
- Top logos by engagement
- Recent events

Nav tab: **Analytics** in the admin layout.

Aggregations live in `src/app/actions/analytics.ts`.

## Deploy note

Ensure migration `20260811220000_add_analytics_events` is applied on the production database before or with the deploy.
