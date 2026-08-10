import { performance } from 'node:perf_hooks'
import fetch from 'node-fetch'

interface CacheStats {
  hitRate: number
  missRate: number
  keyCount: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ITERATIONS = 100

async function runPerformanceTest() {
  console.log('Starting cache performance test...\n')

  // Test GET /api/logos endpoint
  let totalTimeWithoutCache = 0
  let totalTimeWithCache = 0

  console.log(`Running ${ITERATIONS} iterations...\n`)

  // First request (without cache)
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now()
    await fetch(`${API_URL}/api/logos`)
    const end = performance.now()
    totalTimeWithoutCache += end - start
  }

  // Second request (with cache)
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now()
    await fetch(`${API_URL}/api/logos`)
    const end = performance.now()
    totalTimeWithCache += end - start
  }

  const avgTimeWithoutCache = totalTimeWithoutCache / ITERATIONS
  const avgTimeWithCache = totalTimeWithCache / ITERATIONS
  const improvement = ((avgTimeWithoutCache - avgTimeWithCache) / avgTimeWithoutCache) * 100

  console.log('Performance Results:')
  console.log('-------------------')
  console.log(`Average response time without cache: ${avgTimeWithoutCache.toFixed(2)}ms`)
  console.log(`Average response time with cache: ${avgTimeWithCache.toFixed(2)}ms`)
  console.log(`Performance improvement: ${improvement.toFixed(2)}%\n`)

  // Test cache stats
  const statsResponse = await fetch(`${API_URL}/api/cache/stats`)
  const stats = (await statsResponse.json()) as CacheStats

  console.log('Cache Statistics:')
  console.log('----------------')
  console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`)
  console.log(`Miss Rate: ${(stats.missRate * 100).toFixed(2)}%`)
  console.log(`Total Keys: ${stats.keyCount}`)
}

runPerformanceTest().catch(console.error)
