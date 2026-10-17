import { PROBLEM_TYPES, type Level, type SaveData, type Settings } from '../types'
import { awardBadges } from './badges'
import { clampLevel } from './difficulty'
import { createDefaultSave, parseSave } from './storage'

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

export function updateSettings(save: SaveData, settings: Settings): SaveData {
  const enabledTypes = PROBLEM_TYPES.filter((type) => settings.enabledTypes.includes(type))
  const minLevel = Math.min(settings.minLevel, settings.maxLevel) as Level
  const maxLevel = Math.max(settings.minLevel, settings.maxLevel) as Level
  const next: Settings = {
    soundOn: settings.soundOn,
    enabledTypes: enabledTypes.length > 0 ? enabledTypes : save.settings.enabledTypes,
    minLevel,
    maxLevel,
  }
  return { ...save, settings: next, level: clampLevel(save.level, next) }
}

/** Zaškrtávátka stupňů tvoří vždy souvislý rozsah s aspoň jedním stupněm. */
export function toggleLevelRange(minLevel: Level, maxLevel: Level, level: Level): { minLevel: Level; maxLevel: Level } {
  if (level < minLevel) return { minLevel: level, maxLevel }
  if (level > maxLevel) return { minLevel, maxLevel: level }
  if (minLevel === maxLevel) return { minLevel, maxLevel }
  if (level === minLevel) return { minLevel: (level + 1) as Level, maxLevel }
  if (level === maxLevel) return { minLevel, maxLevel: (level - 1) as Level }
  return { minLevel, maxLevel }
}

/** Smaže postup (zlaťáky, oblečení, odznaky, statistiky), ale nechá PIN a nastavení od rodiče. */
export function resetProgress(save: SaveData): SaveData {
  const fresh = createDefaultSave()
  return {
    ...fresh,
    settings: save.settings,
    parentPinHash: save.parentPinHash,
    level: clampLevel(fresh.level, save.settings),
  }
}

export function exportProgress(save: SaveData): string {
  return JSON.stringify(save, null, 2)
}

export function exportFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `panenka-postup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}

/** Vrátí nový stav z importovaného textu, nebo null, pokud soubor není platný postup. */
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
