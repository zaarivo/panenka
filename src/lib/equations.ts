import type { Rng, Tier } from '../types'

export const MINUS = '−'
export const TIMES = '×'

export interface Range {
  min: number
  max: number
}

export interface AddSubRule {
  limit: number
  /** null = přechod přes desítku se nehlídá. */
  crossing: boolean | null
  /** 10 = jen celé desítky. */
  step?: number
  addA: Range
  addB: Range
  subA: Range
  subB: Range
}

export type EquationSource = 'add20' | 'add100'

export const EQUATION_RULES: Record<EquationSource, Record<Tier, AddSubRule>> = {
  add20: {
    easy: { limit: 10, crossing: null, addA: { min: 1, max: 9 }, addB: { min: 1, max: 9 }, subA: { min: 2, max: 10 }, subB: { min: 1, max: 9 } },
    medium: { limit: 20, crossing: false, addA: { min: 1, max: 19 }, addB: { min: 1, max: 19 }, subA: { min: 2, max: 20 }, subB: { min: 1, max: 19 } },
    hard: { limit: 20, crossing: true, addA: { min: 2, max: 9 }, addB: { min: 2, max: 9 }, subA: { min: 11, max: 20 }, subB: { min: 2, max: 9 } },
  },
  add100: {
    easy: { limit: 100, crossing: null, step: 10, addA: { min: 10, max: 90 }, addB: { min: 10, max: 90 }, subA: { min: 20, max: 100 }, subB: { min: 10, max: 90 } },
    medium: { limit: 100, crossing: false, addA: { min: 10, max: 89 }, addB: { min: 2, max: 89 }, subA: { min: 20, max: 99 }, subB: { min: 2, max: 89 } },
    hard: { limit: 100, crossing: true, addA: { min: 11, max: 89 }, addB: { min: 2, max: 89 }, subA: { min: 20, max: 99 }, subB: { min: 2, max: 89 } },
  },
}

export interface Equation {
  a: number
  op: '+' | '-'
  b: number
  c: number
}

const ones = (n: number) => n % 10

/** Přechod přes desítku: u sčítání jednotky dají víc než 10, u odčítání jednotky nestačí. */
export const addCrossesTen = (a: number, b: number) => ones(a) + ones(b) > 10
export const subCrossesTen = (a: number, b: number) => ones(a) < ones(b)

export function randInt(rng: Rng, { min, max }: Range, step = 1): number {
  const low = Math.ceil(min / step)
  const high = Math.floor(max / step)
  return (low + Math.floor(rng() * (high - low + 1))) * step
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function generateEquation(rng: Rng, rule: AddSubRule): Equation {
  const op = rng() < 0.5 ? '+' : '-'
  const step = rule.step ?? 1
  const crossingOk = (crosses: boolean) => rule.crossing === null || crosses === rule.crossing
  for (let attempt = 0; attempt < 10_000; attempt++) {
    if (op === '+') {
      const a = randInt(rng, rule.addA, step)
      const b = randInt(rng, rule.addB, step)
      if (a + b <= rule.limit && crossingOk(addCrossesTen(a, b))) return { a, op, b, c: a + b }
    } else {
      const a = randInt(rng, rule.subA, step)
      const b = randInt(rng, rule.subB, step)
      if (b < a && crossingOk(subCrossesTen(a, b))) return { a, op, b, c: a - b }
    }
  }
  throw new Error('Nepodařilo se vygenerovat rovnici')
}
