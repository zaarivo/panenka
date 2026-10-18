import { TIERS, TOPIC_IDS, type Practice, type PracticeKey, type PracticeRecord, type Tier, type TopicId, type TopicSettings } from '../types'
import { practiceKey, sortTiers } from './topics'

export const RECENT_WINDOW = 20
export const MIN_RESULTS = 10
export const HIGH_RATE = 0.95
export const LOW_RATE = 0.25

export const TIME_LIMIT_MS: Record<TopicId, number> = {
  add20: 30_000,
  add100: 30_000,
  multiplication: 30_000,
  missingNumber: 30_000,
  comparison: 30_000,
  wordProblems: 90_000,
  money: 60_000,
  clock: 60_000,
}

/** Úspěch = správně napoprvé a v časovém limitu. Dítě o tom neví. */
export function isSuccess(topic: TopicId, firstTryCorrect: boolean, activeMs: number): boolean {
  return firstTryCorrect && activeMs <= TIME_LIMIT_MS[topic]
}

export function recordResult(practice: Practice, key: PracticeKey, success: boolean): Practice {
  const current = practice[key] ?? { recent: [], total: 0, snoozedAtTotal: null }
  return {
    ...practice,
    [key]: { ...current, recent: [...current.recent, success].slice(-RECENT_WINDOW), total: current.total + 1 },
  }
}

export function successRate(record: PracticeRecord | undefined): number | null {
  if (!record || record.recent.length < MIN_RESULTS) return null
  return record.recent.filter(Boolean).length / record.recent.length
}

export function snooze(practice: Practice, key: PracticeKey): Practice {
  const current = practice[key]
  return current ? { ...practice, [key]: { ...current, snoozedAtTotal: current.total } } : practice
}

export function clearTiers(practice: Practice, topic: TopicId, tiers: readonly Tier[]): Practice {
  const next = { ...practice }
  for (const tier of tiers) delete next[practiceKey(topic, tier)]
  return next
}

export interface Recommendation {
  topic: TopicId
  /** Obtížnost, jejíž úspěšnost doporučení vyvolala. */
  tier: Tier
  rate: number
  action: 'add' | 'remove'
  targetTier: Tier
}

const isSnoozed = (record: PracticeRecord) =>
  record.snoozedAtTotal !== null && record.total - record.snoozedAtTotal < RECENT_WINDOW

function recommendationFor(topic: TopicId, tier: Tier, rate: number, checked: readonly Tier[]): Recommendation | null {
  const position = TIERS.indexOf(tier)
  if (rate >= HIGH_RATE) {
    if (checked.some((t) => TIERS.indexOf(t) > position)) return { topic, tier, rate, action: 'remove', targetTier: tier }
    const harder = TIERS[position + 1]
    return harder ? { topic, tier, rate, action: 'add', targetTier: harder } : null
  }
  if (rate < LOW_RATE) {
    if (checked.length > 1) return { topic, tier, rate, action: 'remove', targetTier: tier }
    const easier = TIERS[position - 1]
    return easier ? { topic, tier, rate, action: 'add', targetTier: easier } : null
  }
  return null
}

/** Nejvýš jedno doporučení na kategorii (s nejnižší úspěšností), jen pro zaškrtnuté obtížnosti. */
export function recommendations(topics: TopicSettings, practice: Practice): Recommendation[] {
  const result: Recommendation[] = []
  for (const topic of TOPIC_IDS) {
    const checked = sortTiers(topics[topic])
    const candidates = checked.flatMap((tier) => {
      const record = practice[practiceKey(topic, tier)]
      const rate = successRate(record)
      if (rate === null || isSnoozed(record!)) return []
      const recommendation = recommendationFor(topic, tier, rate, checked)
      return recommendation ? [recommendation] : []
    })
    if (candidates.length > 0) result.push(candidates.reduce((low, r) => (r.rate < low.rate ? r : low)))
  }
  return result
}
