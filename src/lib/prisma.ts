import { PrismaClient, Prisma } from '@prisma/client'
import { EventEmitter } from 'node:events'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' }
  ],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  
  // Create an event emitter for Prisma events
  const prismaEvents = new EventEmitter()
  prismaEvents.setMaxListeners(20)

  // Handle process events
  process.on('beforeExit', () => {
    void prisma.$disconnect()
  })

  // Handle Prisma error events
  prisma.$use(async (params, next) => {
    try {
      return await next(params)
    } catch (error) {
      console.error('Prisma Error:', error)
      throw error
    }
  })
}

// Only connect once
if (!globalForPrisma.prisma) {
  void prisma.$connect()
    .then(() => console.log('Database connected successfully'))
    .catch((error: Error) => {
      console.error('Failed to connect to database:', error)
      process.exit(1)
    })
}

export default prisma 