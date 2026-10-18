import type { Rng, Tier } from '../types'
import { plural } from './czech'
import { pick, randInt } from './equations'
import { NAMES } from './wordProblems'

/** Věc z obchodu: 1. pád („Mašle stojí…“) a tvary 4. pádu („koupí 1 mašli / 2 mašle / 5 mašlí“). */
interface Good {
  name: string
  one: string
  few: string
  many: string
  emoji: string
}

const GOODS: readonly Good[] = [
  { name: 'mašle', one: 'mašli', few: 'mašle', many: 'mašlí', emoji: '🎀' },
  { name: 'sponka', one: 'sponku', few: 'sponky', many: 'sponek', emoji: '📎' },
  { name: 'nálepka', one: 'nálepku', few: 'nálepky', many: 'nálepek', emoji: '⭐' },
  { name: 'bonbon', one: 'bonbon', few: 'bonbony', many: 'bonbonů', emoji: '🍬' },
  { name: 'náramek', one: 'náramek', few: 'náramky', many: 'náramků', emoji: '📿' },
  { name: 'kytička', one: 'kytičku', few: 'kytičky', many: 'kytiček', emoji: '🌸' },
]

export interface MoneyItem {
  good: Good
  price: number
  count: number
}

export interface MoneyParts {
  items: MoneyItem[]
  /** Kolik má dítě peněz (úloha „kolik zbyde“), null = úloha „kolik to stojí“. */
  budget: number | null
}

export interface MoneyTask {
  kind: 'total' | 'change'
  story: string
  /** Štítky cen, jeden na každou věc, např. „🎀 4 Kč“. */
  tags: string[]
  answer: number
  hint: string
}

interface TierRule {
  items: { min: number; max: number }
  price: { min: number; max: number }
  count: { min: number; max: number }
  /** Nejvyšší cena nákupu; u „kolik zbyde“ zároveň peníze, které dítě má. */
  limit: number
  /** U „kolik zbyde“ jsou kusy jen po jednom (lehké). */
  singleForChange: boolean
}

const RULES: Record<Tier, TierRule> = {
  easy: { items: { min: 2, max: 2 }, price: { min: 1, max: 10 }, count: { min: 1, max: 2 }, limit: 20, singleForChange: true },
  medium: { items: { min: 2, max: 3 }, price: { min: 1, max: 50 }, count: { min: 1, max: 1 }, limit: 100, singleForChange: true },
  hard: { items: { min: 2, max: 2 }, price: { min: 1, max: 10 }, count: { min: 2, max: 5 }, limit: 100, singleForChange: false },
}

const sum = (items: readonly MoneyItem[]) => items.reduce((total, item) => total + item.price * item.count, 0)

function pickGoods(rng: Rng, howMany: number): Good[] {
  const pool = [...GOODS]
  const chosen: Good[] = []
  for (let i = 0; i < howMany; i++) chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
  return chosen
}

/** Čísla úlohy podle obtížnosti. Losuje znovu, dokud nákup nesplní limity. */
export function buildMoneyParts(tier: Tier, rng: Rng): MoneyParts {
  const rule = RULES[tier]
  const change = rng() < 0.5
  const goods = pickGoods(rng, randInt(rng, rule.items))
  for (;;) {
    const items = goods.map((good) => ({
      good,
      price: randInt(rng, rule.price),
      count: change && rule.singleForChange ? 1 : randInt(rng, rule.count),
    }))
    const total = sum(items)
    if (change ? total < rule.limit : total <= rule.limit) return { items, budget: change ? rule.limit : null }
  }
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const pieces = (item: MoneyItem) => `${item.count} ${plural(item.count, item.good.one, item.good.few, item.good.many)}`
const amount = (item: MoneyItem) => (item.count === 1 ? `${item.price} Kč` : `${item.count} × ${item.price} Kč`)

function joinAnd(parts: readonly string[]): string {
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} a ${parts[parts.length - 1]}`
}

function totalStory(items: readonly MoneyItem[], name: string): string {
  if (items.every((item) => item.count === 1)) {
    return `${name} si koupí ${joinAnd(items.map((item) => `${item.good.one} za ${item.price} Kč`))}. Kolik zaplatí?`
  }
  const prices = joinAnd(items.map((item, i) => (i === 0 ? `${capitalize(item.good.name)} stojí ${item.price} Kč` : `${item.good.name} ${item.price} Kč`)))
  return `${prices}. ${name} si koupí ${joinAnd(items.map(pieces))}. Kolik zaplatí?`
}

function changeStory(items: readonly MoneyItem[], budget: number, name: string): string {
  const bought = items.map((item) =>
    item.count === 1 ? `${item.good.one} za ${item.price} Kč` : `${pieces(item)} po ${item.price} Kč`,
  )
  return `${name} má ${budget} Kč. Koupí si ${joinAnd(bought)}. Kolik jí zbyde?`
}

export function buildMoneyTask(tier: Tier, rng: Rng): MoneyTask {
  const { items, budget } = buildMoneyParts(tier, rng)
  const name = pick(rng, NAMES)
  const tags = items.map((item) => `${item.good.emoji} ${item.price} Kč`)
  const total = sum(items)

  if (budget === null) {
    const hint = items.every((item) => item.count === 1)
      ? `Sečti ${joinAnd(items.map(amount))}.`
      : `Spočítej ${joinAnd(items.map(amount))} a sečti.`
    return { kind: 'total', story: totalStory(items, name), tags, answer: total, hint }
  }

  const steps = items.map(amount)
  const hint = `Od ${budget} Kč odečti ${steps[0]}${steps.slice(1).map((step) => ` a pak ${step}`).join('')}.`
  return { kind: 'change', story: changeStory(items, budget, name), tags, answer: budget - total, hint }
}
