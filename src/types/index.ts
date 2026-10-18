export const CATEGORIES = ['hair', 'dress', 'shoes', 'accessory'] as const
export type Category = (typeof CATEGORIES)[number]

export const LAYER_ORDER = ['background', 'body', 'shoes', 'dress', 'hair', 'accessory'] as const
export type Layer = (typeof LAYER_ORDER)[number]
export type ItemLayer = Exclude<Layer, 'background' | 'body'>

export const BADGE_IDS = ['first-step', 'times-table-star', 'diligent-pupil'] as const
export type BadgeId = (typeof BADGE_IDS)[number]

export const PROBLEM_TYPES = ['addSub', 'multiplication', 'missingNumber', 'comparison'] as const
export type ProblemType = (typeof PROBLEM_TYPES)[number]

export const LEVELS = [1, 2, 3, 4] as const
export type Level = (typeof LEVELS)[number]

/** Kategorie úloh („topic“ — `Category` už znamená druh oblečení). */
export const TOPIC_IDS = ['add20', 'add100', 'multiplication', 'missingNumber', 'comparison', 'wordProblems'] as const
export type TopicId = (typeof TOPIC_IDS)[number]

export const TIERS = ['easy', 'medium', 'hard'] as const
export type Tier = (typeof TIERS)[number]

/** Zaškrtnuté obtížnosti každé kategorie; prázdné pole = kategorie vypnutá. */
export type TopicSettings = Record<TopicId, Tier[]>

export type PracticeKey = `${TopicId}:${Tier}`

export interface PracticeRecord {
  /** Posledních nejvýš 20 výsledků, true = úspěch. */
  recent: boolean[]
  total: number
  /** Hodnota `total` v okamžiku „Teď ne“. */
  snoozedAtTotal: number | null
}

export type Practice = Partial<Record<PracticeKey, PracticeRecord>>

/** Náhodné číslo v intervalu [0, 1), jako Math.random. V testech se podstrčí deterministické. */
export type Rng = () => number

export interface Item {
  id: string
  name: string
  category: Category
  /** 0 = startovní kousek zdarma, null = nedá se koupit (odemyká se odznakem) */
  price: number | null
  layer: ItemLayer
  asset: string
  unlockBadge?: BadgeId
}

export interface Settings {
  soundOn: boolean
  enabledTypes: ProblemType[]
  minLevel: Level
  maxLevel: Level
}

export interface SaveData {
  saveVersion: 1
  gold: number
  owned: string[]
  equipped: Partial<Record<Category, string>>
  badges: BadgeId[]
  stats: {
    totalCorrect: number
    multiplicationStreak: number
  }
  level: Level
  settings: Settings
  parentPinHash: string | null
}
