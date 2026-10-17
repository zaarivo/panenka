import { describe, expect, test } from 'vitest'
import { awardBadges } from '../lib/badges'
import { createDefaultSave } from '../lib/storage'

const withStats = (totalCorrect: number, multiplicationStreak = 0) => ({
  ...createDefaultSave(),
  stats: { totalCorrect, multiplicationStreak },
})

describe('odznaky', () => {
  test('„První krok“ až po 10 správných odpovědích', () => {
    expect(awardBadges(withStats(9)).newBadges).toEqual([])
    const { save, newBadges } = awardBadges(withStats(10))
    expect(newBadges.map((b) => b.id)).toEqual(['first-step'])
    expect(save.badges).toEqual(['first-step'])
  })

  test('„Pilná školačka“ po 100 správných odpovědích', () => {
    const { save } = awardBadges(withStats(100))
    expect(save.badges).toEqual(['first-step', 'diligent-pupil'])
  })

  test('„Násobilková hvězda“ po 10 násobilkách v řadě odemkne korunku', () => {
    const { save, newBadges } = awardBadges(withStats(10, 10))
    expect(newBadges.map((b) => b.id)).toContain('times-table-star')
    expect(save.owned).toContain('acc-crown')
  })

  test('9 násobilek v řadě korunku neodemkne', () => {
    expect(awardBadges(withStats(20, 9)).save.owned).not.toContain('acc-crown')
  })

  test('odznak se nepřidá dvakrát a bez novinek vrátí stejný stav', () => {
    const once = awardBadges(withStats(10, 10)).save
    const twice = awardBadges(once)
    expect(twice.newBadges).toEqual([])
    expect(twice.save).toBe(once)
  })

  test('získaný odznak zůstane, i když řada násobilky později spadne', () => {
    const earned = awardBadges(withStats(10, 10)).save
    const afterMistake = { ...earned, stats: { ...earned.stats, multiplicationStreak: 0 } }
    expect(awardBadges(afterMistake).save.badges).toContain('times-table-star')
  })

  test('chybějící korunku k už získanému odznaku doplní (např. po importu)', () => {
    const save = { ...createDefaultSave(), badges: ['times-table-star' as const] }
    const result = awardBadges(save)
    expect(result.newBadges).toEqual([])
    expect(result.save.owned).toContain('acc-crown')
  })
})
