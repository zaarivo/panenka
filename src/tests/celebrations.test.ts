import { describe, expect, test } from 'vitest'
import { celebrationKey, newCelebrations } from '../lib/celebrations'
import { createDefaultSave } from '../lib/storage'

const save = { ...createDefaultSave(), medals: ['multiplication:bronze' as const], badges: ['diligent-pupil' as const] }

describe('fronta oslav', () => {
  test('medaile před odznakem', () => {
    const queue = newCelebrations({ badges: [], medals: [] }, save)
    expect(queue.map((c) => c.kind)).toEqual(['medal', 'badge'])
    expect(queue[0].kind === 'medal' && queue[0].medal.id).toBe('multiplication:bronze')
    expect(queue[1].kind === 'badge' && queue[1].badge.id).toBe('diligent-pupil')
  })

  test('už známé se neoslavují', () => {
    expect(newCelebrations({ badges: ['diligent-pupil'], medals: ['multiplication:bronze'] }, save)).toEqual([])
  })

  test('klíče jsou jedinečné', () => {
    const all = newCelebrations(
      { badges: [], medals: [] },
      { ...save, medals: ['add20:bronze', 'add20:silver'], badges: ['first-step', 'diligent-pupil'] },
    )
    expect(new Set(all.map(celebrationKey)).size).toBe(4)
  })
})
