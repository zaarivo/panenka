import type { Rng, Tier, TopicId } from '../types'
import { EQUATION_RULES, MINUS, TIMES, generateEquation, pick, randInt, type AddSubRule, type Equation } from './equations'
import { generateWordProblem } from './wordProblems'

export { MINUS, TIMES }

export type CompareSign = '<' | '>' | '='

interface ProblemBase {
  topic: TopicId
  tier: Tier
  /** Tokeny oddělené mezerou, `?` označuje místo pro odpověď, např. „7 + ? = 15“. U slovní úlohy jen „?“. */
  prompt: string
  hint: string
  key: string
  /** Text slovní úlohy. */
  story?: string
}

export type NumberProblem = ProblemBase & { kind: 'number'; answer: number }
export type ComparisonProblem = ProblemBase & { kind: 'compare'; answer: CompareSign }
export type Problem = NumberProblem | ComparisonProblem
export type ProblemDraft = Omit<NumberProblem, 'key'> | Omit<ComparisonProblem, 'key'>

export const MULTIPLICATION_ROWS: Record<Tier, readonly number[]> = {
  easy: [2, 5, 10],
  medium: [2, 3, 4, 5, 10],
  hard: [2, 3, 4, 5, 6, 7, 8, 9, 10],
}

const ones = (n: number) => n % 10

export const opSymbol = (op: Equation['op']) => (op === '+' ? '+' : MINUS)

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

/** Rovnice pro chybějící číslo, porovnávání a slovní úlohy: lehké do 10, střední do 20, těžké do 100. */
export function mixedEquationRule(rng: Rng, tier: Tier): AddSubRule {
  if (tier === 'easy') return EQUATION_RULES.add20.easy
  const source = tier === 'medium' ? EQUATION_RULES.add20 : EQUATION_RULES.add100
  return rng() < 0.5 ? source.medium : source.hard
}

const COMPARISON_LIMIT: Record<Tier, number> = { easy: 10, medium: 20, hard: 100 }

function buildAddSub(source: 'add20' | 'add100') {
  return (rng: Rng, tier: Tier): ProblemDraft => {
    const { a, op, b, c } = generateEquation(rng, EQUATION_RULES[source][tier])
    return {
      kind: 'number',
      topic: source,
      tier,
      prompt: `${a} ${opSymbol(op)} ${b} = ?`,
      answer: c,
      hint: op === '+' ? addHint(a, b) : subHint(a, b),
    }
  }
}

function buildMultiplication(rng: Rng, tier: Tier): ProblemDraft {
  const row = pick(rng, MULTIPLICATION_ROWS[tier])
  const times = randInt(rng, { min: 1, max: 10 })
  return {
    kind: 'number',
    topic: 'multiplication',
    tier,
    prompt: `${times} ${TIMES} ${row} = ?`,
    answer: times * row,
    hint: multiplicationHint(times, row),
  }
}

function buildMissingNumber(rng: Rng, tier: Tier): ProblemDraft {
  const { a, op, b, c } = generateEquation(rng, mixedEquationRule(rng, tier))
  const symbol = opSymbol(op)
  const hideFirst = rng() < 0.5
  const base = { kind: 'number' as const, topic: 'missingNumber' as const, tier }

  if (op === '+') {
    return hideFirst
      ? { ...base, prompt: `? + ${b} = ${c}`, answer: a, hint: `Které číslo dá s ${b} dohromady ${c}? Spočítej ${c} ${MINUS} ${b}.` }
      : { ...base, prompt: `${a} + ? = ${c}`, answer: b, hint: `Kolik chybí od ${a} do ${c}? Spočítej ${c} ${MINUS} ${a}.` }
  }
  return hideFirst
    ? { ...base, prompt: `? ${symbol} ${b} = ${c}`, answer: a, hint: `Od kterého čísla ubereš ${b} a zbyde ${c}? Spočítej ${c} + ${b}.` }
    : { ...base, prompt: `${a} ${symbol} ? = ${c}`, answer: b, hint: `Kolik musíš ubrat z ${a}, aby zbylo ${c}? Spočítej ${a} ${MINUS} ${c}.` }
}

function buildComparison(rng: Rng, tier: Tier): ProblemDraft {
  const { a, op, b, c } = generateEquation(rng, mixedEquationRule(rng, tier))
  const shift = rng() < 1 / 3 ? 0 : pick(rng, [-3, -2, -1, 1, 2, 3])
  const other = Math.min(Math.max(c + shift, 0), COMPARISON_LIMIT[tier])
  const answer: CompareSign = c < other ? '<' : c > other ? '>' : '='
  return {
    kind: 'compare',
    topic: 'comparison',
    tier,
    prompt: `${a} ${opSymbol(op)} ${b} ? ${other}`,
    answer,
    hint: `Nejdřív spočítej ${a} ${opSymbol(op)} ${b}, potom porovnej s ${other}.`,
  }
}

const BUILDERS: Record<TopicId, (rng: Rng, tier: Tier) => ProblemDraft> = {
  add20: buildAddSub('add20'),
  add100: buildAddSub('add100'),
  multiplication: buildMultiplication,
  missingNumber: buildMissingNumber,
  comparison: buildComparison,
  wordProblems: (rng, tier) => generateWordProblem(tier, rng),
}

export function pickTopic(enabled: readonly TopicId[], rng: Rng = Math.random): TopicId {
  return pick(rng, enabled)
}

export interface GenerateOptions {
  topic: TopicId
  tier: Tier
  /** Klíč předchozího příkladu — nový příklad nebude stejný. */
  previousKey?: string
  rng?: Rng
}

export function generateProblem({ topic, tier, previousKey, rng = Math.random }: GenerateOptions): Problem {
  let problem: Problem
  do {
    const draft = BUILDERS[topic](rng, tier)
    problem = { ...draft, key: `${topic}|${draft.story ?? ''}|${draft.prompt}` } as Problem
  } while (problem.key === previousKey)
  return problem
}

export function isCorrectAnswer(problem: Problem, given: number | CompareSign): boolean {
  return problem.answer === given
}
