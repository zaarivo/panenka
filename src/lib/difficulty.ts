import { TIERS, type Tier } from '../types'

export const CORRECT_IN_ROW_TO_LEVEL_UP = 5
export const MISTAKES_IN_ROW_TO_LEVEL_DOWN = 2
export const CORRECT_IN_ROW_FOR_CHEST = 5

/** Obtížnost a řady jedné kategorie. Řady platí jen v rámci sezení. */
export interface TopicProgress {
  tier: Tier
  correctStreak: number
  mistakeStreak: number
}

export interface TopicProgressUpdate {
  progress: TopicProgress
  tierChange: -1 | 0 | 1
}

const index = (tier: Tier) => TIERS.indexOf(tier)

/** Nejbližší zaškrtnutá obtížnost v daném směru (mezery se přeskočí); na kraji zůstane. */
export function stepTier(tier: Tier, allowed: readonly Tier[], direction: 1 | -1): Tier {
  const candidates = TIERS.filter((t) => allowed.includes(t) && (index(t) - index(tier)) * direction > 0)
  if (candidates.length === 0) return tier
  return direction === 1 ? candidates[0] : candidates[candidates.length - 1]
}

/** Je-li obtížnost zaškrtnutá, zůstane; jinak nejbližší zaškrtnutá, při shodě lehčí. */
export function clampTier(tier: Tier, allowed: readonly Tier[]): Tier {
  if (allowed.length === 0 || allowed.includes(tier)) return tier
  return [...allowed].sort((a, b) => Math.abs(index(a) - index(tier)) - Math.abs(index(b) - index(tier)) || index(a) - index(b))[0]
}

function change(from: Tier, to: Tier): -1 | 0 | 1 {
  return Math.sign(index(to) - index(from)) as -1 | 0 | 1
}

export function updateTopicProgress(progress: TopicProgress, correct: boolean, allowed: readonly Tier[]): TopicProgressUpdate {
  const tier = clampTier(progress.tier, allowed)

  if (correct) {
    const correctStreak = progress.correctStreak + 1
    if (correctStreak < CORRECT_IN_ROW_TO_LEVEL_UP) {
      return { progress: { tier, correctStreak, mistakeStreak: 0 }, tierChange: 0 }
    }
    const next = stepTier(tier, allowed, 1)
    return { progress: { tier: next, correctStreak: 0, mistakeStreak: 0 }, tierChange: change(tier, next) }
  }

  const mistakeStreak = progress.mistakeStreak + 1
  if (mistakeStreak < MISTAKES_IN_ROW_TO_LEVEL_DOWN) {
    return { progress: { tier, correctStreak: 0, mistakeStreak }, tierChange: 0 }
  }
  const next = stepTier(tier, allowed, -1)
  return { progress: { tier: next, correctStreak: 0, mistakeStreak: 0 }, tierChange: change(tier, next) }
}

/** „Je to moc těžké“: hned o obtížnost níž a obě řady od nuly. */
export function skipTopicProgress(progress: TopicProgress, allowed: readonly Tier[]): TopicProgressUpdate {
  const tier = clampTier(progress.tier, allowed)
  const next = stepTier(tier, allowed, -1)
  return { progress: { tier: next, correctStreak: 0, mistakeStreak: 0 }, tierChange: change(tier, next) }
}

/** Truhla je společná pro všechny kategorie: 5 správně v řadě. */
export function updateChestStreak(streak: number, correct: boolean): { streak: number; chest: boolean } {
  if (!correct) return { streak: 0, chest: false }
  const next = streak + 1
  return next >= CORRECT_IN_ROW_FOR_CHEST ? { streak: 0, chest: true } : { streak: next, chest: false }
}
