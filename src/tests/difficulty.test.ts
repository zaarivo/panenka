import { describe, expect, test } from 'vitest'
import {
  clampTier,
  skipTopicProgress,
  stepTier,
  updateChestStreak,
  updateTopicProgress,
  type TopicProgress,
} from '../lib/difficulty'
import type { Tier } from '../types'

const ALL: Tier[] = ['easy', 'medium', 'hard']
const fresh = (tier: Tier): TopicProgress => ({ tier, correctStreak: 0, mistakeStreak: 0 })

function run(start: Tier, answers: boolean[], allowed: Tier[] = ALL) {
  let progress = fresh(start)
  const changes = answers.map((correct) => {
    const update = updateTopicProgress(progress, correct, allowed)
    progress = update.progress
    return update.tierChange
  })
  return { progress, changes }
}

describe('posun obtížnosti v kategorii', () => {
  test('po 5 správných v řadě o obtížnost výš', () => {
    const { progress, changes } = run('easy', Array(5).fill(true))
    expect(progress).toEqual(fresh('medium'))
    expect(changes).toEqual([0, 0, 0, 0, 1])
  })

  test('po 2 chybách v řadě o obtížnost níž', () => {
    const { progress, changes } = run('hard', [false, false])
    expect(progress.tier).toBe('medium')
    expect(changes).toEqual([0, -1])
  })

  test('chyba přeruší řadu správných, správná odpověď řadu chyb', () => {
    expect(run('easy', [true, true, true, true, false, true]).progress).toEqual({
      tier: 'easy',
      correctStreak: 1,
      mistakeStreak: 0,
    })
    expect(run('medium', [false, true, false]).progress.tier).toBe('medium')
  })

  test('jen mezi zaškrtnutými obtížnostmi — mezera se přeskočí', () => {
    expect(run('easy', Array(5).fill(true), ['easy', 'hard']).progress.tier).toBe('hard')
    expect(run('hard', [false, false], ['easy', 'hard']).progress.tier).toBe('easy')
  })

  test('na kraji zůstane', () => {
    const top = run('hard', Array(5).fill(true))
    expect(top.progress.tier).toBe('hard')
    expect(top.changes[4]).toBe(0)
    expect(run('easy', [false, false]).progress.tier).toBe('easy')
  })

  test('obtížnost mimo zaškrtnuté se nejdřív srovná', () => {
    expect(updateTopicProgress(fresh('hard'), true, ['easy', 'medium']).progress.tier).toBe('medium')
  })

  test('přeskočení hned o obtížnost níž a vynuluje řady', () => {
    const update = skipTopicProgress({ tier: 'hard', correctStreak: 3, mistakeStreak: 1 }, ALL)
    expect(update).toEqual({ progress: fresh('medium'), tierChange: -1 })
    expect(skipTopicProgress(fresh('easy'), ALL).tierChange).toBe(0)
  })
})

describe('pomocné funkce obtížností', () => {
  test('stepTier hledá nejbližší zaškrtnutou v daném směru', () => {
    expect(stepTier('easy', ['easy', 'hard'], 1)).toBe('hard')
    expect(stepTier('hard', ['easy', 'hard'], -1)).toBe('easy')
    expect(stepTier('medium', ['medium'], 1)).toBe('medium')
  })

  test('clampTier vrátí nejbližší zaškrtnutou, při shodě lehčí', () => {
    expect(clampTier('medium', ['easy', 'hard'])).toBe('easy')
    expect(clampTier('hard', ['easy'])).toBe('easy')
    expect(clampTier('easy', ['medium', 'hard'])).toBe('medium')
    expect(clampTier('hard', ['hard'])).toBe('hard')
  })
})

describe('truhla', () => {
  test('po každých 5 správných v řadě, chyba řadu vynuluje', () => {
    let streak = 0
    const chests: boolean[] = []
    for (const correct of [true, true, true, true, true, true, false, true, true, true, true, true]) {
      const update = updateChestStreak(streak, correct)
      streak = update.streak
      chests.push(update.chest)
    }
    expect(chests.filter(Boolean)).toHaveLength(2)
    expect(chests[4]).toBe(true)
    expect(chests[11]).toBe(true)
  })
})
