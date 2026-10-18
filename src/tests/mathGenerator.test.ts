import { describe, expect, test } from 'vitest'
import {
  MULTIPLICATION_ROWS,
  addCrossesTen,
  addHint,
  generateProblem,
  isCorrectAnswer,
  multiplicationHint,
  subCrossesTen,
  subHint,
  type Problem,
} from '../lib/mathGenerator'
import { LEVELS, PROBLEM_TYPES, type Level, type ProblemType } from '../types'
import { seededRng } from './seededRng'

const SAMPLES = 2000
const LIMIT: Record<Level, number> = { 1: 20, 2: 20, 3: 100, 4: 100 }

function generateMany(type: ProblemType, level: Level, seed = 1): Problem[] {
  const rng = seededRng(seed)
  const problems: Problem[] = []
  let previousKey: string | undefined
  for (let i = 0; i < SAMPLES; i++) {
    const problem = generateProblem({ types: [type], level, previousKey, rng })
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

describe.each(LEVELS)('stupeň %i', (level) => {
  test.each(['addSub', 'missingNumber'] as const)('%s: výsledek sedí, čísla jsou v rozsahu a přechod odpovídá stupni', (type) => {
    for (const problem of generateMany(type, level)) {
      const { filled } = parse(problem)
      const [a, op, b, eq, c] = filled
      expect(eq, problem.prompt).toBe('=')
      expect(evaluate(Number(a), op, Number(b)), problem.prompt).toBe(Number(c))
      for (const n of numbersIn(problem)) {
        expect(n, problem.prompt).toBeGreaterThanOrEqual(0)
        expect(n, problem.prompt).toBeLessThanOrEqual(LIMIT[level])
      }
      const crosses = op === '+' ? addCrossesTen(Number(a), Number(b)) : subCrossesTen(Number(a), Number(b))
      expect(crosses, problem.prompt).toBe(level === 2 || level === 4)
      expect(problem.hint.length).toBeGreaterThan(0)
      expect(problem.level).toBe(level)
    }
  })

  test('addSub: odpověď je vždy výsledek za rovnítkem', () => {
    for (const problem of generateMany('addSub', level)) {
      expect(parse(problem).z).toBe('?')
    }
  })

  test('násobilka: jen povolené řady, činitel 1–10, správný výsledek', () => {
    const rowsSeen = new Set<number>()
    for (const problem of generateMany('multiplication', level)) {
      const [times, op, row, eq, result] = parse(problem).filled
      expect(op).toBe('×')
      expect(eq).toBe('=')
      expect(MULTIPLICATION_ROWS[level]).toContain(Number(row))
      expect(Number(times)).toBeGreaterThanOrEqual(1)
      expect(Number(times)).toBeLessThanOrEqual(10)
      expect(Number(times) * Number(row)).toBe(Number(result))
      rowsSeen.add(Number(row))
    }
    expect([...rowsSeen].sort((a, b) => a - b)).toEqual([...MULTIPLICATION_ROWS[level]])
  })

  test('porovnávání: znaménko odpovídá výpočtu a objeví se všechna tři', () => {
    const signs = new Set<string>()
    for (const problem of generateMany('comparison', level)) {
      const { x, op, y, middle, z } = parse(problem)
      expect(middle).toBe('?')
      const left = evaluate(Number(x), op, Number(y))
      const right = Number(z)
      const expected = left < right ? '<' : left > right ? '>' : '='
      expect(problem.answer, problem.prompt).toBe(expected)
      expect(right).toBeGreaterThanOrEqual(0)
      expect(right).toBeLessThanOrEqual(LIMIT[level])
      signs.add(problem.answer as string)
    }
    expect([...signs].sort()).toEqual(['<', '=', '>'])
  })
})

describe('výběr příkladů', () => {
  test('stejný příklad nikdy dvakrát po sobě, ani v nejužším nastavení', () => {
    for (const type of PROBLEM_TYPES) {
      const problems = generateMany(type, 1, 7)
      for (let i = 1; i < problems.length; i++) {
        expect(problems[i].key).not.toBe(problems[i - 1].key)
      }
    }
  })

  test('generuje jen povolené typy a všechny z nich', () => {
    const rng = seededRng(3)
    const seen = new Set<ProblemType>()
    for (let i = 0; i < 500; i++) {
      seen.add(generateProblem({ types: ['multiplication', 'comparison'], level: 2, rng }).type)
    }
    expect([...seen].sort()).toEqual(['comparison', 'multiplication'])
  })

  test('prázdný seznam typů použije všechny typy', () => {
    const rng = seededRng(4)
    const seen = new Set<ProblemType>()
    for (let i = 0; i < 500; i++) seen.add(generateProblem({ types: [], level: 1, rng }).type)
    expect(seen.size).toBe(PROBLEM_TYPES.length)
  })

  test('kontrola odpovědi', () => {
    const problem = generateProblem({ types: ['addSub'], level: 1, rng: seededRng(5) })
    expect(isCorrectAnswer(problem, problem.answer)).toBe(true)
    expect(isCorrectAnswer(problem, (problem.answer as number) + 1)).toBe(false)
  })
})

describe('nápovědy', () => {
  test('sčítání přes desítku rozloží do desítky a neprozradí výsledek', () => {
    expect(addHint(8, 7)).toBe('Rozlož si to: 8 + 2 + 5. 8 + 2 = 10, a ještě + 5.')
    expect(addHint(7, 8)).toBe('Rozlož si to: 8 + 2 + 5. 8 + 2 = 10, a ještě + 5.')
    expect(addHint(38, 27)).toBe('Rozlož si to: 38 + 20 + 2 + 5. 38 + 20 = 58, 58 + 2 = 60, a ještě + 5.')
  })

  test('sčítání bez přechodu', () => {
    expect(addHint(12, 5)).toBe('Začni u 12 a přičítej po jedné.')
    expect(addHint(34, 25)).toBe('Rozlož si to: 34 + 20 + 5. 34 + 20 = 54, a ještě + 5.')
    expect(addHint(34, 20)).toBe('Přičítej k 34 po desítkách.')
  })

  test('odčítání přes desítku', () => {
    expect(subHint(13, 5)).toBe('Rozlož si to: 13 − 3 − 2. 13 − 3 = 10, a ještě − 2.')
    expect(subHint(52, 27)).toBe('Rozlož si to: 52 − 20 − 2 − 5. 52 − 20 = 32, 32 − 2 = 30, a ještě − 5.')
  })

  test('násobení jako opakované sčítání', () => {
    expect(multiplicationHint(4, 3)).toBe('4 × 3 je 4krát 3: 3 + 3 + 3 + 3.')
    expect(multiplicationHint(7, 2)).toBe('7 × 2 je 7krát 2. Víš, že 5 × 2 = 10, přičti ještě 2 + 2.')
  })

  test('nápověda nikdy neobsahuje výsledek jako „= odpověď“', () => {
    for (const level of LEVELS) {
      for (const type of ['addSub', 'multiplication'] as const) {
        for (const problem of generateMany(type, level, 11)) {
          expect(problem.hint, `${problem.prompt} | ${problem.hint}`).not.toContain(`= ${problem.answer},`)
          expect(problem.hint, `${problem.prompt} | ${problem.hint}`).not.toMatch(new RegExp(`= ${problem.answer}\\.$`))
        }
      }
    }
  })
})
