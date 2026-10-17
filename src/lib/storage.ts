import { ITEMS_BY_ID, STARTER_ITEMS } from '../data/items'
import {
  BADGE_IDS,
  CATEGORIES,
  LEVELS,
  PROBLEM_TYPES,
  type Category,
  type Level,
  type SaveData,
} from '../types'

export const SAVE_KEY = 'panenka_save'
export const CORRUPT_BACKUP_KEY = 'panenka_save_corrupt'
export const SAVE_VERSION = 1

export function createDefaultSave(): SaveData {
  const equipped: Partial<Record<Category, string>> = {}
  for (const item of STARTER_ITEMS) equipped[item.category] = item.id
  return {
    saveVersion: SAVE_VERSION,
    gold: 0,
    owned: STARTER_ITEMS.map((item) => item.id),
    equipped,
    badges: [],
    stats: { totalCorrect: 0, multiplicationStreak: 0 },
    level: 1,
    settings: {
      soundOn: true,
      enabledTypes: [...PROBLEM_TYPES],
      minLevel: 1,
      maxLevel: 4,
    },
    parentPinHash: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeInt(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0
}

function isLevel(value: unknown): value is Level {
  return LEVELS.includes(value as Level)
}

/** Vrátí platný a vyčištěný save, nebo null, pokud data nejsou použitelná. */
export function parseSave(raw: unknown): SaveData | null {
  if (!isRecord(raw) || raw.saveVersion !== SAVE_VERSION) return null
  const { gold, owned, equipped, badges, stats, level, settings, parentPinHash } = raw

  if (!isNonNegativeInt(gold)) return null
  if (!Array.isArray(owned) || !owned.every((id) => typeof id === 'string')) return null
  if (!isRecord(equipped)) return null
  if (!Array.isArray(badges)) return null
  if (!isRecord(stats) || !isNonNegativeInt(stats.totalCorrect) || !isNonNegativeInt(stats.multiplicationStreak)) {
    return null
  }
  if (!isLevel(level)) return null
  if (
    !isRecord(settings) ||
    typeof settings.soundOn !== 'boolean' ||
    !Array.isArray(settings.enabledTypes) ||
    !isLevel(settings.minLevel) ||
    !isLevel(settings.maxLevel) ||
    settings.minLevel > settings.maxLevel
  ) {
    return null
  }
  if (parentPinHash !== null && typeof parentPinHash !== 'string') return null

  const ownedIds = new Set<string>(STARTER_ITEMS.map((item) => item.id))
  for (const id of owned) if (ITEMS_BY_ID.has(id)) ownedIds.add(id)

  const cleanEquipped: Partial<Record<Category, string>> = {}
  for (const category of CATEGORIES) {
    const id = equipped[category]
    if (typeof id === 'string' && ownedIds.has(id) && ITEMS_BY_ID.get(id)?.category === category) {
      cleanEquipped[category] = id
    }
  }

  const enabledTypes = PROBLEM_TYPES.filter((type) => (settings.enabledTypes as unknown[]).includes(type))
  const { minLevel, maxLevel } = settings

  return {
    saveVersion: SAVE_VERSION,
    gold,
    owned: [...ownedIds],
    equipped: cleanEquipped,
    badges: BADGE_IDS.filter((id) => badges.includes(id)),
    stats: { totalCorrect: stats.totalCorrect, multiplicationStreak: stats.multiplicationStreak },
    level: Math.min(Math.max(level, minLevel), maxLevel) as Level,
    settings: {
      soundOn: settings.soundOn,
      enabledTypes: enabledTypes.length > 0 ? enabledTypes : [...PROBLEM_TYPES],
      minLevel,
      maxLevel,
    },
    parentPinHash,
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
