# Logo pricing selector

UI: `src/components/ui/PricingSelectorTabs.tsx` on the public logo slug page.  
Prices: `src/lib/price-constants.ts`.

## Tiers

| Tier | Kind | Notes |
| --- | --- | --- |
| **Summon** | One-time | Instant download; with wordmark → delivery in 2–3 work days |
| **Revival** | One-time | Delivery in 2–3 work days; with wordmark → 5–7 work days |
| **Afterlife** | Monthly subscription | More benefit rows (no wordmark controls). CTA: Subscribe |

Higher tiers lead with “Everything in {previous}” and only list what’s new.

## Wordmark add-on

Summon / Revival only:

- Toggle **Add wordmark** (+$1,500)
- Brand name input when on
- Hero price rolls to include the add-on; CTA stays **Buy now**

Afterlife has no wordmark block — extra benefit lines use that space. A shared min-height keeps the card from shrinking vs one-time tiers.

## Checkout

`POST /api/create-checkout` uses `calculatePrice(tier, options)`.  
Afterlife is a Stripe subscription; Summon / Revival are one-time payments. Wordmark is ignored on Afterlife.
