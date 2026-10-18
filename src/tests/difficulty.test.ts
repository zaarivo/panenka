import { describe, expect, test } from 'vitest'
import { skipProblem, updateDifficulty, type DifficultyState } from '../lib/difficulty'
import type { Level } from '../types'

const FULL = { minLevel: 1, maxLevel: 4 } as const

function run(start: Level, answers: boolean[], limits: { minLevel: Level; maxLevel: Level } = FULL) {
  let state: DifficultyState = { level: start, correctStreak: 0, mistakeStreak: 0 }
  const updates = answers.map((correct) => {
    const update = updateDifficulty(state, correct, limits)
    state = update.state
    return update
  })
  return { state, updates }
}

describe('adaptivní obtížnost', () => {
  test('po 5 správných v řadě o stupeň těžší', () => {
    const { state, updates } = run(1, [true, true, true, true, true])
    expect(state.level).toBe(2)
    expect(updates.map((u) => u.levelChange)).toEqual([0, 0, 0, 0, 1])
    expect(updates[4].streakCompleted).toBe(true)
  })

  test('4 správné nestačí', () => {
    expect(run(1, [true, true, true, true]).state.level).toBe(1)
  })

  test('chyba přeruší řadu správných', () => {
    const { state } = run(1, [true, true, true, true, false, true, true, true, true])
    expect(state.level).toBe(1)
    expect(state.correctStreak).toBe(4)
  })

  test('po 2 chybách v řadě o stupeň lehčí', () => {
    const { state, updates } = run(3, [false, false])
    expect(state.level).toBe(2)
    expect(updates.map((u) => u.levelChange)).toEqual([0, -1])
  })

  test('správná odpověď mezi chybami řadu chyb přeruší', () => {
    expect(run(3, [false, true, false]).state.level).toBe(3)
  })

  test('nepřekročí maximum od rodiče, truhla se ale objeví', () => {
    const { state, updates } = run(2, Array(5).fill(true), { minLevel: 1, maxLevel: 2 })
    expect(state.level).toBe(2)
    expect(updates[4].levelChange).toBe(0)
    expect(updates[4].streakCompleted).toBe(true)
  })

  test('neklesne pod minimum od rodiče', () => {
    const { state, updates } = run(2, [false, false], { minLevel: 2, maxLevel: 4 })
    expect(state.level).toBe(2)
    expect(updates[1].levelChange).toBe(0)
  })

  test('truhla po každých dalších 5 správných', () => {
    const { updates } = run(1, Array(10).fill(true))
    expect(updates.filter((u) => u.streakCompleted)).toHaveLength(2)
    expect(updates[9].state.level).toBe(3)
  })

  test('úroveň mimo nové meze od rodiče se nejdřív srovná', () => {
    const update = updateDifficulty({ level: 4, correctStreak: 0, mistakeStreak: 0 }, true, { minLevel: 1, maxLevel: 2 })
    expect(update.state.level).toBe(2)
  })
})

describe('přeskočení příkladu', () => {
  test('sníží stupeň o jeden a vynuluje obě řady', () => {
    const update = skipProblem({ level: 3, correctStreak: 4, mistakeStreak: 1 }, FULL)
    expect(update.state).toEqual({ level: 2, correctStreak: 0, mistakeStreak: 0 })
    expect(update.levelChange).toBe(-1)
    expect(update.streakCompleted).toBe(false)
  })

  test('na minimu od rodiče stupeň neklesne', () => {
    const update = skipProblem({ level: 2, correctStreak: 2, mistakeStreak: 0 }, { minLevel: 2, maxLevel: 4 })
    expect(update.state.level).toBe(2)
    expect(update.levelChange).toBe(0)
  })
})
