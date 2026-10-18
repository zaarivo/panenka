import { TIERS, TOPIC_IDS, type PracticeKey, type Tier, type TopicId, type TopicSettings } from '../types'

export const TOPIC_LABELS: Record<TopicId, string> = {
  add20: 'Sčítání a odčítání do 20',
  add100: 'Sčítání a odčítání do 100',
  multiplication: 'Malá násobilka',
  missingNumber: 'Chybějící číslo',
  comparison: 'Porovnávání',
  wordProblems: 'Slovní úlohy',
  money: 'Peníze',
  clock: 'Hodiny',
}

/** Kategorie, které jsou po instalaci (a v uložení, kde chybí) vypnuté, dokud je rodič nezapne. */
const OFF_BY_DEFAULT: readonly TopicId[] = ['money', 'clock']

export const TIER_LABELS: Record<Tier, string> = { easy: 'lehké', medium: 'střední', hard: 'těžké' }

export function practiceKey(topic: TopicId, tier: Tier): PracticeKey {
  return `${topic}:${tier}`
}

/** Výchozí nastavení: všechny obtížnosti zaškrtnuté, jen peníze a hodiny vypnuté. */
export function defaultTopics(): TopicSettings {
  return Object.fromEntries(TOPIC_IDS.map((topic) => [topic, OFF_BY_DEFAULT.includes(topic) ? [] : [...TIERS]])) as TopicSettings
}

export function sortTiers(tiers: readonly Tier[]): Tier[] {
  return TIERS.filter((tier) => tiers.includes(tier))
}

export function enabledTopics(settings: TopicSettings): TopicId[] {
  return TOPIC_IDS.filter((topic) => settings[topic].length > 0)
}

/** Mezery jsou povolené; poslední zaškrtnutou obtížnost v celé hře vypnout nejde. */
export function toggleTier(settings: TopicSettings, topic: TopicId, tier: Tier): TopicSettings {
  const current = settings[topic]
  if (current.includes(tier)) {
    const checkedTotal = TOPIC_IDS.reduce((sum, id) => sum + settings[id].length, 0)
    if (checkedTotal <= 1) return settings
    return { ...settings, [topic]: current.filter((t) => t !== tier) }
  }
  return { ...settings, [topic]: sortTiers([...current, tier]) }
}
