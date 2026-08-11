import type { Logo } from '@prisma/client'
import Redis from 'ioredis'
import type { LogoWithDetails } from '@/types'

let redisInstance: Redis | null = null

function createRedisClient(): Redis {
  if (redisInstance) return redisInstance

  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Disable retries
    enableOfflineQueue: false,
    lazyConnect: true, // Don't connect immediately
  })

  // Handle connection events
  client.on('error', (error: Error & { code?: string }) => {
    if (error.code === 'ECONNREFUSED') {
      // Only log once when connection is refused
      if (client.status === 'wait') {
        console.warn('Redis connection refused. Cache functionality will be disabled.')
      }
    } else {
      console.warn('Redis error:', error.message)
    }
  })

  client.on('connect', () => {
    console.info('Redis connected successfully')
  })

  redisInstance = client
  return client
}

// Create Redis client
const redis = createRedisClient()

// Fallback functions when Redis is unavailable
async function fallbackGetFromCache<T>(): Promise<T | null> {
  return null
}

async function fallbackSetCache(): Promise<void> {
  return
}

// Cache configuration
const CACHE_TTL = 300 // 5 minutes in seconds
const _CACHE_WARM_UP_INTERVAL = 240 // 4 minutes in seconds

// Cache keys
export const CACHE_KEYS = {
  ALL_LOGOS: 'all_logos_v3',
  LOGO_BY_ID: (id: string) => `logo:${id}`,
  GROUPED_LOGOS: 'grouped_logos',
}

// Cache utilities with fallback
export async function setCacheWithTTL<T>(key: string, data: T): Promise<void> {
  try {
    if (!redis.status || redis.status !== 'ready') {
      return fallbackSetCache()
    }
    await redis.setex(key, CACHE_TTL, JSON.stringify(data))
  } catch (error) {
    if (error instanceof Error && !error.message.includes('ECONNREFUSED')) {
      console.warn(`Cache set error for key ${key}:`, error)
    }
    return fallbackSetCache()
  }
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    if (!redis.status || redis.status !== 'ready') {
      return fallbackGetFromCache()
    }
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    if (error instanceof Error && !error.message.includes('ECONNREFUSED')) {
      console.warn(`Cache get error for key ${key}:`, error)
    }
    return fallbackGetFromCache()
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    if (!redis.status || redis.status !== 'ready') {
      return
    }
    await redis.del(key)
  } catch (error) {
    if (error instanceof Error && !error.message.includes('ECONNREFUSED')) {
      console.warn(`Cache invalidation error for key ${key}:`, error)
    }
  }
}

// Cache monitoring
export async function getCacheStats(): Promise<{
  hitRate: number
  missRate: number
  keyCount: number
  isConnected: boolean
}> {
  try {
    if (!redis.status || redis.status !== 'ready') {
      return { hitRate: 0, missRate: 0, keyCount: 0, isConnected: false }
    }
    const info = await redis.info()
    const keyCount = await redis.dbsize()
    const hits = Number.parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0', 10)
    const misses = Number.parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0', 10)
    const total = hits + misses

    return {
      hitRate: total ? hits / total : 0,
      missRate: total ? misses / total : 0,
      keyCount,
      isConnected: true,
    }
  } catch (error) {
    if (error instanceof Error && !error.message.includes('ECONNREFUSED')) {
      console.warn('Error getting cache stats:', error)
    }
    return { hitRate: 0, missRate: 0, keyCount: 0, isConnected: false }
  }
}

// Cache warm-up
export async function warmUpCache(logos: Logo[] | LogoWithDetails[]): Promise<void> {
  try {
    if (!redis.status || redis.status !== 'ready') {
      return
    }
    await Promise.all([
      setCacheWithTTL(CACHE_KEYS.ALL_LOGOS, logos),
      ...logos.map((logo) => setCacheWithTTL(CACHE_KEYS.LOGO_BY_ID(logo.id), logo)),
    ])
  } catch (error) {
    if (error instanceof Error && !error.message.includes('ECONNREFUSED')) {
      console.warn('Cache warm-up error:', error)
    }
  }
}

export default redis
