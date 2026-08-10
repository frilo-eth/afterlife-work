import { prisma } from './prisma'

export async function ensureDbConnection() {
  let retries = 5
  while (retries > 0) {
    try {
      await prisma.$connect()
      console.log('Database connection established')
      return true
    } catch (error) {
      console.error(`Database connection attempt failed. Retries left: ${retries}`)
      retries--
      if (retries === 0) {
        console.error('All database connection attempts failed')
        throw error
      }
      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
  return false
}
