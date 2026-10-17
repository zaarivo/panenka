import { describe, expect, test } from 'vitest'
import { CORRUPT_BACKUP_KEY, SAVE_KEY, createDefaultSave, loadSave, parseSave, writeSave } from '../lib/storage'

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial))
  return {
    get length() {
      return map.size
    },
    key: (index) => [...map.keys()][index] ?? null,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
  }
}

function throwingStorage(): Storage {
  const fail = () => {
    throw new Error('úložiště zakázáno')
  }
  return { length: 0, key: fail, getItem: fail, setItem: fail, removeItem: fail, clear: fail }
}

describe('výchozí stav', () => {
  test('vlastní a má na sobě jeden kousek z každé kategorie', () => {
    const save = createDefaultSave()
    expect(save.owned).toHaveLength(4)
    expect(Object.values(save.equipped).sort()).toEqual([...save.owned].sort())
    expect(save.gold).toBe(0)
    expect(save.parentPinHash).toBeNull()
  })

  test('projde vlastní validací beze změny', () => {
    const save = createDefaultSave()
    expect(parseSave(save)).toEqual(save)
  })
})

describe('ukládání a načítání', () => {
  test('uložený stav se načte zpět', () => {
    const storage = memoryStorage()
    const save = { ...createDefaultSave(), gold: 123 }
    expect(writeSave(save, storage)).toBe(true)
    expect(loadSave(storage)).toEqual(save)
  })

  test('prázdné úložiště dá výchozí stav', () => {
    expect(loadSave(memoryStorage())).toEqual(createDefaultSave())
  })

  test('bez úložiště hra nespadne', () => {
    expect(loadSave(undefined)).toEqual(createDefaultSave())
    expect(writeSave(createDefaultSave(), undefined)).toBe(false)
  })

  test('úložiště, které hází výjimky, hru neshodí', () => {
    const storage = throwingStorage()
    expect(loadSave(storage)).toEqual(createDefaultSave())
    expect(writeSave(createDefaultSave(), storage)).toBe(false)
  })

  test.each([
    ['nevalidní JSON', '{nedokončené'],
    ['null', 'null'],
    ['pole', '[]'],
    ['jiná verze', JSON.stringify({ ...createDefaultSave(), saveVersion: 99 })],
    ['záporné zlaťáky', JSON.stringify({ ...createDefaultSave(), gold: -5 })],
    ['zlaťáky jako text', JSON.stringify({ ...createDefaultSave(), gold: '50' })],
  ])('poškozená data (%s) dají výchozí stav a schovají se', (_, text) => {
    const storage = memoryStorage({ [SAVE_KEY]: text })
    expect(loadSave(storage)).toEqual(createDefaultSave())
    expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBe(text)
  })
})

describe('čištění dat', () => {
  test('neznámé kousky a odznaky zahodí, startovní kousky doplní', () => {
    const raw = { ...createDefaultSave(), owned: ['neexistuje', 'dress-pink'], badges: ['first-step', 'neznamy'] }
    const save = parseSave(raw)!
    expect(save.owned).toContain('dress-pink')
    expect(save.owned).toContain('hair-ponytail-brown')
    expect(save.owned).not.toContain('neexistuje')
    expect(save.badges).toEqual(['first-step'])
  })

  test('sundá oblečení, které nevlastní nebo patří do jiné kategorie', () => {
    const raw = {
      ...createDefaultSave(),
      equipped: { dress: 'dress-pink', hair: 'shoes-flats-red', shoes: 'shoes-sneakers-white' },
    }
    expect(parseSave(raw)!.equipped).toEqual({ shoes: 'shoes-sneakers-white' })
  })

  test('úroveň srovná do mezí od rodiče', () => {
    const base = createDefaultSave()
    const raw = { ...base, level: 4, settings: { ...base.settings, minLevel: 1, maxLevel: 2 } }
    expect(parseSave(raw)!.level).toBe(2)
  })

  test('odmítne obrácené meze obtížnosti', () => {
    const base = createDefaultSave()
    expect(parseSave({ ...base, settings: { ...base.settings, minLevel: 3, maxLevel: 2 } })).toBeNull()
  })

  test('prázdný výběr typů příkladů nahradí všemi typy', () => {
    const base = createDefaultSave()
    const save = parseSave({ ...base, settings: { ...base.settings, enabledTypes: ['nesmysl'] } })!
    expect(save.settings.enabledTypes).toEqual(base.settings.enabledTypes)
  })
})
