export const LOGO_TAGS = [
  'Minimal',
  'Bold',
  'Playful',
  'Abstract',
  'Geometric',
  'Organic',
  'Modern',
  'Monogram',
  'Futuristic',
  'Delicate',
  'Mascot',
  'Counterform',
  'Pixel',
] as const

export const PRICE_RANGES = ['< $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000+'] as const

export type LogoTag = (typeof LOGO_TAGS)[number]
export type PriceRange = (typeof PRICE_RANGES)[number]
