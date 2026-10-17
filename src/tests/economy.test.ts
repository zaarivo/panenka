import { describe, expect, test } from 'vitest'
import { buyItem } from '../lib/economy'
import { createDefaultSave } from '../lib/storage'

describe('nákup v obchodě', () => {
  test('koupí kousek, odečte cenu a přidá ho mezi vlastněné', () => {
    const save = { ...createDefaultSave(), gold: 70 }
    const result = buyItem(save, 'dress-pink')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.save.gold).toBe(20)
    expect(result.save.owned).toContain('dress-pink')
    expect(save.gold).toBe(70)
    expect(save.owned).not.toContain('dress-pink')
  })

  test('přesně tolik zlaťáků, kolik stojí, stačí', () => {
    const result = buyItem({ ...createDefaultSave(), gold: 50 }, 'dress-pink')
    expect(result.ok && result.save.gold).toBe(0)
  })

  test('nekoupí bez dostatku zlaťáků', () => {
    expect(buyItem({ ...createDefaultSave(), gold: 49 }, 'dress-pink')).toEqual({
      ok: false,
      reason: 'not-enough-gold',
    })
  })

  test('nekoupí podruhé to, co už má', () => {
    const save = { ...createDefaultSave(), gold: 500 }
    expect(buyItem(save, 'hair-ponytail-brown')).toEqual({ ok: false, reason: 'already-owned' })
  })

  test('korunku koupit nejde', () => {
    expect(buyItem({ ...createDefaultSave(), gold: 500 }, 'acc-crown')).toEqual({
      ok: false,
      reason: 'not-for-sale',
    })
  })

  test('neznámý kousek odmítne', () => {
    expect(buyItem({ ...createDefaultSave(), gold: 500 }, 'nic')).toEqual({ ok: false, reason: 'unknown-item' })
  })
})
