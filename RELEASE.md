# Release notes — Aug 2026

## Storefront

- **Pretty logo URLs** — public pages use title slugs (`/agave-sunshine`). Old cuid links permanently redirect.
- **Designer credit** — “Designed by …” under the description opens a hover card with avatar, username, `@handle`, and that designer’s logos.
- **Tag pills** on cards and a stable homepage filter row (selected tags no longer jump to the front).
- **Pricing card elevation** — tab track recesses correctly against the card surface.

## Admin

- **Logo status model** — Live / Submitted / Draft / Rejected / Sold / Trash. Soft-delete to Trash; hard delete only from Trash. Sold stays Stripe-owned and locked.
- **Designer on create/edit** — pick an existing designer or add name + email (upsert by email).
- **Admin preview** for non-listed logos at `/admin/logos/preview/[id]`.
- Status badge colors: Submitted purple, Rejected yellow.

## Email / infra

- Designer outreach compose + deliverability hardening (plain text for Apple MX, List-Unsubscribe, sanitized Resend tags).
- Migrations on deploy: `TRASH` status enum, `Logo.slug` (unique, backfilled from title).

## Deploy checklist

1. Push to `main` (build runs `prisma migrate deploy`).
2. Confirm migrations applied in prod logs.
3. Smoke: home → `/agave-sunshine`, designer hover, admin status/trash, checkout start.
