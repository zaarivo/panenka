import { describe, expect, test } from 'vitest'
import { generateProblem } from '../lib/mathGenerator'
import { WORD_TEMPLATES, generateWordProblem } from '../lib/wordProblems'
import { TIERS } from '../types'
import { seededRng } from './seededRng'

/** Nápověda slovní úlohy má pevný tvar „Spočítej a op b.“ — z ní nezávisle přepočítáme výsledek. */
function fromHint(hint: string) {
  const match = hint.match(/^Spočítej (\d+) ([+−×]) (\d+)\.$/)
  expect(match, hint).not.toBeNull()
  const [, a, op, b] = match!
  const x = Number(a)
  const y = Number(b)
  return { a: x, b: y, op, result: op === '+' ? x + y : op === '−' ? x - y : x * y }
}

const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number)

describe('slovní úlohy', () => {
  test.each(TIERS)('%s: aspoň 8 šablon', (tier) => {
    expect(WORD_TEMPLATES[tier].length).toBeGreaterThanOrEqual(8)
  })

  test.each(TIERS)('%s: výsledek sedí, text obsahuje zadání a neprozradí výsledek', (tier) => {
    const rng = seededRng(21)
    for (let i = 0; i < 500; i++) {
      const problem = generateWordProblem(tier, rng)
      const story = problem.story!
      const { a, b, op, result } = fromHint(problem.hint)
      expect(problem.kind).toBe('number')
      expect(problem.topic).toBe('wordProblems')
      expect(problem.tier).toBe(tier)
      expect(problem.prompt).toBe('?')
      expect(problem.answer, story).toBe(result)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(numbersIn(story), story).toContain(a)
      expect(numbersIn(story), story).toContain(b)
      if (result !== a && result !== b) expect(numbersIn(story), story).not.toContain(result)
      expect(story).not.toMatch(/undefined|NaN/)
      expect(story.trim().endsWith('?'), story).toBe(true)
      if (tier === 'hard') expect(op).toBe('×')
      else expect(['+', '−']).toContain(op)
      const limit = tier === 'easy' ? 20 : 100
      for (const n of [a, b, result]) expect(n, story).toBeLessThanOrEqual(limit)
    }
  })

  test('skloňuje podle počtu (1 / 2–4 / 5 a víc)', () => {
    const template = WORD_TEMPLATES.easy[0]
    expect(template.render(1, 2, 'Ema')).toContain('1 korálek')
    expect(template.render(3, 2, 'Ema')).toContain('3 korálky')
    expect(template.render(5, 2, 'Ema')).toContain('5 korálků')
  })

  test('generátor příkladů umí kategorii slovní úlohy a neopakuje stejnou po sobě', () => {
    const rng = seededRng(4)
    let previousKey: string | undefined
    for (let i = 0; i < 300; i++) {
      const problem = generateProblem({ topic: 'wordProblems', tier: 'medium', previousKey, rng })
      expect(problem.story).toBeTruthy()
      expect(problem.key).not.toBe(previousKey)
      previousKey = problem.key
    }
  })
})
