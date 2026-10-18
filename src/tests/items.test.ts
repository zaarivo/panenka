import { describe, expect, test } from 'vitest'
import { ITEMS, STARTER_ITEMS } from '../data/items'
import { ACCESSORY_SLOTS, BADGE_IDS, CATEGORIES, LAYER_ORDER } from '../types'

const PRICE_RANGES = {
  hair: [30, 120],
  dress: [40, 150],
  shoes: [20, 110],
  accessory: [15, 80],
} as const

const buyable = (category: (typeof CATEGORIES)[number]) =>
  ITEMS.filter((item) => item.category === category && item.price !== null && item.price > 0)

describe('katalog oblečení', () => {
  test('id jsou unikátní', () => {
    const ids = ITEMS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('každá kategorie má právě 1 startovní kousek zdarma', () => {
    for (const category of CATEGORIES) {
      expect(ITEMS.filter((item) => item.category === category && item.price === 0), category).toHaveLength(1)
    }
    expect(STARTER_ITEMS).toHaveLength(CATEGORIES.length)
  })

  test('šaty: aspoň 10 kousků na koupi', () => {
    expect(buyable('dress').length).toBeGreaterThanOrEqual(10)
  })

  test('boty: aspoň 10 kousků na koupi', () => {
    expect(buyable('shoes').length).toBeGreaterThanOrEqual(10)
  })

  test('vlasy: aspoň 10 kousků na koupi', () => {
    expect(buyable('hair').length).toBeGreaterThanOrEqual(10)
  })

  test('placené kousky mají cenu v dohodnutém rozsahu', () => {
    for (const item of ITEMS) {
      if (item.price === null || item.price === 0) continue
      const [min, max] = PRICE_RANGES[item.category]
      expect(item.price, item.id).toBeGreaterThanOrEqual(min)
      expect(item.price, item.id).toBeLessThanOrEqual(max)
    }
  })

  test('nekoupitelné kousky se odemykají existujícím odznakem', () => {
    const locked = ITEMS.filter((item) => item.price === null)
    expect(locked.map((item) => item.id)).toEqual(['acc-crown'])
    for (const item of locked) expect(BADGE_IDS).toContain(item.unlockBadge)
  })

  test('každý doplněk má platné místo na těle, jiné kousky žádné', () => {
    for (const item of ITEMS) {
      if (item.category === 'accessory') expect(ACCESSORY_SLOTS, item.id).toContain(item.slot)
      else expect(item.slot, item.id).toBeUndefined()
    }
  })

  test('kategorie a vrstvy mají platné hodnoty', () => {
    for (const item of ITEMS) {
      expect(CATEGORIES, item.id).toContain(item.category)
      expect(LAYER_ORDER, item.id).toContain(item.layer)
      expect(['background', 'body'], item.id).not.toContain(item.layer)
      expect(item.name.length, item.id).toBeGreaterThan(0)
      expect(item.asset.length, item.id).toBeGreaterThan(0)
    }
  })
})
