import { describe, expect, test } from 'vitest'
import { TIER_LABELS, TOPIC_LABELS, defaultTopics, enabledTopics, practiceKey, sortTiers, toggleTier } from '../lib/topics'
import { TOPIC_IDS, type TopicSettings } from '../types'

const only = (partial: Partial<TopicSettings>): TopicSettings => ({
  add20: [],
  add100: [],
  multiplication: [],
  missingNumber: [],
  comparison: [],
  wordProblems: [],
  money: [],
  clock: [],
  ...partial,
})

describe('kategorie úloh', () => {
  test('obtížnosti mají české názvy', () => {
    expect(TIER_LABELS).toEqual({ easy: 'lehké', medium: 'střední', hard: 'těžké' })
  })

  test('každá kategorie má název', () => {
    for (const topic of TOPIC_IDS) expect(TOPIC_LABELS[topic].length).toBeGreaterThan(0)
    expect(TOPIC_LABELS.wordProblems).toBe('Slovní úlohy')
    expect(TOPIC_LABELS.money).toBe('Peníze')
    expect(TOPIC_LABELS.clock).toBe('Hodiny')
  })

  test('klíč úspěšnosti spojuje kategorii a obtížnost', () => {
    expect(practiceKey('multiplication', 'easy')).toBe('multiplication:easy')
  })

  test('výchozí stav: peníze a hodiny vypnuté, ostatní vše zaškrtnuté', () => {
    for (const topic of TOPIC_IDS) {
      expect(defaultTopics()[topic]).toEqual(topic === 'money' || topic === 'clock' ? [] : ['easy', 'medium', 'hard'])
    }
  })

  test('řazení obtížností od lehké po těžkou', () => {
    expect(sortTiers(['hard', 'easy', 'medium'])).toEqual(['easy', 'medium', 'hard'])
  })
})

describe('zaškrtávání obtížností', () => {
  test('zapne obtížnost, výsledek je seřazený a bez duplicit', () => {
    const next = toggleTier(only({ add20: ['hard'] }), 'add20', 'easy')
    expect(next.add20).toEqual(['easy', 'hard'])
  })

  test('vypne obtížnost a nezmění původní stav', () => {
    const start = only({ add20: ['easy', 'medium'] })
    const next = toggleTier(start, 'add20', 'medium')
    expect(next.add20).toEqual(['easy'])
    expect(start.add20).toEqual(['easy', 'medium'])
  })

  test('mezera mezi obtížnostmi je povolená', () => {
    const next = toggleTier(only({ add20: ['easy', 'medium', 'hard'] }), 'add20', 'medium')
    expect(next.add20).toEqual(['easy', 'hard'])
  })

  test('poslední zaškrtnutou obtížnost v celé hře nejde vypnout', () => {
    const start = only({ multiplication: ['easy'] })
    expect(toggleTier(start, 'multiplication', 'easy')).toBe(start)
  })

  test('vypnout celou kategorii jde, když jinde něco zůstane', () => {
    const next = toggleTier(only({ add20: ['easy'], multiplication: ['easy'] }), 'add20', 'easy')
    expect(next.add20).toEqual([])
  })

  test('zapnuté kategorie v pořadí podle seznamu kategorií', () => {
    expect(enabledTopics(only({ wordProblems: ['easy'], add20: ['hard'] }))).toEqual(['add20', 'wordProblems'])
  })
})
