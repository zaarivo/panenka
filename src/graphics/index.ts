import type { ComponentType } from 'react'
import type { Category, Item } from '../types'
import { AccBag, AccBowPink, AccCrown, AccGlasses, AccNecklace } from './accessories'
import { Background, Body } from './base'
import { DRESS_ASSETS } from './dress'
import { HAIR_ASSETS } from './hair'
import { SHOES_ASSETS } from './shoes'

export { CANVAS, CANVAS_VIEWBOX } from './shared'

/** Grafika pozadí a těla — dají se stejně jako oblečení nahradit cestou k PNG. */
export const BASE_ASSETS = { background: 'background', body: 'body' } as const

const SVG_ASSETS: Readonly<Record<string, ComponentType>> = {
  background: Background,
  body: Body,
  ...HAIR_ASSETS,
  ...DRESS_ASSETS,
  ...SHOES_ASSETS,
  'acc-bow-pink': AccBowPink,
  'acc-glasses': AccGlasses,
  'acc-necklace': AccNecklace,
  'acc-bag': AccBag,
  'acc-crown': AccCrown,
}

const CATEGORY_THUMBNAIL: Record<Category, string> = {
  hair: '62 24 186 186',
  dress: '50 196 200 340',
  shoes: '96 452 108 112',
  accessory: '0 0 300 600',
}

const ASSET_THUMBNAIL: Readonly<Record<string, string>> = {
  'acc-bow-pink': '76 28 148 148',
  'acc-crown': '76 22 148 148',
  'acc-glasses': '84 84 132 100',
  'acc-necklace': '104 186 92 72',
  'acc-bag': '176 318 76 92',
  'shoes-rainboots-yellow': '90 436 120 132',
  'shoes-skates': '96 452 108 122',
}

/** Výřez plátna, který v náhledu ukáže hlavně daný kousek. */
export function thumbnailViewBox(item: Pick<Item, 'category' | 'asset'>): string {
  return Object.hasOwn(ASSET_THUMBNAIL, item.asset) ? ASSET_THUMBNAIL[item.asset] : CATEGORY_THUMBNAIL[item.category]
}

export type ResolvedAsset = { kind: 'svg'; Component: ComponentType } | { kind: 'image'; href: string }

const IMAGE_ASSET = /\.(png|webp|jpe?g)$/i

/**
 * `asset` je buď klíč vestavěné SVG grafiky, nebo cesta k obrázku v `public/`
 * (např. `doll/dress-pink.png`). Obrázek musí mít rozměr plátna 300 × 600 s průhledným pozadím.
 */
export function resolveAsset(asset: string): ResolvedAsset | null {
  if (IMAGE_ASSET.test(asset)) {
    return { kind: 'image', href: import.meta.env.BASE_URL + asset.replace(/^\/+/, '') }
  }
  return Object.hasOwn(SVG_ASSETS, asset) ? { kind: 'svg', Component: SVG_ASSETS[asset] } : null
}
