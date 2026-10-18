import { describe, expect, test } from 'vitest'
import { buildMoneyParts, buildMoneyTask } from '../lib/money'
import type { Tier } from '../types'
import { seededRng } from './seededRng'

const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1)
const total = (items: { price: number; count: number }[]) => items.reduce((sum, item) => sum + item.price * item.count, 0)

describe('úlohy na peníze', () => {
  test('lehké: ceny 1–10, nejvýš 2 kusy, celkem do 20, zbyde ze 20', () => {
    for (const seed of SEEDS) {
      const { items, budget } = buildMoneyParts('easy', seededRng(seed))
      for (const item of items) {
        expect(item.price).toBeGreaterThanOrEqual(1)
        expect(item.price).toBeLessThanOrEqual(10)
        expect(item.count).toBeLessThanOrEqual(2)
      }
      expect(total(items)).toBeLessThanOrEqual(20)
      if (budget !== null) expect(budget).toBe(20)
    }
  })

  test('střední: 2–3 věci po kusu, ceny do 50, celkem do 100', () => {
    for (const seed of SEEDS) {
      const { items, budget } = buildMoneyParts('medium', seededRng(seed))
      expect(items.length).toBeGreaterThanOrEqual(2)
      expect(items.length).toBeLessThanOrEqual(3)
      for (const item of items) {
        expect(item.count).toBe(1)
        expect(item.price).toBeLessThanOrEqual(50)
      }
      expect(total(items)).toBeLessThanOrEqual(100)
      if (budget !== null) expect(budget).toBe(100)
    }
  })

  test('těžké: ceny 1–10, 2–5 kusů, celkem do 100', () => {
    for (const seed of SEEDS) {
      const { items, budget } = buildMoneyParts('hard', seededRng(seed))
      for (const item of items) {
        expect(item.price).toBeGreaterThanOrEqual(1)
        expect(item.price).toBeLessThanOrEqual(10)
        expect(item.count).toBeGreaterThanOrEqual(2)
        expect(item.count).toBeLessThanOrEqual(5)
      }
      expect(total(items)).toBeLessThanOrEqual(100)
      if (budget !== null) expect(budget).toBe(100)
    }
  })

  test('výsledek je vždy celé číslo ≥ 1 a odpovídá nákupu', () => {
    for (const tier of ['easy', 'medium', 'hard'] as Tier[]) {
      for (const seed of SEEDS) {
        const { items, budget } = buildMoneyParts(tier, seededRng(seed))
        const task = buildMoneyTask(tier, seededRng(seed))
        expect(Number.isInteger(task.answer)).toBe(true)
        expect(task.answer).toBeGreaterThanOrEqual(1)
        expect(task.answer).toBe(budget === null ? total(items) : budget - total(items))
      }
    }
  })

  test('objeví se oba druhy úloh', () => {
    for (const tier of ['easy', 'medium', 'hard'] as Tier[]) {
      const kinds = new Set(SEEDS.map((seed) => buildMoneyTask(tier, seededRng(seed)).kind))
      expect(kinds).toEqual(new Set(['total', 'change']))
    }
  })

  test('počet štítků odpovídá počtu věcí a štítek ukazuje cenu', () => {
    for (const seed of SEEDS) {
      const { items } = buildMoneyParts('medium', seededRng(seed))
      const task = buildMoneyTask('medium', seededRng(seed))
      expect(task.tags).toHaveLength(items.length)
      task.tags.forEach((tag, i) => expect(tag).toMatch(new RegExp(` ${items[i].price} Kč$`)))
    }
  })

  test('nápověda neobsahuje výsledek', () => {
    for (const tier of ['easy', 'medium', 'hard'] as Tier[]) {
      for (const seed of SEEDS) {
        const task = buildMoneyTask(tier, seededRng(seed))
        expect(task.hint).not.toContain(`= ${task.answer}`)
        if (task.kind === 'total') expect(task.hint).not.toMatch(new RegExp(`(^|\\D)${task.answer} Kč\\.$`))
      }
    }
  })

  test('text úlohy zní česky', () => {
    const total = buildMoneyTask('hard', seededRng(1))
    expect(total.story).toMatch(/Kolik (zaplatí|jí zbyde)\?$/)
    expect(total.story).toContain('Kč')
  })
})
