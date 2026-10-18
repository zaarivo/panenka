import { ITEMS_BY_ID } from '../data/items'
import type { Rng, SaveData, Tier } from '../types'

export function rewardForCorrect(tier: Tier): number {
  return tier === 'hard' ? 15 : 10
}

export const CHEST_MIN = 20
export const CHEST_MAX = 40

export function rollChestReward(rng: Rng = Math.random): number {
  return CHEST_MIN + Math.floor(rng() * (CHEST_MAX - CHEST_MIN + 1))
}

export type BuyFailure = 'unknown-item' | 'not-for-sale' | 'already-owned' | 'not-enough-gold'

export type BuyResult = { ok: true; save: SaveData } | { ok: false; reason: BuyFailure }

export function buyItem(save: SaveData, itemId: string): BuyResult {
  const item = ITEMS_BY_ID.get(itemId)
  if (!item) return { ok: false, reason: 'unknown-item' }
  if (item.price === null) return { ok: false, reason: 'not-for-sale' }
  if (save.owned.includes(itemId)) return { ok: false, reason: 'already-owned' }
  if (save.gold < item.price) return { ok: false, reason: 'not-enough-gold' }

  return {
    ok: true,
    save: { ...save, gold: save.gold - item.price, owned: [...save.owned, itemId] },
  }
}
