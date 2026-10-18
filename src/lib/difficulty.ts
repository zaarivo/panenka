import type { Level, Settings } from '../types'

export const CORRECT_IN_ROW_TO_LEVEL_UP = 5
export const MISTAKES_IN_ROW_TO_LEVEL_DOWN = 2

export interface DifficultyState {
  level: Level
  correctStreak: number
  mistakeStreak: number
}

export interface DifficultyUpdate {
  state: DifficultyState
  levelChange: -1 | 0 | 1
  /** Právě padlo 5 správných v řadě — čas na bonusovou truhlu. */
  streakCompleted: boolean
}

type LevelLimits = Pick<Settings, 'minLevel' | 'maxLevel'>

export function clampLevel(level: number, { minLevel, maxLevel }: LevelLimits): Level {
  return Math.min(Math.max(level, minLevel), maxLevel) as Level
}

/** „Je to moc těžké“: hned o stupeň lehčí a obě řady od nuly. */
export function skipProblem(state: DifficultyState, limits: LevelLimits): DifficultyUpdate {
  const level = clampLevel(state.level, limits)
  const next = clampLevel(level - 1, limits)
  return {
    state: { level: next, correctStreak: 0, mistakeStreak: 0 },
    levelChange: (next - level) as -1 | 0,
    streakCompleted: false,
  }
}

/** Každý pokus (i opakovaný u téhož příkladu) se počítá jako jedna odpověď. */
export function updateDifficulty(state: DifficultyState, correct: boolean, limits: LevelLimits): DifficultyUpdate {
  const level = clampLevel(state.level, limits)

  if (correct) {
    const correctStreak = state.correctStreak + 1
    if (correctStreak < CORRECT_IN_ROW_TO_LEVEL_UP) {
      return { state: { level, correctStreak, mistakeStreak: 0 }, levelChange: 0, streakCompleted: false }
    }
    const next = clampLevel(level + 1, limits)
    return {
      state: { level: next, correctStreak: 0, mistakeStreak: 0 },
      levelChange: (next - level) as 0 | 1,
      streakCompleted: true,
    }
  }

  const mistakeStreak = state.mistakeStreak + 1
  if (mistakeStreak < MISTAKES_IN_ROW_TO_LEVEL_DOWN) {
    return { state: { level, correctStreak: 0, mistakeStreak }, levelChange: 0, streakCompleted: false }
  }
  const next = clampLevel(level - 1, limits)
  return {
    state: { level: next, correctStreak: 0, mistakeStreak: 0 },
    levelChange: (next - level) as -1 | 0,
    streakCompleted: false,
  }
}
