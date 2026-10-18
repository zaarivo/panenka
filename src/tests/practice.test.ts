import { describe, expect, test } from 'vitest'
import {
  RECENT_WINDOW,
  TIME_LIMIT_MS,
  clearTiers,
  isSuccess,
  recommendations,
  recordResult,
  snooze,
  successRate,
} from '../lib/practice'
import type { Practice, PracticeKey, PracticeRecord, TopicSettings } from '../types'

const topics = (partial: Partial<TopicSettings>): TopicSettings => ({
  add20: [],
  add100: [],
  multiplication: [],
  missingNumber: [],
  comparison: [],
  wordProblems: [],
  ...partial,
})

/** Záznam s daným počtem úspěchů z celkového počtu. */
const record = (successes: number, total: number): PracticeRecord => ({
  recent: Array.from({ length: total }, (_, i) => i < successes),
  total,
  snoozedAtTotal: null,
})

function feed(practice: Practice, key: PracticeKey, results: boolean[]): Practice {
  return results.reduce((p, success) => recordResult(p, key, success), practice)
}

describe('úspěch', () => {
  test('správně napoprvé a v limitu', () => {
    expect(isSuccess('add20', true, 30_000)).toBe(true)
    expect(isSuccess('add20', true, 30_001)).toBe(false)
    expect(isSuccess('add20', false, 1_000)).toBe(false)
  })

  test('slovní úlohy mají limit 90 s', () => {
    expect(TIME_LIMIT_MS.wordProblems).toBe(90_000)
    expect(TIME_LIMIT_MS.multiplication).toBe(30_000)
    expect(isSuccess('wordProblems', true, 89_000)).toBe(true)
    expect(isSuccess('wordProblems', true, 90_001)).toBe(false)
  })
})

describe('záznam úspěšnosti', () => {
  test('drží posledních 20 výsledků a počítá celkový počet', () => {
    const practice = feed({}, 'add20:easy', [...Array(5).fill(false), ...Array(20).fill(true)])
    const entry = practice['add20:easy']!
    expect(entry.recent).toHaveLength(RECENT_WINDOW)
    expect(entry.recent.every(Boolean)).toBe(true)
    expect(entry.total).toBe(25)
  })

  test('úspěšnost až od 10 výsledků', () => {
    expect(successRate(record(9, 9))).toBeNull()
    expect(successRate(record(9, 10))).toBe(0.9)
    expect(successRate(undefined)).toBeNull()
  })

  test('odškrtnutá obtížnost přijde o historii', () => {
    const practice = clearTiers({ 'add20:easy': record(5, 10), 'add20:hard': record(1, 10) }, 'add20', ['easy'])
    expect(practice['add20:easy']).toBeUndefined()
    expect(practice['add20:hard']).toBeDefined()
  })
})

describe('doporučení', () => {
  test('≥ 95 % na nejtěžší zaškrtnuté → přidat těžší', () => {
    expect(recommendations(topics({ add20: ['easy'] }), { 'add20:easy': record(10, 10) })).toEqual([
      { topic: 'add20', tier: 'easy', rate: 1, action: 'add', targetTier: 'medium' },
    ])
  })

  test('≥ 95 %, když běží i těžší → odebrat tuto', () => {
    expect(recommendations(topics({ add20: ['easy', 'medium'] }), { 'add20:easy': record(19, 20) })).toEqual([
      { topic: 'add20', tier: 'easy', rate: 0.95, action: 'remove', targetTier: 'easy' },
    ])
  })

  test('< 25 %, když běží i jiná → odebrat tuto', () => {
    expect(recommendations(topics({ add20: ['easy', 'medium'] }), { 'add20:medium': record(2, 10) })).toEqual([
      { topic: 'add20', tier: 'medium', rate: 0.2, action: 'remove', targetTier: 'medium' },
    ])
  })

  test('< 25 % na jediné zaškrtnuté → přidat lehčí', () => {
    expect(recommendations(topics({ multiplication: ['medium'] }), { 'multiplication:medium': record(1, 10) })).toEqual([
      { topic: 'multiplication', tier: 'medium', rate: 0.1, action: 'add', targetTier: 'easy' },
    ])
  })

  test('nic, když není kam: nejtěžší s ≥ 95 %, jediná lehká s < 25 %', () => {
    expect(recommendations(topics({ add20: ['hard'] }), { 'add20:hard': record(10, 10) })).toEqual([])
    expect(recommendations(topics({ add20: ['easy'] }), { 'add20:easy': record(0, 10) })).toEqual([])
  })

  test('nic pod 10 výsledků a nic pro odškrtnuté obtížnosti', () => {
    expect(recommendations(topics({ add20: ['easy'] }), { 'add20:easy': record(9, 9) })).toEqual([])
    expect(recommendations(topics({ add20: ['medium'] }), { 'add20:easy': record(10, 10) })).toEqual([])
  })

  test('nejvýš jedno na kategorii, přednost má nízká úspěšnost', () => {
    const result = recommendations(topics({ add20: ['easy', 'medium'] }), {
      'add20:easy': record(10, 10),
      'add20:medium': record(1, 10),
    })
    expect(result).toEqual([{ topic: 'add20', tier: 'medium', rate: 0.1, action: 'remove', targetTier: 'medium' }])
  })

  test('pořadí podle kategorií', () => {
    const result = recommendations(topics({ wordProblems: ['easy'], add20: ['easy'] }), {
      'wordProblems:easy': record(10, 10),
      'add20:easy': record(10, 10),
    })
    expect(result.map((r) => r.topic)).toEqual(['add20', 'wordProblems'])
  })

  test('„Teď ne“ schová doporučení na dalších 20 výsledků', () => {
    const settings = topics({ add20: ['easy'] })
    let practice = snooze({ 'add20:easy': record(10, 10) }, 'add20:easy')
    expect(recommendations(settings, practice)).toEqual([])
    practice = feed(practice, 'add20:easy', Array(19).fill(true))
    expect(recommendations(settings, practice)).toEqual([])
    practice = feed(practice, 'add20:easy', [true])
    expect(recommendations(settings, practice)).toHaveLength(1)
  })
})
