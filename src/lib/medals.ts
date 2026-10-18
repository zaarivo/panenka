import { MEDAL_TIERS, TOPIC_IDS, type MedalId, type MedalTier, type SaveData, type TopicId } from '../types'

/** Kolik správných příkladů v kategorii je potřeba na medaili. */
export const MEDAL_TARGETS: Record<MedalTier, number> = { bronze: 10, silver: 100, gold: 200 }

export const MEDAL_NAMES: Record<MedalTier, string> = {
  bronze: 'Bronzová medaile',
  silver: 'Stříbrná medaile',
  gold: 'Zlatá medaile',
}

export const MEDAL_COLORS: Record<MedalTier, string> = { bronze: '#d97706', silver: '#cbd5e1', gold: '#facc15' }

export interface Medal {
  id: MedalId
  topic: TopicId
  tier: MedalTier
  target: number
}

export const MEDALS: readonly Medal[] = TOPIC_IDS.flatMap((topic) =>
  MEDAL_TIERS.map((tier) => ({ id: `${topic}:${tier}` as const, topic, tier, target: MEDAL_TARGETS[tier] })),
)

/** Přidá nově splněné medaile. Získané medaile už nezmizí. */
export function awardMedals(save: SaveData): { save: SaveData; newMedals: Medal[] } {
  const newMedals = MEDALS.filter(
    (medal) => !save.medals.includes(medal.id) && save.stats.correctByTopic[medal.topic] >= medal.target,
  )
  if (newMedals.length === 0) return { save, newMedals }
  const earned = new Set([...save.medals, ...newMedals.map((medal) => medal.id)])
  return { save: { ...save, medals: MEDALS.filter((medal) => earned.has(medal.id)).map((medal) => medal.id) }, newMedals }
}

/** Nejbližší nezískaná medaile kategorie a aktuální počet, nebo null, když má dítě všechny tři. */
export function nextMedal(save: SaveData, topic: TopicId): { medal: Medal; count: number } | null {
  const medal = MEDALS.find((m) => m.topic === topic && !save.medals.includes(m.id))
  return medal ? { medal, count: save.stats.correctByTopic[topic] } : null
}
