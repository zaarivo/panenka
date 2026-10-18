import { describe, expect, test } from 'vitest'
import { addGold, applyCorrectAnswer, applySkippedProblem, applyWrongAnswer } from '../lib/academy'
import type { Problem } from '../lib/mathGenerator'
import { createDefaultSave } from '../lib/storage'

const addition: Problem = { kind: 'number', topic: 'add20', tier: 'easy', prompt: '3 + 4 = ?', answer: 7, hint: '', key: 'a' }
const hardAddition: Problem = { ...addition, tier: 'hard' }
const multiplication: Problem = {
  kind: 'number',
  topic: 'multiplication',
  tier: 'medium',
  prompt: '3 × 4 = ?',
  answer: 12,
  hint: '',
  key: 'm',
}

describe('správná odpověď', () => {
  test('přidá 5 zlaťáků, na těžké obtížnosti 8', () => {
    const save = createDefaultSave()
    expect(applyCorrectAnswer(save, addition, 'easy', true)).toMatchObject({ reward: 5, save: { gold: 5 } })
    expect(applyCorrectAnswer(save, hardAddition, 'hard', true)).toMatchObject({ reward: 8, save: { gold: 8 } })
  })

  test('započítá odpověď, uloží novou obtížnost kategorie a úspěšnost', () => {
    const { save } = applyCorrectAnswer(createDefaultSave(), addition, 'medium', false)
    expect(save.stats.totalCorrect).toBe(1)
    expect(save.currentTier.add20).toBe('medium')
    expect(save.currentTier.add100).toBe('easy')
    expect(save.practice['add20:easy']).toEqual({ recent: [false], total: 1, snoozedAtTotal: null })
  })

  test('řadu násobilky prodlouží jen násobilka, jiné příklady ji nepřeruší', () => {
    let save = createDefaultSave()
    save = applyCorrectAnswer(save, multiplication, 'medium', true).save
    save = applyCorrectAnswer(save, addition, 'easy', true).save
    save = applyCorrectAnswer(save, multiplication, 'medium', true).save
    expect(save.stats.multiplicationStreak).toBe(2)
  })
})

describe('chybná odpověď', () => {
  test('nic nestojí a úspěšnost zatím nezapisuje', () => {
    const save = { ...createDefaultSave(), gold: 30 }
    const after = applyWrongAnswer(save, addition, 'easy')
    expect(after.gold).toBe(30)
    expect(after.practice).toEqual({})
  })

  test('chyba v násobilce řadu násobilky vynuluje, jiná chyba ne', () => {
    const save = { ...createDefaultSave(), stats: { ...createDefaultSave().stats, totalCorrect: 5, multiplicationStreak: 4 } }
    expect(applyWrongAnswer(save, multiplication, 'medium').stats).toEqual({ ...save.stats, multiplicationStreak: 0 })
    expect(applyWrongAnswer(save, addition, 'easy').stats).toEqual({ ...save.stats, multiplicationStreak: 4 })
  })

  test('uloží sníženou obtížnost kategorie', () => {
    const save = { ...createDefaultSave(), currentTier: { ...createDefaultSave().currentTier, add20: 'hard' as const } }
    expect(applyWrongAnswer(save, hardAddition, 'medium').currentTier.add20).toBe('medium')
  })
})

describe('přeskočený příklad', () => {
  test('nedá zlaťáky, nezapočítá se jako správný a zapíše neúspěch', () => {
    const save = { ...createDefaultSave(), gold: 30, stats: { ...createDefaultSave().stats, totalCorrect: 5, multiplicationStreak: 0 } }
    const after = applySkippedProblem(save, addition, 'easy')
    expect(after.gold).toBe(30)
    expect(after.stats.totalCorrect).toBe(5)
    expect(after.practice['add20:easy']?.recent).toEqual([false])
  })

  test('přeskočená násobilka přeruší řadu k Násobilkové hvězdě, jiný příklad ne', () => {
    const save = { ...createDefaultSave(), stats: { ...createDefaultSave().stats, totalCorrect: 5, multiplicationStreak: 4 } }
    expect(applySkippedProblem(save, multiplication, 'easy').stats.multiplicationStreak).toBe(0)
    expect(applySkippedProblem(save, addition, 'easy').stats.multiplicationStreak).toBe(4)
  })
})

test('truhla přidá zlaťáky, záporné ani desetinné ne', () => {
  const save = createDefaultSave()
  expect(addGold(save, 27).gold).toBe(27)
  expect(addGold(save, -5).gold).toBe(0)
  expect(addGold(save, 20.9).gold).toBe(20)
})
