import { ITEMS_BY_ID, STARTER_ITEMS } from '../data/items'
import {
  BADGE_IDS,
  CATEGORIES,
  TIERS,
  TOPIC_IDS,
  type Category,
  type Equipped,
  type Practice,
  type PracticeKey,
  type PracticeRecord,
  type SaveData,
  type Tier,
  type TopicId,
  type TopicSettings,
} from '../types'
import { clampTier } from './difficulty'
import { RECENT_WINDOW } from './practice'
import { allTiersOn, sortTiers } from './topics'
import { equipSlot } from './wardrobe'

export const SAVE_KEY = 'panenka_save'
export const CORRUPT_BACKUP_KEY = 'panenka_save_corrupt'
export const SAVE_VERSION = 2

/** Formát verze 1 (před kategoriemi úloh) — jen pro převod starých dat. */
const V1_PROBLEM_TYPES = ['addSub', 'multiplication', 'missingNumber', 'comparison'] as const
type V1ProblemType = (typeof V1_PROBLEM_TYPES)[number]
const V1_LEVELS = [1, 2, 3, 4] as const
type V1Level = (typeof V1_LEVELS)[number]

function lowestTiers(topics: TopicSettings): Record<TopicId, Tier> {
  return Object.fromEntries(TOPIC_IDS.map((topic) => [topic, topics[topic][0] ?? 'easy'])) as Record<TopicId, Tier>
}

