export const CATEGORIES = ['hair', 'dress', 'shoes', 'accessory'] as const
export type Category = (typeof CATEGORIES)[number]

/** Místa na těle pro doplňky — na každém nejvýš jeden kousek, různá místa najednou. */
export const ACCESSORY_SLOTS = ['head', 'face', 'neck', 'hand', 'ears'] as const
export type AccessorySlot = (typeof ACCESSORY_SLOTS)[number]

/** Klíč nasazení: kategorie oblečení, u doplňků místo na těle. */
export type EquipSlot = Exclude<Category, 'accessory'> | `accessory:${AccessorySlot}`
export type Equipped = Partial<Record<EquipSlot, string>>

export const LAYER_ORDER =['background', 'body', 'shoes', 'dress', 'hair', 'accessory'] as const
export type Layer = (typeof LAYER_ORDER)[number]
export type ItemLayer = Exclude<Layer, 'background' | 'body'>

export const BADGE_IDS = ['first-step', 'times-table-star', 'diligent-pupil', 'clever-counter', 'counting-queen'] as const
export type BadgeId = (typeof BADGE_IDS)[number]

/** Kategorie úloh („topic“ — `Category` už znamená druh oblečení). */
export const TOPIC_IDS = ['add20', 'add100', 'multiplication', 'missingNumber', 'comparison', 'wordProblems'] as const
export type TopicId = (typeof TOPIC_IDS)[number]

export const TIERS = ['easy', 'medium', 'hard'] as const
export type Tier = (typeof TIERS)[number]

/** Medaile v každé kategorii úloh: bronzová, stříbrná, zlatá. */
export const MEDAL_TIERS = ['bronze', 'silver', 'gold'] as const
export type MedalTier = (typeof MEDAL_TIERS)[number]
export type MedalId = `${TopicId}:${MedalTier}`

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
  /** Jen u doplňků. */
  slot?: AccessorySlot
}

export interface Settings {
  soundOn: boolean
  topics: TopicSettings
}

export interface SaveData {
  saveVersion: 4
  gold: number
  owned: string[]
  equipped: Equipped
  badges: BadgeId[]
  stats: {
    totalCorrect: number
    multiplicationStreak: number
    /** Správně vyřešené příklady po kategoriích (počítá se od verze 4). */
    correctByTopic: Record<TopicId, number>
  }
  medals: MedalId[]
  /** Aktuální obtížnost každé kategorie (hra ji posouvá sama). */
  currentTier: Record<TopicId, Tier>
  practice: Practice
  settings: Settings
  parentPinHash: string | null
}
