import type { Level, SaveData } from '../types'
import { rewardForCorrect } from './economy'
import type { Problem } from './mathGenerator'

/** Počet vyřešených příkladů v jednom kole — po kole přijde shrnutí a chvilka na oddech. */
export const ROUND_SIZE = 10

export function applyCorrectAnswer(save: SaveData, problem: Problem, nextLevel: Level): { save: SaveData; reward: number } {
  const reward = rewardForCorrect(problem.level)
  return {
    reward,
    save: {
      ...save,
      gold: save.gold + reward,
      level: nextLevel,
      stats: {
        totalCorrect: save.stats.totalCorrect + 1,
        multiplicationStreak:
          problem.type === 'multiplication' ? save.stats.multiplicationStreak + 1 : save.stats.multiplicationStreak,
      },
    },
  }
}

export function applyWrongAnswer(save: SaveData, problem: Problem, nextLevel: Level): SaveData {
  return {
    ...save,
    level: nextLevel,
    stats: {
      ...save.stats,
      multiplicationStreak: problem.type === 'multiplication' ? 0 : save.stats.multiplicationStreak,
    },
  }
}

export function addGold(save: SaveData, amount: number): SaveData {
  return { ...save, gold: save.gold + Math.max(0, Math.floor(amount)) }
}
