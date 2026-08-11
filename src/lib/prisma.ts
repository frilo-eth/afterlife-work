import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  prismaMiddlewareAttached?: boolean
}

function createPrismaClient() {
  return new PrismaClient({
    log: [
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    errorFormat: 'pretty',
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma

  // Guard against HMR re-attaching $use on every reload (stacks forever).
  if (!globalForPrisma.prismaMiddlewareAttached) {
    prisma.$use(async (params, next) => {
      try {
        return await next(params)
      } catch (error) {
        console.error('Prisma Error:', error)
        throw error
      }
    })
    globalForPrisma.prismaMiddlewareAttached = true
  }
}

export default prisma
