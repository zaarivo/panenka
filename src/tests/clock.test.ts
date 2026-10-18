import { describe, expect, test } from 'vitest'
import { buildClockTask, formatTimeDigits, timeAnswer, timeInWords } from '../lib/clock'
import { seededRng } from './seededRng'

const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1)
const pad = (minutes: number) => String(minutes).padStart(2, '0')

describe('hodiny', () => {
  test('čas slovy', () => {
    expect(timeInWords(5, 30)).toBe('půl 6')
    expect(timeInWords(2, 15)).toBe('čtvrt na 3')
    expect(timeInWords(4, 45)).toBe('třičtvrtě na 5')
    expect(timeInWords(1, 0)).toBe('1 hodina')
    expect(timeInWords(3, 0)).toBe('3 hodiny')
    expect(timeInWords(5, 0)).toBe('5 hodin')
    expect(timeInWords(12, 0)).toBe('12 hodin')
  })

  test('přechod přes 12', () => {
    expect(timeInWords(12, 30)).toBe('půl 1')
    expect(timeInWords(12, 15)).toBe('čtvrt na 1')
    expect(timeInWords(12, 45)).toBe('třičtvrtě na 1')
  })

  test('odpověď jako číslo', () => {
    expect(timeAnswer(4, 45)).toBe(445)
    expect(timeAnswer(12, 30)).toBe(1230)
    expect(timeAnswer(1, 5)).toBe(105)
  })

  test('zobrazení číslic', () => {
    expect(formatTimeDigits('')).toBe('')
    expect(formatTimeDigits('4')).toBe('4')
    expect(formatTimeDigits('44')).toBe('44')
    expect(formatTimeDigits('445')).toBe('4:45')
    expect(formatTimeDigits('1230')).toBe('12:30')
  })

  test('lehké: celé hodiny a půl, slovy i na ciferníku', () => {
    const tasks = SEEDS.map((seed) => buildClockTask('easy', seededRng(seed)))
    for (const task of tasks) expect([0, 30]).toContain(task.minutes)
    expect(new Set(tasks.map((t) => t.mode))).toEqual(new Set(['words', 'face']))
  })

  test('střední: navíc čtvrt a třičtvrtě, slovy i na ciferníku', () => {
    const tasks = SEEDS.map((seed) => buildClockTask('medium', seededRng(seed)))
    for (const task of tasks) expect([0, 15, 30, 45]).toContain(task.minutes)
    expect(new Set(tasks.map((t) => t.minutes))).toEqual(new Set([0, 15, 30, 45]))
    expect(new Set(tasks.map((t) => t.mode))).toEqual(new Set(['words', 'face']))
  })

  test('těžké: jen ciferník po 5 minutách', () => {
    for (const seed of SEEDS) {
      const task = buildClockTask('hard', seededRng(seed))
      expect(task.mode).toBe('face')
      expect(task.minutes % 5).toBe(0)
      expect(task.minutes).toBeLessThanOrEqual(55)
    }
  })

  test('hodiny jsou vždy 1–12 a slova odpovídají času', () => {
    for (const tier of ['easy', 'medium', 'hard'] as const) {
      for (const seed of SEEDS) {
        const task = buildClockTask(tier, seededRng(seed))
        expect(task.hours).toBeGreaterThanOrEqual(1)
        expect(task.hours).toBeLessThanOrEqual(12)
        if (task.mode === 'words') expect(task.words).toBe(timeInWords(task.hours, task.minutes as 0 | 15 | 30 | 45))
        else expect(task.words).toBeNull()
      }
    }
  })

  test('nápověda neprozradí čas', () => {
    for (const tier of ['easy', 'medium', 'hard'] as const) {
      for (const seed of SEEDS) {
        const task = buildClockTask(tier, seededRng(seed))
        expect(task.hint).not.toContain(`${task.hours}:${pad(task.minutes)}`)
      }
    }
  })
})
