import { describe, expect, test } from 'vitest'
import { ITEMS } from '../data/items'
import { BASE_ASSETS, resolveAsset, thumbnailViewBox } from '../graphics'

describe('registr grafiky', () => {
  test('každý kousek z katalogu má grafiku', () => {
    for (const item of ITEMS) expect(resolveAsset(item.asset), item.id).not.toBeNull()
  })

  test('pozadí a tělo mají grafiku', () => {
    for (const asset of Object.values(BASE_ASSETS)) expect(resolveAsset(asset)?.kind, asset).toBe('svg')
  })

  test('cesta k PNG se vykreslí jako obrázek s base cestou aplikace', () => {
    expect(resolveAsset('doll/dress-pink.png')).toEqual({ kind: 'image', href: `${import.meta.env.BASE_URL}doll/dress-pink.png` })
    expect(resolveAsset('/doll/hair.WEBP')).toEqual({ kind: 'image', href: `${import.meta.env.BASE_URL}doll/hair.WEBP` })
  })

  test('neznámá grafika vrátí null místo pádu', () => {
    expect(resolveAsset('neexistuje')).toBeNull()
    expect(resolveAsset('constructor')).toBeNull()
  })

  test('náhled doplňku bez vlastního výřezu ukáže jeho místo na těle', () => {
    expect(thumbnailViewBox({ category: 'accessory', asset: 'neznamy', slot: 'neck' })).toBe('96 180 108 90')
    expect(thumbnailViewBox({ category: 'accessory', asset: 'neznamy', slot: 'ears' })).toBe('70 100 160 90')
  })
})
