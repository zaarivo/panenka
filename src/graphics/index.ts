import type { ComponentType } from 'react'
import type { AccessorySlot, Category, Item } from '../types'
import { ACCESSORY_ASSETS } from './accessories'
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
  ...ACCESSORY_ASSETS,
}

const CATEGORY_THUMBNAIL: Record<Category, string> = {
  hair: '62 24 186 186',
  dress: '50 196 200 340',
  shoes: '96 452 108 112',
  accessory: '0 0 300 600',
}

const SLOT_THUMBNAIL: Record<AccessorySlot, string> = {
  head: '76 22 148 148',
  face: '84 84 132 100',
  neck: '96 180 108 90',
  hand: '170 300 90 110',
  ears: '70 100 160 90',
}

const ASSET_THUMBNAIL: Readonly<Record<string, string>> = {
  'acc-bow-pink': '76 28 148 148',
  'acc-crown': '76 22 148 148',
  'acc-glasses': '84 84 132 100',
  'acc-necklace': '104 186 92 72',
  'acc-bag': '176 318 76 92',
  'acc-hat-straw': '66 10 168 120',
  'acc-scarf-red': '100 190 100 100',
  'acc-scarf-stripes': '100 190 100 100',
  'acc-umbrella': '150 172 134 200',
  'acc-balloon': '170 130 110 236',
  'acc-bouquet': '186 300 70 80',
  'shoes-rainboots-yellow': '90 436 120 132',
  'shoes-skates': '96 452 108 122',
}

/** Výřez plátna, který v náhledu ukáže hlavně daný kousek. */
export function thumbnailViewBox(item: Pick<Item, 'category' | 'asset' | 'slot'>): string {
  if (Object.hasOwn(ASSET_THUMBNAIL, item.asset)) return ASSET_THUMBNAIL[item.asset]
  if (item.category === 'accessory' && item.slot) return SLOT_THUMBNAIL[item.slot]
  return CATEGORY_THUMBNAIL[item.category]
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
