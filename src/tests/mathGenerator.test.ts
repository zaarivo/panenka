import { describe, expect, test } from 'vitest'
import { addCrossesTen, subCrossesTen } from '../lib/equations'
import {
  MULTIPLICATION_ROWS,
  addHint,
  formatAnswer,
  generateProblem,
  isCorrectAnswer,
  multiplicationHint,
  pickTopic,
  subHint,
  type Problem,
} from '../lib/mathGenerator'
import { TIERS, TOPIC_IDS, type Tier, type TopicId } from '../types'
import { seededRng } from './seededRng'

const SAMPLES = 2000

function generateMany(topic: TopicId, tier: Tier, seed = 1): Problem[] {
  const rng = seededRng(seed)
  const problems: Problem[] = []
  let previousKey: string | undefined
  for (let i = 0; i < SAMPLES; i++) {
    const problem = generateProblem({ topic, tier, previousKey, rng })
    problems.push(problem)
    previousKey = problem.key
  }
  return problems
}

/** Nezávislé ověření: dosadí odpověď do textu příkladu a přepočítá ho. */
function parse(problem: Problem) {
  const tokens = problem.prompt.split(' ')
  expect(tokens).toHaveLength(5)
  const [x, op, y, middle, z] = tokens
  const filled = tokens.map((token) => (token === '?' ? String(problem.answer) : token))
  return { tokens, filled, x, op, y, middle, z }
}

function evaluate(a: number, op: string, b: number): number {
  if (op === '+') return a + b
  if (op === '−') return a - b
  if (op === '×') return a * b
  throw new Error(`neznámá operace ${op}`)
}

function numbersIn(problem: Problem): number[] {
  return parse(problem)
    .filled.map(Number)
    .filter((n) => !Number.isNaN(n))
}

const LIMIT: Record<'add20' | 'add100' | 'missingNumber' | 'comparison', Record<Tier, number>> = {
  add20: { easy: 10, medium: 20, hard: 20 },
  add100: { easy: 100, medium: 100, hard: 100 },
  missingNumber: { easy: 10, medium: 20, hard: 100 },
  comparison: { easy: 10, medium: 20, hard: 100 },
}

/** null = přechod přes desítku se nehlídá. */
const CROSSING: Record<'add20' | 'add100', Record<Tier, boolean | null>> = {
  add20: { easy: null, medium: false, hard: true },
  add100: { easy: null, medium: false, hard: true },
}

describe.each(['add20', 'add100'] as const)('%s', (topic) => {
  test.each(TIERS)('%s: výsledek sedí, čísla v mezích, přechod odpovídá', (tier) => {
    for (const problem of generateMany(topic, tier)) {
      expect(problem.topic).toBe(topic)
      expect(problem.tier).toBe(tier)
      const [a, op, b, eq, c] = parse(problem).filled
      expect(eq, problem.prompt).toBe('=')
      expect(parse(problem).z).toBe('?')
      expect(evaluate(Number(a), op, Number(b)), problem.prompt).toBe(Number(c))
      for (const n of numbersIn(problem)) {
        expect(n, problem.prompt).toBeGreaterThanOrEqual(0)
        expect(n, problem.prompt).toBeLessThanOrEqual(LIMIT[topic][tier])
      }
      const expected = CROSSING[topic][tier]
      if (expected !== null) {
        const crosses = op === '+' ? addCrossesTen(Number(a), Number(b)) : subCrossesTen(Number(a), Number(b))
        expect(crosses, problem.prompt).toBe(expected)
      }
      if (topic === 'add100' && tier === 'easy') {
        for (const n of numbersIn(problem)) expect(n % 10, problem.prompt).toBe(0)
      }
      expect(problem.hint.length).toBeGreaterThan(0)
    }
  })
})

