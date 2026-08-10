export const PRICE_TIERS = {
  summon: 2500, // $2,500 USD one-time
  revival: 5000, // $5,000 USD one-time
  afterlife: 10000, // $10,000 USD / month
} as const

export type PriceTier = keyof typeof PRICE_TIERS

export const AFTERLIFE_PRICE_LABEL = `$${PRICE_TIERS.afterlife.toLocaleString()}/mo`

export function calculatePrice(
  tier: PriceTier,
  options?: {
    wordmark?: boolean | string
    domain?: string
  },
) {
  let basePrice = PRICE_TIERS[tier]

  // Afterlife is a flat monthly subscription — add-ons do not apply.
  if (tier === 'afterlife') return basePrice

  if (options?.wordmark) basePrice += 1500
  if (options?.domain) basePrice += 2000

  return basePrice
}
