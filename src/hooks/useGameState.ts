import { useCallback, useEffect, useRef, useState } from 'react'
import { addGold, applyCorrectAnswer, applySkippedProblem, applyWrongAnswer } from '../lib/academy'
import { awardBadges } from '../lib/badges'
import { newCelebrations, type Celebration, type Known } from '../lib/celebrations'
import { buyItem, rewardForCorrect, type BuyResult } from '../lib/economy'
import type { Problem } from '../lib/mathGenerator'
import { acceptRecommendation, hashPin, resetProgress, snoozeRecommendation, updateTopics } from '../lib/parent'
import type { Recommendation } from '../lib/practice'
import { awardMedals } from '../lib/medals'
import { loadSave, writeSave } from '../lib/storage'
import { toggleEquip } from '../lib/wardrobe'
import type { SaveData, Tier, TopicSettings } from '../types'

/** Doplní medaile a odznaky (a odměny za ně) podle statistik. */
const award = (save: SaveData) => awardBadges(awardMedals(save).save).save

export function useGameState() {
  const [save, setSave] = useState<SaveData>(() => award(loadSave()))
  const [celebrations, setCelebrations] = useState<Celebration[]>([])
  /** Mění se při resetu a importu, aby Akademie začala znovu s novým stavem. */
  const [generation, setGeneration] = useState(0)
  const known = useRef<Known>({ badges: save.badges, medals: save.medals })

  useEffect(() => {
    writeSave(save)
  }, [save])

  useEffect(() => {
    const fresh = newCelebrations(known.current, save)
    known.current = { badges: save.badges, medals: save.medals }
    if (fresh.length > 0) setCelebrations((queue) => [...queue, ...fresh])
  }, [save])

  const dismissCelebration = useCallback(() => setCelebrations((queue) => queue.slice(1)), [])

  const toggleItem = useCallback((itemId: string) => setSave((current) => toggleEquip(current, itemId)), [])

  const buy = useCallback(
    (itemId: string): BuyResult => {
      const result = buyItem(save, itemId)
      if (result.ok) setSave(result.save)
      return result
    },
    [save],
  )

  const answerCorrect = useCallback((problem: Problem, nextTier: Tier, success: boolean): number => {
    setSave((current) => award(applyCorrectAnswer(current, problem, nextTier, success).save))
    return rewardForCorrect(problem.tier)
  }, [])

  const answerWrong = useCallback(
    (problem: Problem, nextTier: Tier) => setSave((current) => applyWrongAnswer(current, problem, nextTier)),
    [],
  )

  const skipProblem = useCallback(
    (problem: Problem, nextTier: Tier) => setSave((current) => applySkippedProblem(current, problem, nextTier)),
    [],
  )

  const receiveGold = useCallback((amount: number) => setSave((current) => addGold(current, amount)), [])

  const setSoundOn = useCallback(
    (soundOn: boolean) => setSave((current) => ({ ...current, settings: { ...current.settings, soundOn } })),
    [],
  )

  const setPin = useCallback((pin: string) => setSave((current) => ({ ...current, parentPinHash: hashPin(pin) })), [])

  const changeTopics = useCallback((topics: TopicSettings) => setSave((current) => updateTopics(current, topics)), [])

  const acceptAdvice = useCallback(
    (recommendation: Recommendation) => setSave((current) => acceptRecommendation(current, recommendation)),
    [],
  )

  const snoozeAdvice = useCallback(
    (recommendation: Recommendation) => setSave((current) => snoozeRecommendation(current, recommendation)),
    [],
  )

  /** Nový stav bez oslav — odznaky z importu nebo po resetu se neoslavují. */
  const replaceSave = useCallback((next: SaveData) => {
    known.current = { badges: next.badges, medals: next.medals }
    setCelebrations([])
    setSave(next)
    setGeneration((value) => value + 1)
  }, [])

  const reset = useCallback(() => replaceSave(resetProgress(save)), [replaceSave, save])

  return {
    save,
    generation,
    celebrations,
    dismissCelebration,
    toggleItem,
    buy,
    answerCorrect,
    answerWrong,
    skipProblem,
    receiveGold,
    setSoundOn,
    setPin,
    changeTopics,
    acceptAdvice,
    snoozeAdvice,
    replaceSave,
    reset,
  }
}
