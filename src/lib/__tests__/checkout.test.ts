import { describe, expect, test } from '@jest/globals'
import { calculatePrice, PRICE_TIERS } from '../price-constants'
import { validatePrices } from '../validate-prices'
import { syncPrices } from '../price-sync'
import { stripe } from '../stripe'

describe('Checkout Flow', () => {
  test('calculates correct prices with add-ons', () => {
    const base = calculatePrice('summon')
    expect(base).toBe(PRICE_TIERS.summon)
    
    const withWordmark = calculatePrice('summon', { wordmark: 'test' })
    expect(withWordmark).toBe(PRICE_TIERS.summon + 1500)
  })

  test('validates prices match PRICE_TIERS', async () => {
    const isValid = await validatePrices()
    expect(isValid).toBe(true)
  })

  test('syncs prices successfully', async () => {
    await syncPrices()
    const isValid = await validatePrices()
    expect(isValid).toBe(true)
  })
}) 