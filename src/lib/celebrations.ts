import type { BadgeId, MedalId, SaveData } from '../types'
import { BADGES, type Badge } from './badges'
import { MEDALS, type Medal } from './medals'

export type Celebration = { kind: 'medal'; medal: Medal } | { kind: 'badge'; badge: Badge }

/** Medaile a odznaky, které už dítě vidělo (nebo se neoslavují — načtení, import, reset). */
export interface Known {
  badges: readonly BadgeId[]
  medals: readonly MedalId[]
}

/** Nové oslavy: nejdřív medaile, pak odznaky. */
export function newCelebrations(known: Known, save: SaveData): Celebration[] {
  const medals = MEDALS.filter((medal) => save.medals.includes(medal.id) && !known.medals.includes(medal.id))
  const badges = BADGES.filter((badge) => save.badges.includes(badge.id) && !known.badges.includes(badge.id))
  return [
    ...medals.map((medal) => ({ kind: 'medal' as const, medal })),
    ...badges.map((badge) => ({ kind: 'badge' as const, badge })),
  ]
}

export function celebrationKey(celebration: Celebration): string {
  return celebration.kind === 'medal' ? `medal:${celebration.medal.id}` : `badge:${celebration.badge.id}`
}
