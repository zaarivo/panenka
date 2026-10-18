import { describe, expect, test } from 'vitest'
import { addGold, applyCorrectAnswer, applyWrongAnswer } from '../lib/academy'
import type { Problem } from '../lib/mathGenerator'
import { createDefaultSave } from '../lib/storage'

const addition: Problem = { type: 'addSub', level: 1, prompt: '3 + 4 = ?', answer: 7, hint: '', key: 'a' }
const hardAddition: Problem = { ...addition, level: 3 }
const multiplication: Problem = { type: 'multiplication', level: 2, prompt: '3 × 4 = ?', answer: 12, hint: '', key: 'm' }

describe('správná odpověď', () => {
  test('přidá 10 zlaťáků, na těžším stupni 15', () => {
    const save = createDefaultSave()
    expect(applyCorrectAnswer(save, addition, 1)).toMatchObject({ reward: 10, save: { gold: 10 } })
    expect(applyCorrectAnswer(save, hardAddition, 3)).toMatchObject({ reward: 15, save: { gold: 15 } })
  })

  test('započítá správnou odpověď a uloží nový stupeň', () => {
    const { save } = applyCorrectAnswer(createDefaultSave(), addition, 2)
    expect(save.stats.totalCorrect).toBe(1)
    expect(save.level).toBe(2)
  })

  test('řadu násobilky prodlouží jen násobilka, jiné příklady ji nepřeruší', () => {
    let save = createDefaultSave()
    save = applyCorrectAnswer(save, multiplication, 1).save
    save = applyCorrectAnswer(save, addition, 1).save
    save = applyCorrectAnswer(save, multiplication, 1).save
    expect(save.stats.multiplicationStreak).toBe(2)
  })
})

describe('chybná odpověď', () => {
  test('nic nestojí', () => {
    const save = { ...createDefaultSave(), gold: 30 }
    expect(applyWrongAnswer(save, addition, 1).gold).toBe(30)
  })

  test('chyba v násobilce řadu násobilky vynuluje, jiná chyba ne', () => {
    const save = { ...createDefaultSave(), stats: { totalCorrect: 5, multiplicationStreak: 4 } }
    expect(applyWrongAnswer(save, multiplication, 1).stats).toEqual({ totalCorrect: 5, multiplicationStreak: 0 })
    expect(applyWrongAnswer(save, addition, 1).stats).toEqual({ totalCorrect: 5, multiplicationStreak: 4 })
  })

  test('uloží snížený stupeň', () => {
    expect(applyWrongAnswer({ ...createDefaultSave(), level: 3 }, addition, 2).level).toBe(2)
  })
})

test('truhla přidá zlaťáky, záporné ani desetinné ne', () => {
  const save = createDefaultSave()
  expect(addGold(save, 27).gold).toBe(27)
  expect(addGold(save, -5).gold).toBe(0)
  expect(addGold(save, 20.9).gold).toBe(20)
})
