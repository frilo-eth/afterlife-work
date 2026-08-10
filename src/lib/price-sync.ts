import { PRICE_TIERS } from './price-constants'
import { prisma } from './prisma'

type LogoWithPrice = {
  id: string
  price: {
    id: string
    summon: number
    revival: number
  }
}

export async function syncPrices() {
  const logos = await prisma.logo.findMany({
    include: { price: true },
  })

  const updates = logos.map((logo: LogoWithPrice) =>
    prisma.price.update({
      where: { id: logo.price.id },
      data: {
        summon: PRICE_TIERS.summon,
        revival: PRICE_TIERS.revival,
      },
    }),
  )

  await prisma.$transaction(updates)
  console.log(`Synced prices for ${updates.length} logos`)
}
