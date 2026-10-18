import { describe, expect, test } from 'vitest'
import {
  exportFileName,
  exportProgress,
  acceptRecommendation,
  hashPin,
  importProgress,
  resetProgress,
  snoozeRecommendation,
  updateTopics,
  verifyPin,
} from '../lib/parent'
import { createDefaultSave } from '../lib/storage'
import type { PracticeRecord, SaveData, Tier, TopicSettings } from '../types'

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

const record = (successes: number, total: number): PracticeRecord => ({
  recent: Array.from({ length: total }, (_, i) => i < successes),
  total,
  snoozedAtTotal: null,
})

describe('kategorie od rodiče', () => {
  test('odškrtnutí právě hrané obtížnosti srovná aktuální obtížnost a smaže její historii', () => {
    const base = createDefaultSave()
    const save: SaveData = {
      ...base,
      currentTier: { ...base.currentTier, add20: 'hard' },
      practice: { 'add20:hard': record(3, 10), 'add20:easy': record(9, 10) },
    }
    const next = updateTopics(save, { ...save.settings.topics, add20: ['easy', 'medium'] })
    expect(next.settings.topics.add20).toEqual(['easy', 'medium'])
    expect(next.currentTier.add20).toBe('medium')
    expect(next.practice['add20:hard']).toBeUndefined()
    expect(next.practice['add20:easy']).toEqual(record(9, 10))
  })

  test('nedovolí vypnout všechno', () => {
    const save = createDefaultSave()
    const nothing = Object.fromEntries(Object.keys(save.settings.topics).map((k) => [k, []])) as unknown as TopicSettings
    expect(updateTopics(save, nothing)).toBe(save)
  })

  test('přijaté doporučení přidá těžší obtížnost', () => {
    const base = createDefaultSave()
    const save = updateTopics(base, { ...base.settings.topics, multiplication: ['easy'] })
    const next = acceptRecommendation(save, { topic: 'multiplication', tier: 'easy', rate: 1, action: 'add', targetTier: 'medium' })
    expect(next.settings.topics.multiplication).toEqual(['easy', 'medium'])
  })

  test('přijaté doporučení odebere obtížnost a srovná aktuální', () => {
    const base = createDefaultSave()
    const save: SaveData = { ...base, currentTier: { ...base.currentTier, add20: 'hard' } }
    const next = acceptRecommendation(save, { topic: 'add20', tier: 'hard', rate: 0.1, action: 'remove', targetTier: 'hard' })
    expect(next.settings.topics.add20).toEqual(['easy', 'medium'])
    expect(next.currentTier.add20).toBe('medium')
  })

  test('„Teď ne“ si zapamatuje počet výsledků', () => {
    const save: SaveData = { ...createDefaultSave(), practice: { 'add20:easy': record(10, 12) } }
    const next = snoozeRecommendation(save, { topic: 'add20', tier: 'easy', rate: 1, action: 'remove', targetTier: 'easy' })
    expect(next.practice['add20:easy']?.snoozedAtTotal).toBe(12)
  })
})

describe('reset', () => {
  test('smaže postup i úspěšnost, ale nechá PIN a nastavení', () => {
    const base = createDefaultSave()
    const topics = { ...base.settings.topics, add20: ['medium', 'hard'] as Tier[] }
    const save: SaveData = {
      ...base,
      gold: 300,
      owned: [...base.owned, 'dress-pink'],
      badges: ['first-step'],
      stats: { totalCorrect: 50, multiplicationStreak: 3 },
      currentTier: { ...base.currentTier, add20: 'hard' },
      practice: { 'add20:hard': record(5, 10) },
      parentPinHash: hashPin('1111'),
      settings: { soundOn: false, topics },
    }
    const reset = resetProgress(save)
    expect(reset.gold).toBe(0)
    expect(reset.owned).toEqual(base.owned)
    expect(reset.badges).toEqual([])
    expect(reset.stats).toEqual({ totalCorrect: 0, multiplicationStreak: 0 })
    expect(reset.practice).toEqual({})
    expect(reset.currentTier.add20).toBe('medium')
    expect(reset.parentPinHash).toBe(save.parentPinHash)
    expect(reset.settings).toEqual(save.settings)
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

  test('import doplní odznaky podle statistik, Násobilková hvězda korunku nedá', () => {
    const text = exportProgress({ ...createDefaultSave(), stats: { totalCorrect: 12, multiplicationStreak: 10 } })
    const imported = importProgress(createDefaultSave(), text)!
    expect(imported.badges).toEqual(['first-step', 'times-table-star'])
    expect(imported.owned).not.toContain('acc-crown')
  })

  test('záloha ve verzi 1 se nahraje a převede', () => {
    const v1 = {
      saveVersion: 1,
      gold: 40,
      owned: [],
      equipped: {},
      badges: [],
      stats: { totalCorrect: 3, multiplicationStreak: 0 },
      level: 1,
      settings: { soundOn: true, enabledTypes: ['multiplication'], minLevel: 1, maxLevel: 1 },
      parentPinHash: null,
    }
    const imported = importProgress({ ...createDefaultSave(), parentPinHash: hashPin('1234') }, JSON.stringify(v1))!
    expect(imported.saveVersion).toBe(3)
    expect(imported.gold).toBe(40)
    expect(imported.settings.topics.multiplication).toEqual(['easy'])
    expect(imported.parentPinHash).toBe(hashPin('1234'))
  })

  test('název souboru obsahuje datum', () => {
    expect(exportFileName(new Date(2026, 9, 5))).toBe('panenka-postup-2026-10-05.json')
  })
})
