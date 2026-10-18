import { describe, expect, test } from 'vitest'
import { ITEMS_BY_ID } from '../data/items'
import { createDefaultSave } from '../lib/storage'
import { equipSlot, toggleEquip } from '../lib/wardrobe'

const withOwned = (...ids: string[]) => {
  const save = createDefaultSave()
  return { ...save, owned: [...save.owned, ...ids] }
}

describe('oblékání v šatníku', () => {
  test('klepnutí na vlastněný kousek ho nasadí místo dosavadního', () => {
    const save = toggleEquip(withOwned('dress-pink'), 'dress-pink')
    expect(save.equipped.dress).toBe('dress-pink')
  })

  test('klepnutí na nasazené šaty, boty nebo doplněk je sundá', () => {
    let save = createDefaultSave()
    for (const id of ['dress-tshirt-blue', 'shoes-sneakers-white', 'acc-bow-pink']) save = toggleEquip(save, id)
    expect(save.equipped).toEqual({ hair: 'hair-ponytail-brown' })
  })

  test('vlasy nejdou sundat, jen vyměnit', () => {
    const start = withOwned('hair-bob-black')
    expect(toggleEquip(start, 'hair-ponytail-brown')).toBe(start)
    expect(toggleEquip(start, 'hair-bob-black').equipped.hair).toBe('hair-bob-black')
  })

  test('nevlastněný nebo neznámý kousek nic nezmění', () => {
    const save = createDefaultSave()
    expect(toggleEquip(save, 'dress-pink')).toBe(save)
    expect(toggleEquip(save, 'nic')).toBe(save)
  })

  test('původní stav zůstane nezměněný', () => {
    const save = createDefaultSave()
    toggleEquip(save, 'dress-tshirt-blue')
    expect(save.equipped.dress).toBe('dress-tshirt-blue')
  })
})

describe('doplňky podle místa na těle', () => {
  test('brýle, náhrdelník a kabelka jdou nasadit zároveň s mašlí', () => {
    let save = withOwned('acc-glasses', 'acc-necklace', 'acc-bag')
    for (const id of ['acc-glasses', 'acc-necklace', 'acc-bag']) save = toggleEquip(save, id)
    expect(save.equipped).toMatchObject({
      'accessory:head': 'acc-bow-pink',
      'accessory:face': 'acc-glasses',
      'accessory:neck': 'acc-necklace',
      'accessory:hand': 'acc-bag',
    })
  })

  test('korunka vymění mašli, protože obě patří na hlavu', () => {
    const save = toggleEquip(withOwned('acc-crown'), 'acc-crown')
    expect(save.equipped['accessory:head']).toBe('acc-crown')
    expect(Object.values(save.equipped)).not.toContain('acc-bow-pink')
  })

  test('místo nasazení podle kousku', () => {
    expect(equipSlot(ITEMS_BY_ID.get('acc-glasses')!)).toBe('accessory:face')
    expect(equipSlot(ITEMS_BY_ID.get('dress-pink')!)).toBe('dress')
  })
})
