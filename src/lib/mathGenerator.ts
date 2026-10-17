import { PROBLEM_TYPES, type Level, type ProblemType, type Rng } from '../types'

export type CompareSign = '<' | '>' | '='

interface ProblemBase {
  level: Level
  /** Tokeny oddělené mezerou, `?` označuje místo pro odpověď, např. „7 + ? = 15“. */
  prompt: string
  hint: string
  key: string
}

export type NumberProblem = ProblemBase & {
  type: Exclude<ProblemType, 'comparison'>
  answer: number
}

export type ComparisonProblem = ProblemBase & {
  type: 'comparison'
  answer: CompareSign
}

export type Problem = NumberProblem | ComparisonProblem

export const MINUS = '−'
export const TIMES = '·'

interface Range {
  min: number
  max: number
}

interface AddSubRule {
  limit: number
  crossing: boolean
  addA: Range
  addB: Range
  subA: Range
  subB: Range
}

/** Stupně: 1 = do 20 bez přechodu, 2 = do 20 s přechodem, 3 = do 100 bez přechodu, 4 = do 100 s přechodem. */
export const ADD_SUB_RULES: Record<Level, AddSubRule> = {
  1: { limit: 20, crossing: false, addA: { min: 1, max: 19 }, addB: { min: 1, max: 19 }, subA: { min: 2, max: 20 }, subB: { min: 1, max: 19 } },
  2: { limit: 20, crossing: true, addA: { min: 2, max: 9 }, addB: { min: 2, max: 9 }, subA: { min: 11, max: 20 }, subB: { min: 2, max: 9 } },
  3: { limit: 100, crossing: false, addA: { min: 10, max: 89 }, addB: { min: 2, max: 89 }, subA: { min: 20, max: 99 }, subB: { min: 2, max: 89 } },
  4: { limit: 100, crossing: true, addA: { min: 11, max: 89 }, addB: { min: 2, max: 89 }, subA: { min: 20, max: 99 }, subB: { min: 2, max: 89 } },
}

/** Řady malé násobilky povolené na jednotlivých stupních (přibývají). */
export const MULTIPLICATION_ROWS: Record<Level, readonly number[]> = {
  1: [2, 5, 10],
  2: [2, 3, 4, 5, 10],
  3: [2, 3, 4, 5, 6, 7, 10],
  4: [2, 3, 4, 5, 6, 7, 8, 9, 10],
}

const ones = (n: number) => n % 10

/** Přechod přes desítku: u sčítání jednotky dají víc než 10, u odčítání jednotky nestačí. */
export const addCrossesTen = (a: number, b: number) => ones(a) + ones(b) > 10
export const subCrossesTen = (a: number, b: number) => ones(a) < ones(b)

