import { describe, expect, test } from 'vitest'
import {
  exportFileName,
  exportProgress,
  hashPin,
  importProgress,
  resetProgress,
  toggleLevelRange,
  updateSettings,
  verifyPin,
} from '../lib/parent'
import { createDefaultSave } from '../lib/storage'

describe('PIN', () => {
  test('otisk je stálý, liší se pro různé PINy a neobsahuje PIN', () => {
    expect(hashPin('1234')).toBe(hashPin('1234'))
    expect(hashPin('1234')).not.toBe(hashPin('1235'))
    expect(hashPin('1234')).not.toContain('1234')
  })

  test('ověření PINu', () => {
    const save = { ...createDefaultSave(), parentPinHash: hashPin('2468') }
    expect(verifyPin(save, '2468')).toBe(true)
    expect(verifyPin(save, '0000')).toBe(false)
  })

  test('bez nastaveného PINu žádný PIN neprojde', () => {
    expect(verifyPin(createDefaultSave(), '')).toBe(false)
  })
})

describe('nastavení', () => {
  test('změna mezí srovná aktuální stupeň', () => {
    const save = { ...createDefaultSave(), level: 4 as const }
    const next = updateSettings(save, { ...save.settings, minLevel: 1, maxLevel: 2 })
    expect(next.level).toBe(2)
  })

  test('nedovolí vypnout všechny typy příkladů', () => {
    const save = createDefaultSave()
    expect(updateSettings(save, { ...save.settings, enabledTypes: [] }).settings.enabledTypes).toEqual(
      save.settings.enabledTypes,
    )
  })

  test.each([
    [1, 4, 1, 2, 4],
    [1, 4, 4, 1, 3],
    [1, 4, 2, 1, 4],
    [2, 3, 1, 1, 3],
    [2, 2, 4, 2, 4],
    [3, 3, 3, 3, 3],
  ] as const)('stupně %i–%i, klepnutí na %i → %i–%i', (min, max, level, expectedMin, expectedMax) => {
    expect(toggleLevelRange(min, max, level)).toEqual({ minLevel: expectedMin, maxLevel: expectedMax })
  })
})

describe('reset', () => {
  test('smaže postup, ale nechá PIN a nastavení', () => {
    const base = createDefaultSave()
    const save = {
      ...base,
      gold: 300,
      owned: [...base.owned, 'dress-pink'],
      badges: ['first-step' as const],
      stats: { totalCorrect: 50, multiplicationStreak: 3 },
      level: 3 as const,
      parentPinHash: hashPin('1111'),
      settings: { ...base.settings, soundOn: false, minLevel: 2 as const },
    }
    const reset = resetProgress(save)
    expect(reset.gold).toBe(0)
    expect(reset.owned).toEqual(base.owned)
    expect(reset.badges).toEqual([])
    expect(reset.stats).toEqual({ totalCorrect: 0, multiplicationStreak: 0 })
    expect(reset.parentPinHash).toBe(save.parentPinHash)
    expect(reset.settings).toEqual(save.settings)
    expect(reset.level).toBe(2)
  })
})

describe('export a import', () => {
  test('exportovaný postup jde zase načíst', () => {
    const save = { ...createDefaultSave(), gold: 77, parentPinHash: hashPin('1234') }
    expect(importProgress(createDefaultSave(), exportProgress(save))).toEqual(save)
  })

  test.each([
    ['nevalidní JSON', '{rozbité'],
    ['jiná data', '{"jmeno": "Anna"}'],
    ['záporné zlaťáky', JSON.stringify({ ...createDefaultSave(), gold: -1 })],
    ['příliš velký soubor', 'x'.repeat(200_000)],
  ])('odmítne %s', (_, text) => {
    expect(importProgress(createDefaultSave(), text)).toBeNull()
  })

  test('import bez PINu ponechá současný PIN', () => {
    const current = { ...createDefaultSave(), parentPinHash: hashPin('9999') }
    const imported = importProgress(current, exportProgress({ ...createDefaultSave(), gold: 5 }))
    expect(imported?.parentPinHash).toBe(current.parentPinHash)
  })

  test('import doplní odznaky a korunku podle statistik', () => {
    const text = exportProgress({ ...createDefaultSave(), stats: { totalCorrect: 12, multiplicationStreak: 10 } })
    const imported = importProgress(createDefaultSave(), text)!
    expect(imported.badges).toEqual(['first-step', 'times-table-star'])
    expect(imported.owned).toContain('acc-crown')
  })

  test('název souboru obsahuje datum', () => {
    expect(exportFileName(new Date(2026, 9, 5))).toBe('panenka-postup-2026-10-05.json')
  })
})
