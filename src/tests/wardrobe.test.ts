import { describe, expect, test } from 'vitest'
import { createDefaultSave } from '../lib/storage'
import { toggleEquip } from '../lib/wardrobe'

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
