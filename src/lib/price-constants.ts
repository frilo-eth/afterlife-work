export const PRICE_TIERS = {
  summon: 1000,  // $1000 USD
  revival: 5000  // $5000 USD
} as const

export type PriceTier = keyof typeof PRICE_TIERS

export function calculatePrice(tier: PriceTier, options?: {
  wordmark?: boolean | string,
  domain?: string
}) {
  let basePrice = PRICE_TIERS[tier]
  
  if (options?.wordmark) basePrice += 1500
  if (options?.domain) basePrice += 2000
  
  return basePrice
} 