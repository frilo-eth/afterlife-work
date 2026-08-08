import { prisma } from './prisma'
import { PRICE_TIERS } from './price-constants'

type LogoWithPrice = {
  id: string
  title: string
  price: {
    id: string
    summon: number
    revival: number
  }
}

export async function validatePrices() {
  const logos = await prisma.logo.findMany({
    include: { price: true }
  })

  const invalidPrices = logos.filter((logo: LogoWithPrice) => {
    return (
      logo.price.summon !== PRICE_TIERS.summon ||
      logo.price.revival !== PRICE_TIERS.revival
    )
  })

  if (invalidPrices.length > 0) {
    console.error('Found logos with mismatched prices:', 
      invalidPrices.map((l: LogoWithPrice) => ({
        id: l.id,
        title: l.title,
        summon: l.price.summon,
        revival: l.price.revival
      }))
    )
    return false
  }

  return true
} 