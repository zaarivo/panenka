import type { ComponentType } from 'react'
import { AccBag, AccBowPink, AccCrown, AccGlasses, AccNecklace } from './accessories'
import { Background, Body } from './base'
import { DressBallPurple, DressPink, DressTshirtBlue, DressYellowDots } from './dress'
import { HairBobBlack, HairBraidsRed, HairLongBlonde, HairPonytailBrown } from './hair'
import { ShoesBootsBrown, ShoesFlatsRed, ShoesSandalsMint, ShoesSneakersWhite } from './shoes'

export { CANVAS, CANVAS_VIEWBOX } from './shared'

/** Grafika pozadí a těla — dají se stejně jako oblečení nahradit cestou k PNG. */
export const BASE_ASSETS = { background: 'background', body: 'body' } as const

const SVG_ASSETS: Readonly<Record<string, ComponentType>> = {
  background: Background,
  body: Body,
  'hair-ponytail-brown': HairPonytailBrown,
  'hair-long-blonde': HairLongBlonde,
  'hair-braids-red': HairBraidsRed,
  'hair-bob-black': HairBobBlack,
  'dress-tshirt-blue': DressTshirtBlue,
  'dress-pink': DressPink,
  'dress-yellow-dots': DressYellowDots,
  'dress-ball-purple': DressBallPurple,
  'shoes-sneakers-white': ShoesSneakersWhite,
  'shoes-flats-red': ShoesFlatsRed,
  'shoes-boots-brown': ShoesBootsBrown,
  'shoes-sandals-mint': ShoesSandalsMint,
  'acc-bow-pink': AccBowPink,
  'acc-glasses': AccGlasses,
  'acc-necklace': AccNecklace,
  'acc-bag': AccBag,
  'acc-crown': AccCrown,
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