export function createDefaultSave(): SaveData {
  const equipped: Equipped = {}
  for (const item of STARTER_ITEMS) equipped[equipSlot(item)] = item.id
  const topics = allTiersOn()
  return {
    saveVersion: SAVE_VERSION,
    gold: 0,
    owned: STARTER_ITEMS.map((item) => item.id),
    equipped,
    badges: [],
    stats: { totalCorrect: 0, multiplicationStreak: 0 },
    currentTier: lowestTiers(topics),
    practice: {},
    settings: { soundOn: true, topics },
    parentPinHash: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeInt(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0
}

const isTier = (value: unknown): value is Tier => TIERS.includes(value as Tier)

/** Staré typy a stupně 1–4 → kategorie a obtížnosti (mapování ze schváleného návrhu). */
export function migrateTopicsFromV1(enabledTypes: readonly V1ProblemType[], minLevel: V1Level, maxLevel: V1Level): TopicSettings {
  const topics: Record<TopicId, Set<Tier>> = Object.fromEntries(TOPIC_IDS.map((topic) => [topic, new Set<Tier>()])) as Record<
    TopicId,
    Set<Tier>
  >
  for (let level = minLevel; level <= maxLevel; level++) {
    if (enabledTypes.includes('addSub')) {
      if (level === 1) topics.add20.add('medium')
      if (level === 2) topics.add20.add('hard')
      if (level === 3) topics.add100.add('medium')
      if (level === 4) topics.add100.add('hard')
    }
    if (enabledTypes.includes('multiplication')) topics.multiplication.add(level === 1 ? 'easy' : level === 2 ? 'medium' : 'hard')
    for (const topic of ['missingNumber', 'comparison'] as const) {
      if (enabledTypes.includes(topic)) topics[topic].add(level <= 2 ? 'medium' : 'hard')
    }
  }
  return Object.fromEntries(TOPIC_IDS.map((topic) => [topic, sortTiers([...topics[topic]])])) as TopicSettings
}

/** Pole společná pro obě verze. */
function parseCommon(raw: Record<string, unknown>) {
  const { gold, owned, equipped, badges, stats, settings, parentPinHash } = raw
  if (!isNonNegativeInt(gold)) return null
  if (!Array.isArray(owned) || !owned.every((id) => typeof id === 'string')) return null
  if (!isRecord(equipped)) return null
  if (!Array.isArray(badges)) return null
  if (!isRecord(stats) || !isNonNegativeInt(stats.totalCorrect) || !isNonNegativeInt(stats.multiplicationStreak)) return null
  if (!isRecord(settings) || typeof settings.soundOn !== 'boolean') return null
  if (parentPinHash !== null && typeof parentPinHash !== 'string') return null

  const ownedIds = new Set<string>(STARTER_ITEMS.map((item) => item.id))
  for (const id of owned) if (ITEMS_BY_ID.has(id)) ownedIds.add(id)

  const cleanEquipped: Partial<Record<Category, string>> = {}
  for (const category of CATEGORIES) {
    const id = equipped[category]
    if (typeof id === 'string' && ownedIds.has(id) && ITEMS_BY_ID.get(id)?.category === category) cleanEquipped[category] = id
  }

  return {
    gold,
    owned: [...ownedIds],
    equipped: cleanEquipped,
    badges: BADGE_IDS.filter((id) => badges.includes(id)),
    stats: { totalCorrect: stats.totalCorrect, multiplicationStreak: stats.multiplicationStreak },
    soundOn: settings.soundOn,
    settings,
    parentPinHash,
  }
}

function parseV1Topics(settings: Record<string, unknown>): TopicSettings | null {
  const { enabledTypes, minLevel, maxLevel } = settings
  const isLevel = (value: unknown): value is V1Level => V1_LEVELS.includes(value as V1Level)
  if (!Array.isArray(enabledTypes) || !isLevel(minLevel) || !isLevel(maxLevel) || minLevel > maxLevel) return null
  const types = V1_PROBLEM_TYPES.filter((type) => (enabledTypes as unknown[]).includes(type))
  return migrateTopicsFromV1(types.length > 0 ? types : V1_PROBLEM_TYPES, minLevel, maxLevel)
}

function parseV2Topics(settings: Record<string, unknown>): TopicSettings | null {
  const { topics } = settings
  if (!isRecord(topics)) return null
  const parsed = Object.fromEntries(
    TOPIC_IDS.map((topic) => {
      const tiers = topics[topic]
      return [topic, Array.isArray(tiers) ? sortTiers(tiers.filter(isTier)) : []]
    }),
  ) as TopicSettings
  return TOPIC_IDS.some((topic) => parsed[topic].length > 0) ? parsed : allTiersOn()
}

function parsePracticeRecord(value: unknown): PracticeRecord | null {
  if (!isRecord(value)) return null
  const { recent, total, snoozedAtTotal } = value
  if (!Array.isArray(recent) || recent.length > RECENT_WINDOW || !recent.every((r) => typeof r === 'boolean')) return null
  if (!isNonNegativeInt(total) || total < recent.length) return null
  if (snoozedAtTotal !== null && !(isNonNegativeInt(snoozedAtTotal) && snoozedAtTotal <= total)) return null
  return { recent: [...recent], total, snoozedAtTotal }
}

function parsePractice(value: unknown): Practice {
  if (!isRecord(value)) return {}
  const practice: Practice = {}
  for (const topic of TOPIC_IDS) {
    for (const tier of TIERS) {
      const key: PracticeKey = `${topic}:${tier}`
      const record = parsePracticeRecord(value[key])
      if (record) practice[key] = record
    }
  }
  return practice
}

/** Vrátí platný a vyčištěný save (verze 1 se převede na 2), nebo null, pokud data nejsou použitelná. */
export function parseSave(raw: unknown): SaveData | null {
  if (!isRecord(raw) || (raw.saveVersion !== 1 && raw.saveVersion !== SAVE_VERSION)) return null
  const common = parseCommon(raw)
  if (!common) return null

  const isV1 = raw.saveVersion === 1
  const topics = isV1 ? parseV1Topics(common.settings) : parseV2Topics(common.settings)
  if (!topics) return null

  const storedTiers = !isV1 && isRecord(raw.currentTier) ? raw.currentTier : {}
  const currentTier = Object.fromEntries(
    TOPIC_IDS.map((topic) => {
      const stored = storedTiers[topic]
      const tier = isTier(stored) ? stored : (topics[topic][0] ?? 'easy')
      return [topic, clampTier(tier, topics[topic])]
    }),
  ) as Record<TopicId, Tier>

  return {
    saveVersion: SAVE_VERSION,
    gold: common.gold,
    owned: common.owned,
    equipped: common.equipped,
    badges: common.badges,
    stats: common.stats,
    currentTier,
    practice: isV1 ? {} : parsePractice(raw.practice),
    settings: { soundOn: common.soundOn, topics },
    parentPinHash: common.parentPinHash,
  }
}

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function loadSave(storage: Storage | undefined = browserStorage()): SaveData {
  if (!storage) return createDefaultSave()

  let text: string | null
  try {
    text = storage.getItem(SAVE_KEY)
  } catch {
    return createDefaultSave()
  }
  if (text === null) return createDefaultSave()

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = undefined
  }
  const save = parseSave(parsed)
  if (save) return save

  // Poškozená data si schováme, aby se dala ručně zachránit, a hra jede dál od začátku.
  try {
    storage.setItem(CORRUPT_BACKUP_KEY, text)
  } catch {
    // úložiště může být plné nebo zakázané; hra musí běžet i tak
  }
  return createDefaultSave()
}

export function writeSave(save: SaveData, storage: Storage | undefined = browserStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save))
    return true
  } catch {
    return false
  }
}
