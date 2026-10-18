import type { Rng, Tier } from '../types'
import { plural } from './czech'
import { EQUATION_RULES, MINUS, TIMES, generateEquation, pick, randInt } from './equations'
import type { ProblemDraft } from './mathGenerator'

/** Tvary ve 4. pádě (koho, co): „má 1 mašli / 2 mašle / 5 mašlí“. */
interface Noun {
  one: string
  few: string
  many: string
}

const noun = (one: string, few: string, many: string): Noun => ({ one, few, many })
const count = (n: number, word: Noun) => `${n} ${plural(n, word.one, word.few, word.many)}`

const KORALEK = noun('korálek', 'korálky', 'korálků')
const NALEPKA = noun('nálepku', 'nálepky', 'nálepek')
const SPONKA = noun('sponku', 'sponky', 'sponek')
const ZLATAK = noun('zlaťák', 'zlaťáky', 'zlaťáků')
const BONBON = noun('bonbon', 'bonbony', 'bonbonů')
const MASLE = noun('mašli', 'mašle', 'mašlí')
const PANENKA = noun('panenku', 'panenky', 'panenek')
const KNOFLIK = noun('knoflík', 'knoflíky', 'knoflíků')
const KRABICKA = noun('krabičku', 'krabičky', 'krabiček')
const NARAMEK = noun('náramek', 'náramky', 'náramků')
const KAMARADKA = noun('kamarádku', 'kamarádky', 'kamarádek')
const SUKNE = noun('sukni', 'sukně', 'sukní')
const PRIKLAD = noun('příklad', 'příklady', 'příkladů')
const STRANKA = noun('stránku', 'stránky', 'stránek')
const KYTICE = noun('kytici', 'kytice', 'kytic')
const KVETINA = noun('květinu', 'květiny', 'květin')

export interface WordTemplate {
  op: '+' | '−' | '×'
  render: (a: number, b: number, name: string) => string
}

const ADD_SUB: readonly WordTemplate[] = [
  { op: '+', render: (a, b, name) => `${name} má ${count(a, KORALEK)}. Od babičky dostane ještě ${count(b, KORALEK)}. Kolik korálků má teď?` },
  { op: '+', render: (a, b, name) => `${name} koupila ${count(a, NALEPKA)} a pak ještě ${count(b, NALEPKA)}. Kolik nálepek koupila celkem?` },
  { op: '+', render: (a, b, name) => `Panenka má ve šperkovnici ${count(a, SPONKA)}. ${name} jí přidá ${count(b, SPONKA)}. Kolik sponek je teď ve šperkovnici?` },
  { op: '+', render: (a, b, name) => `${name} našetřila ${count(a, ZLATAK)} a za úklid dostala ${count(b, ZLATAK)}. Kolik zlaťáků má dohromady?` },
  { op: '+', render: (a, b, name) => `${name} našla v šuplíku ${count(a, MASLE)} a v krabici ${count(b, MASLE)}. Kolik mašlí našla celkem?` },
  { op: '−', render: (a, b, name) => `${name} měla ${count(a, BONBON)}. Kamarádkám rozdala ${count(b, BONBON)}. Kolik bonbonů jí zbylo?` },
  { op: '−', render: (a, b, name) => `${name} měla ${count(a, MASLE)} a ${count(b, MASLE)} darovala sestře. Kolik mašlí jí zůstalo?` },
  { op: '−', render: (a, b) => `V obchodě měli ${count(a, PANENKA)}. Dnes prodali ${count(b, PANENKA)}. Kolik panenek jim zbylo?` },
  { op: '−', render: (a, b, name) => `${name} měla ${count(a, ZLATAK)}. Za novou kabelku zaplatila ${count(b, ZLATAK)}. Kolik zlaťáků jí zbylo?` },
]

const MULTIPLY: readonly WordTemplate[] = [
  { op: '×', render: (a, b, name) => `${name} má ${count(a, KRABICKA)}. V každé krabičce má ${count(b, MASLE)}. Kolik mašlí má celkem?` },
  { op: '×', render: (a, b, name) => `${name} chce udělat ${count(a, NARAMEK)}. Na každý potřebuje ${count(b, KORALEK)}. Kolik korálků potřebuje?` },
  { op: '×', render: (a, b, name) => `Jedna panenka stojí ${count(b, ZLATAK)}. ${name} koupí ${count(a, PANENKA)}. Kolik zlaťáků zaplatí?` },
  { op: '×', render: (a, b, name) => `${name} pozvala ${count(a, KAMARADKA)}. Každé dá ${count(b, BONBON)}. Kolik bonbonů rozdá?` },
  { op: '×', render: (a, b, name) => `${name} šije ${count(a, SUKNE)}. Na každou sukni přišije ${count(b, KNOFLIK)}. Kolik knoflíků přišije?` },
  { op: '×', render: (a, b, name) => `Za každý správný příklad dostane ${name} ${count(b, ZLATAK)}. Vyřeší ${count(a, PRIKLAD)}. Kolik zlaťáků dostane?` },
  { op: '×', render: (a, b, name) => `${name} zaplní v albu ${count(a, STRANKA)}. Na každou stránku nalepí ${count(b, NALEPKA)}. Kolik nálepek nalepí?` },
  { op: '×', render: (a, b, name) => `${name} uváže ${count(a, KYTICE)}. Do každé kytice dá ${count(b, KVETINA)}. Kolik květin potřebuje?` },
]

export const WORD_TEMPLATES: Record<Tier, readonly WordTemplate[]> = {
  easy: ADD_SUB,
  medium: ADD_SUB,
  hard: MULTIPLY,
}

const NAMES = ['Ema', 'Anička', 'Klárka', 'Terka', 'Bára'] as const

function operands(tier: Tier, rng: Rng): { a: number; b: number; op: WordTemplate['op']; result: number } {
  if (tier === 'hard') {
    const a = randInt(rng, { min: 2, max: 10 })
    const b = randInt(rng, { min: 2, max: 10 })
    return { a, b, op: TIMES, result: a * b }
  }
  const source = tier === 'easy' ? EQUATION_RULES.add20 : EQUATION_RULES.add100
  const { a, op, b, c } = generateEquation(rng, rng() < 0.5 ? source.medium : source.hard)
  return { a, b, op: op === '+' ? '+' : MINUS, result: c }
}

export function generateWordProblem(tier: Tier, rng: Rng = Math.random): ProblemDraft {
  const { a, b, op, result } = operands(tier, rng)
  const template = pick(
    rng,
    WORD_TEMPLATES[tier].filter((t) => t.op === op),
  )
  return {
    kind: 'number',
    topic: 'wordProblems',
    tier,
    prompt: '?',
    story: template.render(a, b, pick(rng, NAMES)),
    answer: result,
    hint: `Spočítej ${a} ${op} ${b}.`,
  }
}