function randInt(rng: Rng, { min, max }: Range): number {
  return min + Math.floor(rng() * (max - min + 1))
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

interface Equation {
  a: number
  op: '+' | '-'
  b: number
  c: number
}

function generateEquation(rng: Rng, level: Level): Equation {
  const rule = ADD_SUB_RULES[level]
  const op = rng() < 0.5 ? '+' : '-'
  for (let attempt = 0; attempt < 10_000; attempt++) {
    if (op === '+') {
      const a = randInt(rng, rule.addA)
      const b = randInt(rng, rule.addB)
      if (a + b <= rule.limit && addCrossesTen(a, b) === rule.crossing) return { a, op, b, c: a + b }
    } else {
      const a = randInt(rng, rule.subA)
      const b = randInt(rng, rule.subB)
      if (b < a && subCrossesTen(a, b) === rule.crossing) return { a, op, b, c: a - b }
    }
  }
  throw new Error(`Nepodařilo se vygenerovat příklad pro stupeň ${level}`)
}

const opSymbol = (op: Equation['op']) => (op === '+' ? '+' : MINUS)

/** Kroky rozkladu bez posledního výsledku, aby nápověda neprozradila odpověď. */
function stepsWithoutResult(start: number, parts: number[], op: Equation['op']): string {
  const symbol = opSymbol(op)
  const steps: string[] = []
  let current = start
  for (const part of parts.slice(0, -1)) {
    const next = op === '+' ? current + part : current - part
    steps.push(`${current} ${symbol} ${part} = ${next}`)
    current = next
  }
  steps.push(`a ještě ${symbol} ${parts[parts.length - 1]}`)
  return steps.join(', ') + '.'
}

export function addHint(a: number, b: number): string {
  const [x, y] = a >= b ? [a, b] : [b, a]
  const parts: number[] = []
  const tens = y - ones(y)
  if (tens > 0) parts.push(tens)
  let units = ones(y)
  const toNextTen = (10 - ones(x + tens)) % 10
  if (toNextTen > 0 && units > toNextTen) {
    parts.push(toNextTen)
    units -= toNextTen
  }
  if (units > 0) parts.push(units)

  if (parts.length === 1) return y < 10 ? `Začni u ${x} a přičítej po jedné.` : `Přičítej k ${x} po desítkách.`
  return `Rozlož si to: ${x} + ${parts.join(' + ')}. ${stepsWithoutResult(x, parts, '+')}`
}

export function subHint(a: number, b: number): string {
  const parts: number[] = []
  const tens = b - ones(b)
  if (tens > 0) parts.push(tens)
  let units = ones(b)
  const toLowerTen = ones(a - tens)
  if (toLowerTen > 0 && units > toLowerTen) {
    parts.push(toLowerTen)
    units -= toLowerTen
  }
  if (units > 0) parts.push(units)

  if (parts.length === 1) return b < 10 ? `Začni u ${a} a odečítej po jedné.` : `Odečítej od ${a} po desítkách.`
  return `Rozlož si to: ${a} ${MINUS} ${parts.join(` ${MINUS} `)}. ${stepsWithoutResult(a, parts, '-')}`
}

export function multiplicationHint(times: number, row: number): string {
  const repeat = (count: number) => Array.from({ length: count }, () => row).join(' + ')
  if (times <= 5) return `${times} ${TIMES} ${row} je ${times}krát ${row}: ${repeat(times)}.`
  return `${times} ${TIMES} ${row} je ${times}krát ${row}. Víš, že 5 ${TIMES} ${row} = ${5 * row}, přičti ještě ${repeat(times - 5)}.`
}

function buildAddSub(rng: Rng, level: Level): NumberProblem {
  const { a, op, b, c } = generateEquation(rng, level)
  return {
    type: 'addSub',
    level,
    prompt: `${a} ${opSymbol(op)} ${b} = ?`,
    answer: c,
    hint: op === '+' ? addHint(a, b) : subHint(a, b),
    key: '',
  }
}

function buildMultiplication(rng: Rng, level: Level): NumberProblem {
  const row = pick(rng, MULTIPLICATION_ROWS[level])
  const times = randInt(rng, { min: 1, max: 10 })
  return {
    type: 'multiplication',
    level,
    prompt: `${times} ${TIMES} ${row} = ?`,
    answer: times * row,
    hint: multiplicationHint(times, row),
    key: '',
  }
}

function buildMissingNumber(rng: Rng, level: Level): NumberProblem {
  const { a, op, b, c } = generateEquation(rng, level)
  const symbol = opSymbol(op)
  const hideFirst = rng() < 0.5
  const base = { type: 'missingNumber' as const, level, key: '' }

  if (op === '+') {
    return hideFirst
      ? { ...base, prompt: `? + ${b} = ${c}`, answer: a, hint: `Které číslo dá s ${b} dohromady ${c}? Spočítej ${c} ${MINUS} ${b}.` }
      : { ...base, prompt: `${a} + ? = ${c}`, answer: b, hint: `Kolik chybí od ${a} do ${c}? Spočítej ${c} ${MINUS} ${a}.` }
  }
  return hideFirst
    ? { ...base, prompt: `? ${symbol} ${b} = ${c}`, answer: a, hint: `Od kterého čísla ubereš ${b} a zbyde ${c}? Spočítej ${c} + ${b}.` }
    : { ...base, prompt: `${a} ${symbol} ? = ${c}`, answer: b, hint: `Kolik musíš ubrat z ${a}, aby zbylo ${c}? Spočítej ${a} ${MINUS} ${c}.` }
}

function buildComparison(rng: Rng, level: Level): ComparisonProblem {
  const { a, op, b, c } = generateEquation(rng, level)
  const shift = rng() < 1 / 3 ? 0 : pick(rng, [-3, -2, -1, 1, 2, 3])
  const other = Math.min(Math.max(c + shift, 0), ADD_SUB_RULES[level].limit)
  const answer: CompareSign = c < other ? '<' : c > other ? '>' : '='
  return {
    type: 'comparison',
    level,
    prompt: `${a} ${opSymbol(op)} ${b} ? ${other}`,
    answer,
    hint: `Nejdřív spočítej ${a} ${opSymbol(op)} ${b}, potom porovnej s ${other}.`,
    key: '',
  }
}

const BUILDERS: Record<ProblemType, (rng: Rng, level: Level) => Problem> = {
  addSub: buildAddSub,
  multiplication: buildMultiplication,
  missingNumber: buildMissingNumber,
  comparison: buildComparison,
}

export interface GenerateOptions {
  types: readonly ProblemType[]
  level: Level
  /** Klíč předchozího příkladu — nový příklad nebude stejný. */
  previousKey?: string
  rng?: Rng
}

export function generateProblem({ types, level, previousKey, rng = Math.random }: GenerateOptions): Problem {
  const pool = types.length > 0 ? types : PROBLEM_TYPES
  let problem: Problem
  do {
    const built = BUILDERS[pick(rng, pool)](rng, level)
    problem = { ...built, key: `${built.type}|${built.prompt}` }
  } while (problem.key === previousKey)
  return problem
}

export function isCorrectAnswer(problem: Problem, given: number | CompareSign): boolean {
  return problem.answer === given
}
