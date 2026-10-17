import { useCallback, useEffect, useRef, useState } from 'react'
import { addGold, applyCorrectAnswer, applyWrongAnswer } from '../lib/academy'
import { BADGES, awardBadges, type Badge } from '../lib/badges'
import { buyItem, rewardForCorrect, type BuyResult } from '../lib/economy'
import type { Problem } from '../lib/mathGenerator'
import { hashPin, resetProgress, updateSettings } from '../lib/parent'
import { loadSave, writeSave } from '../lib/storage'
import { toggleEquip } from '../lib/wardrobe'
import type { BadgeId, Level, SaveData, Settings } from '../types'

export function useGameState() {
  const [save, setSave] = useState<SaveData>(() => awardBadges(loadSave()).save)
  const [celebrations, setCelebrations] = useState<Badge[]>([])
  /** Mění se při resetu a importu, aby Akademie začala znovu s novým stavem. */
  const [generation, setGeneration] = useState(0)
  const knownBadges = useRef<readonly BadgeId[]>(save.badges)

  useEffect(() => {
    writeSave(save)
  }, [save])

  useEffect(() => {
    const fresh = save.badges.filter((id) => !knownBadges.current.includes(id))
    knownBadges.current = save.badges
    if (fresh.length > 0) {
      setCelebrations((queue) => [...queue, ...BADGES.filter((badge) => fresh.includes(badge.id))])
    }
  }, [save.badges])

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

  const answerCorrect = useCallback((problem: Problem, nextLevel: Level): number => {
    setSave((current) => awardBadges(applyCorrectAnswer(current, problem, nextLevel).save).save)
    return rewardForCorrect(problem.level)
  }, [])

  const answerWrong = useCallback(
    (problem: Problem, nextLevel: Level) => setSave((current) => applyWrongAnswer(current, problem, nextLevel)),
    [],
  )

  const receiveGold = useCallback((amount: number) => setSave((current) => addGold(current, amount)), [])

  const setSoundOn = useCallback(
    (soundOn: boolean) => setSave((current) => ({ ...current, settings: { ...current.settings, soundOn } })),
    [],
  )

  const setPin = useCallback((pin: string) => setSave((current) => ({ ...current, parentPinHash: hashPin(pin) })), [])

  const changeSettings = useCallback(
    (settings: Settings) => setSave((current) => updateSettings(current, settings)),
    [],
  )

  /** Nový stav bez oslav — odznaky z importu nebo po resetu se neoslavují. */
  const replaceSave = useCallback((next: SaveData) => {
    knownBadges.current = next.badges
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
    receiveGold,
    setSoundOn,
    setPin,
    changeSettings,
    replaceSave,
    reset,
  }
}