describe('malá násobilka', () => {
  test.each(TIERS)('%s: jen povolené řady, činitel 1–10, správný výsledek', (tier) => {
    const rowsSeen = new Set<number>()
    for (const problem of generateMany('multiplication', tier)) {
      const [times, op, row, eq, result] = parse(problem).filled
      expect(op).toBe('×')
      expect(eq).toBe('=')
      expect(MULTIPLICATION_ROWS[tier]).toContain(Number(row))
      expect(Number(times)).toBeGreaterThanOrEqual(1)
      expect(Number(times)).toBeLessThanOrEqual(10)
      expect(Number(times) * Number(row)).toBe(Number(result))
      rowsSeen.add(Number(row))
    }
    expect([...rowsSeen].sort((a, b) => a - b)).toEqual([...MULTIPLICATION_ROWS[tier]])
  })

  test('řady podle obtížnosti', () => {
    expect(MULTIPLICATION_ROWS).toEqual({ easy: [2, 5, 10], medium: [2, 3, 4, 5, 10], hard: [2, 3, 4, 5, 6, 7, 8, 9, 10] })
  })
})

describe('chybějící číslo', () => {
  test.each(TIERS)('%s: výsledek sedí a čísla jsou v mezích', (tier) => {
    for (const problem of generateMany('missingNumber', tier)) {
      const [a, op, b, eq, c] = parse(problem).filled
      expect(eq).toBe('=')
      expect(parse(problem).z).not.toBe('?')
      expect(evaluate(Number(a), op, Number(b)), problem.prompt).toBe(Number(c))
      for (const n of numbersIn(problem)) {
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n, problem.prompt).toBeLessThanOrEqual(LIMIT.missingNumber[tier])
      }
    }
  })
})

describe('porovnávání', () => {
  test.each(TIERS)('%s: znaménko odpovídá výpočtu, čísla v mezích, objeví se všechna tři', (tier) => {
    const signs = new Set<string>()
    for (const problem of generateMany('comparison', tier)) {
      const { x, op, y, middle, z } = parse(problem)
      expect(middle).toBe('?')
      expect(problem.kind).toBe('compare')
      const left = evaluate(Number(x), op, Number(y))
      const right = Number(z)
      expect(problem.answer, problem.prompt).toBe(left < right ? '<' : left > right ? '>' : '=')
      for (const n of [Number(x), Number(y), left, right]) {
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n, problem.prompt).toBeLessThanOrEqual(LIMIT.comparison[tier])
      }
      signs.add(problem.answer as string)
    }
    expect([...signs].sort()).toEqual(['<', '=', '>'])
  })
})

describe('výběr příkladů', () => {
  test('stejný příklad nikdy dvakrát po sobě, ani v nejužším nastavení', () => {
    for (const topic of TOPIC_IDS.filter((t) => t !== 'wordProblems')) {
      const problems = generateMany(topic, 'easy', 7)
      for (let i = 1; i < problems.length; i++) expect(problems[i].key).not.toBe(problems[i - 1].key)
    }
  })

  test('vybere jen zapnuté kategorie a všechny z nich', () => {
    const rng = seededRng(3)
    const seen = new Set<TopicId>()
    for (let i = 0; i < 500; i++) seen.add(pickTopic(['multiplication', 'comparison'], rng))
    expect([...seen].sort()).toEqual(['comparison', 'multiplication'])
  })

  test('kontrola odpovědi', () => {
    const problem = generateProblem({ topic: 'add20', tier: 'medium', rng: seededRng(5) })
    expect(isCorrectAnswer(problem, problem.answer)).toBe(true)
    expect(isCorrectAnswer(problem, (problem.answer as number) + 1)).toBe(false)
  })
})

