export const LOGO_TAGS = [
  'Minimal',
  'Bold',
  'Geometric',
  'Typography',
  'Abstract',
  'Iconic',
  'Monochrome',
  'Colorful'
] as const

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Entertainment',
  'Retail',
  'Food & Beverage'
] as const

export const PRICE_RANGES = [
  '< $1,000',
  '$1,000 - $3,000',
  '$3,000 - $5,000',
  '$5,000+'
] as const

export type LogoTag = typeof LOGO_TAGS[number]
export type Industry = typeof INDUSTRIES[number]
export type PriceRange = typeof PRICE_RANGES[number] 