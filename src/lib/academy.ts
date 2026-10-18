import type { SaveData, Tier } from '../types'
import { rewardForCorrect } from './economy'
import type { Problem } from './mathGenerator'
import { recordResult } from './practice'
import { practiceKey } from './topics'

/** Počet vyřešených příkladů v jednom kole — po kole přijde shrnutí a chvilka na oddech. */
export const ROUND_SIZE = 10

const withTier = (save: SaveData, problem: Problem, nextTier: Tier) => ({ ...save.currentTier, [problem.topic]: nextTier })

/** `success` = správně napoprvé a v limitu (jen pro statistiku rodiče, na zlaťáky nemá vliv). */
export function applyCorrectAnswer(
  save: SaveData,
  problem: Problem,
  nextTier: Tier,
  success: boolean,
): { save: SaveData; reward: number } {
  const reward = rewardForCorrect(problem.tier)
  return {
    reward,
    save: {
      ...save,
      gold: save.gold + reward,
      currentTier: withTier(save, problem, nextTier),
      practice: recordResult(save.practice, practiceKey(problem.topic, problem.tier), success),
      stats: {
        ...save.stats,
        totalCorrect: save.stats.totalCorrect + 1,
        multiplicationStreak:
          problem.topic === 'multiplication' ? save.stats.multiplicationStreak + 1 : save.stats.multiplicationStreak,
      },
    },
  }
}

export function applyWrongAnswer(save: SaveData, problem: Problem, nextTier: Tier): SaveData {
  return {
    ...save,
    currentTier: withTier(save, problem, nextTier),
    stats: {
      ...save.stats,
      multiplicationStreak: problem.topic === 'multiplication' ? 0 : save.stats.multiplicationStreak,
    },
  }
}

/** Přeskočení: jako chyba (bez zlaťáků, přeruší řadu násobilky) a zapíše se jako neúspěch. */
export function applySkippedProblem(save: SaveData, problem: Problem, nextTier: Tier): SaveData {
  const after = applyWrongAnswer(save, problem, nextTier)
  return { ...after, practice: recordResult(after.practice, practiceKey(problem.topic, problem.tier), false) }
}

export function addGold(save: SaveData, amount: number): SaveData {
  return { ...save, gold: save.gold + Math.max(0, Math.floor(amount)) }
}