describe('peníze a hodiny', () => {
  test('peníze a hodiny se generují pro všechny obtížnosti', () => {
    for (const tier of TIERS) {
      const money = generateProblem({ topic: 'money', tier, rng: seededRng(2) })
      expect(money).toMatchObject({ kind: 'number', topic: 'money', tier, prompt: '?', unit: 'Kč' })
      expect(money.tags!.length).toBeGreaterThanOrEqual(2)
      const clock = generateProblem({ topic: 'clock', tier, rng: seededRng(2) })
      expect(clock).toMatchObject({ kind: 'time', topic: 'clock', tier })
    }
  })

  test('ciferník a čas slovy mají správné zadání', () => {
    const problems = generateMany('clock', 'medium', 4)
    const face = problems.find((p) => p.clock)!
    expect(face).toMatchObject({ story: 'Kolik je hodin?', prompt: '?' })
    expect(face.answer).toBe(face.clock!.hours * 100 + face.clock!.minutes)
    const words = problems.find((p) => !p.clock)!
    expect(words.story).toBe('Kolik je to na digitálních hodinách?')
    expect(words.prompt).toMatch(/ = \?$/)
  })

  test('stejný ciferník nepřijde dvakrát po sobě', () => {
    const problems = generateMany('clock', 'hard', 9)
    for (let i = 1; i < problems.length; i++) {
      const [a, b] = [problems[i - 1].clock!, problems[i].clock!]
      expect(a.hours === b.hours && a.minutes === b.minutes).toBe(false)
    }
  })

  test('odpověď času s nulou v minutách', () => {
    const problem = generateMany('clock', 'hard', 3).find((p) => p.answer === 105)!
    expect(problem.clock).toEqual({ hours: 1, minutes: 5 })
    expect(isCorrectAnswer(problem, Number('105'))).toBe(true)
    expect(isCorrectAnswer(problem, Number('475'))).toBe(false)
  })

  test('formatAnswer', () => {
    const clock = generateProblem({ topic: 'clock', tier: 'hard', rng: seededRng(1) })
    expect(formatAnswer({ ...clock, kind: 'time', answer: 445 } as Problem)).toBe('4:45')
    expect(formatAnswer({ ...clock, kind: 'time', answer: 1230 } as Problem)).toBe('12:30')
    const money = generateProblem({ topic: 'money', tier: 'easy', rng: seededRng(1) })
    expect(formatAnswer({ ...money, kind: 'number', answer: 26 } as Problem)).toBe('26 Kč')
    const add = generateProblem({ topic: 'add20', tier: 'easy', rng: seededRng(1) })
    expect(formatAnswer({ ...add, kind: 'number', answer: 12 } as Problem)).toBe('12')
    const compare = generateProblem({ topic: 'comparison', tier: 'easy', rng: seededRng(1) })
    expect(formatAnswer({ ...compare, kind: 'compare', answer: '<' } as Problem)).toBe('<')
  })
})

describe('nápovědy', () => {
  test('sčítání přes desítku rozloží do desítky a neprozradí výsledek', () => {
    expect(addHint(8, 7)).toBe('Rozlož si to: 8 + 2 + 5. 8 + 2 = 10, a ještě + 5.')
    expect(addHint(38, 27)).toBe('Rozlož si to: 38 + 20 + 2 + 5. 38 + 20 = 58, 58 + 2 = 60, a ještě + 5.')
  })

  test('odčítání přes desítku', () => {
    expect(subHint(13, 5)).toBe('Rozlož si to: 13 − 3 − 2. 13 − 3 = 10, a ještě − 2.')
  })

  test('násobení jako opakované sčítání', () => {
    expect(multiplicationHint(4, 3)).toBe('4 × 3 je 4krát 3: 3 + 3 + 3 + 3.')
    expect(multiplicationHint(7, 2)).toBe('7 × 2 je 7krát 2. Víš, že 5 × 2 = 10, přičti ještě 2 + 2.')
  })

  test('nápověda nikdy neobsahuje výsledek jako „= odpověď“', () => {
    for (const topic of ['add20', 'add100', 'multiplication'] as const) {
      for (const tier of TIERS) {
        for (const problem of generateMany(topic, tier, 11)) {
          expect(problem.hint, `${problem.prompt} | ${problem.hint}`).not.toContain(`= ${problem.answer},`)
          expect(problem.hint, `${problem.prompt} | ${problem.hint}`).not.toMatch(new RegExp(`= ${problem.answer}\\.$`))
        }
      }
    }
  })
})
