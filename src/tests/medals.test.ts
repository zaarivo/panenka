import { describe, expect, test } from 'vitest'
import { MEDALS, awardMedals, nextMedal } from '../lib/medals'
import { createDefaultSave } from '../lib/storage'
import type { MedalId, TopicId } from '../types'

const withCount = (topic: TopicId, count: number, medals: MedalId[] = []) => {
  const base = createDefaultSave()
  return { ...base, medals, stats: { ...base.stats, correctByTopic: { ...base.stats.correctByTopic, [topic]: count } } }
}

describe('medaile', () => {
  test('18 medailí v pořadí kategorií', () => {
    expect(MEDALS).toHaveLength(18)
    expect(MEDALS.slice(0, 4).map((m) => m.id)).toEqual(['add20:bronze', 'add20:silver', 'add20:gold', 'add100:bronze'])
    expect(MEDALS.slice(0, 3).map((m) => m.target)).toEqual([10, 100, 200])
  })

  test('bronzová přijde při 10. správném', () => {
    expect(awardMedals(withCount('add20', 9)).newMedals).toEqual([])
    const { save, newMedals } = awardMedals(withCount('add20', 10))
    expect(newMedals.map((m) => m.id)).toEqual(['add20:bronze'])
    expect(save.medals).toEqual(['add20:bronze'])
  })

  test('víc medailí najednou, nižší první', () => {
    expect(awardMedals(withCount('add20', 200)).newMedals.map((m) => m.tier)).toEqual(['bronze', 'silver', 'gold'])
  })

  test('získaná medaile nezmizí', () => {
    const { save, newMedals } = awardMedals(withCount('add20', 0, ['add20:gold']))
    expect(save.medals).toEqual(['add20:gold'])
    expect(newMedals).toEqual([])
  })

  test('bez změny vrací stejný objekt', () => {
    const save = withCount('add20', 5)
    expect(awardMedals(save).save).toBe(save)
  })

  test('nextMedal ukáže nejbližší nezískanou medaili', () => {
    expect(nextMedal(withCount('add20', 42, ['add20:bronze']), 'add20')).toEqual({
      medal: MEDALS.find((m) => m.id === 'add20:silver'),
      count: 42,
    })
    expect(nextMedal(withCount('add20', 250, ['add20:bronze', 'add20:silver', 'add20:gold']), 'add20')).toBeNull()
  })
})
