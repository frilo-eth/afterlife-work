import { describe, expect, test } from '@jest/globals'
import { calculatePrice, PRICE_TIERS } from '../price-constants'

// These cover pricing arithmetic only — no database, no Stripe, no network.
//
// The previous version of this file also called validatePrices() and
// syncPrices(). Both read DATABASE_URL, and syncPrices() issues
// prisma.price.update across every logo in a transaction. Since DATABASE_URL
// points at the production database, `npm test` would have rewritten live
// prices. The suite could never actually run — jest-environment-jsdom was not
// installed — so it never did, but it was one `npm install` away from doing
// so. Exercising those functions needs a disposable test database.

describe('calculatePrice', () => {
  test('returns the base tier price with no add-ons', () => {
    expect(calculatePrice('summon')).toBe(PRICE_TIERS.summon)
    expect(calculatePrice('revival')).toBe(PRICE_TIERS.revival)
    expect(calculatePrice('afterlife')).toBe(PRICE_TIERS.afterlife)
  })

  test('adds the wordmark surcharge when wordmark text is supplied', () => {
    expect(calculatePrice('summon', { wordmark: 'Acme' })).toBe(PRICE_TIERS.summon + 1500)
  })

  test('adds the wordmark surcharge when wordmark is passed as a boolean', () => {
    expect(calculatePrice('summon', { wordmark: true })).toBe(PRICE_TIERS.summon + 1500)
  })

  test('adds the domain surcharge', () => {
    expect(calculatePrice('revival', { domain: 'acme.com' })).toBe(PRICE_TIERS.revival + 2000)
  })

  test('adds both surcharges together', () => {
    expect(calculatePrice('revival', { wordmark: 'Acme', domain: 'acme.com' })).toBe(
      PRICE_TIERS.revival + 1500 + 2000,
    )
  })

  test('ignores empty-string add-ons rather than charging for them', () => {
    expect(calculatePrice('summon', { wordmark: '', domain: '' })).toBe(PRICE_TIERS.summon)
  })

  test('does not apply add-ons to the afterlife subscription', () => {
    expect(calculatePrice('afterlife', { wordmark: 'Acme', domain: 'acme.com' })).toBe(
      PRICE_TIERS.afterlife,
    )
  })
})
