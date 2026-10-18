import { ITEMS } from '../data/items'
import type { BadgeId, Item, SaveData } from '../types'

/** Cíl odznaku „Královna počítání“, který odemyká Zlatou korunku. */
export const ROYAL_TARGET = 300

export interface Badge {
  id: BadgeId
  name: string
  description: string
  target: number
  progress: (save: SaveData) => number
}

export const BADGES: readonly Badge[] = [
  {
    id: 'first-step',
    name: 'První krok',
    description: 'Vyřeš správně 10 příkladů.',
    target: 10,
    progress: (save) => save.stats.totalCorrect,
  },
  {
    id: 'times-table-star',
    name: 'Násobilková hvězda',
    description: 'Vyřeš 10 příkladů z násobilky v řadě bez chyby.',
    target: 10,
    progress: (save) => save.stats.multiplicationStreak,
  },
  {
    id: 'diligent-pupil',
    name: 'Pilná školačka',
    description: 'Vyřeš správně 100 příkladů.',
    target: 100,
    progress: (save) => save.stats.totalCorrect,
  },
  {
    id: 'clever-counter',
    name: 'Šikovná počtářka',
    description: 'Vyřeš správně 200 příkladů.',
    target: 200,
    progress: (save) => save.stats.totalCorrect,
  },
  {
    id: 'counting-queen',
    name: 'Královna počítání',
    description: 'Vyřeš správně 300 příkladů.',
    target: ROYAL_TARGET,
    progress: (save) => save.stats.totalCorrect,
  },
]

export function itemsUnlockedBy(badgeId: BadgeId): Item[] {
  return ITEMS.filter((item) => item.unlockBadge === badgeId)
}

/** Přidá nově splněné odznaky a k nim odemčené kousky. Kousky doplní i k už dříve získaným odznakům. */
export function awardBadges(save: SaveData): { save: SaveData; newBadges: Badge[] } {
  const newBadges = BADGES.filter((badge) => !save.badges.includes(badge.id) && badge.progress(save) >= badge.target)
  const badges = [...save.badges, ...newBadges.map((badge) => badge.id)]
  const unlocked = badges.flatMap(itemsUnlockedBy).map((item) => item.id)
  const missing = unlocked.filter((id) => !save.owned.includes(id))

  if (newBadges.length === 0 && missing.length === 0) return { save, newBadges }
  return { save: { ...save, badges, owned: [...save.owned, ...missing] }, newBadges }
}
