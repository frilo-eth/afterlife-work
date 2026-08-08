import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function getAllLogos() {
  try {
    const logos = await db.logo.findMany({
      include: { price: true },
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' }
    })
    return logos
  } catch (error) {
    console.error('Error fetching logos:', error)
    throw error
  }
}
