import { TOPIC_IDS, type SaveData, type Tier, type TopicId, type TopicSettings } from '../types'
import { awardBadges } from './badges'
import { clampTier } from './difficulty'
import { clearTiers, snooze, type Recommendation } from './practice'
import { createDefaultSave, parseSave } from './storage'
import { practiceKey, sortTiers } from './topics'

export const PIN_LENGTH = 4
export const MAX_IMPORT_BYTES = 100_000

/**
 * PIN je jen dětský zámek, ne zabezpečení — 4 číslice jde vždy vyzkoušet.
 * Proto stačí jednoduchý synchronní otisk (FNV-1a), který funguje i mimo HTTPS (test na telefonu v síti).
 */
export function hashPin(pin: string): string {
  let hash = 0x811c9dc5
  for (const char of `panenka-pin:${pin}`) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return `fnv1a:${hash.toString(16).padStart(8, '0')}`
}

export function verifyPin(save: SaveData, pin: string): boolean {
  return save.parentPinHash !== null && save.parentPinHash === hashPin(pin)
}

const lowestTiers = (topics: TopicSettings) =>
  Object.fromEntries(TOPIC_IDS.map((topic) => [topic, topics[topic][0] ?? 'easy'])) as Record<TopicId, Tier>

/** Nové zaškrtnutí od rodiče: srovná aktuální obtížnosti a smaže historii odškrtnutých obtížností. */
export function updateTopics(save: SaveData, topics: TopicSettings): SaveData {
  const next = Object.fromEntries(TOPIC_IDS.map((topic) => [topic, sortTiers(topics[topic] ?? [])])) as TopicSettings
  if (!TOPIC_IDS.some((topic) => next[topic].length > 0)) return save

  let practice = save.practice
  for (const topic of TOPIC_IDS) {
    const removed = save.settings.topics[topic].filter((tier) => !next[topic].includes(tier))
    if (removed.length > 0) practice = clearTiers(practice, topic, removed)
  }
  const currentTier = Object.fromEntries(
    TOPIC_IDS.map((topic) => [topic, clampTier(save.currentTier[topic], next[topic])]),
  ) as Record<TopicId, Tier>

  return { ...save, practice, currentTier, settings: { ...save.settings, topics: next } }
}

export function acceptRecommendation(save: SaveData, recommendation: Recommendation): SaveData {
  const { topic, action, targetTier } = recommendation
  const current = save.settings.topics[topic]
  const tiers = action === 'add' ? [...current, targetTier] : current.filter((tier) => tier !== targetTier)
  return updateTopics(save, { ...save.settings.topics, [topic]: tiers })
}

export function snoozeRecommendation(save: SaveData, recommendation: Recommendation): SaveData {
  return { ...save, practice: snooze(save.practice, practiceKey(recommendation.topic, recommendation.tier)) }
}

/** Smaže postup (zlaťáky, oblečení, odznaky, statistiky, úspěšnost), ale nechá PIN a nastavení od rodiče. */
export function resetProgress(save: SaveData): SaveData {
  return {
    ...createDefaultSave(),
    settings: save.settings,
    parentPinHash: save.parentPinHash,
    currentTier: lowestTiers(save.settings.topics),
    practice: {},
  }
}

export function exportProgress(save: SaveData): string {
  return JSON.stringify(save, null, 2)
}

export function exportFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `panenka-postup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}

/** Vrátí nový stav z importovaného textu (verze 1 i 2), nebo null, pokud soubor není platný postup. */
export function importProgress(current: SaveData, text: string): SaveData | null {
  if (text.length > MAX_IMPORT_BYTES) return null
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  const parsed = parseSave(raw)
  if (!parsed) return null
  return awardBadges({ ...parsed, parentPinHash: parsed.parentPinHash ?? current.parentPinHash }).save
}
