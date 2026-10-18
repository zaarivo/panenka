import { describe, expect, test } from 'vitest'
import { CORRUPT_BACKUP_KEY, SAVE_KEY, createDefaultSave, loadSave, migrateTopicsFromV1, parseSave, writeSave } from '../lib/storage'
import { allTiersOn } from '../lib/topics'

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

  test('neznámé obtížnosti zahodí, duplicity odstraní a seřadí', () => {
    const base = createDefaultSave()
    const raw = { ...base, settings: { ...base.settings, topics: { ...base.settings.topics, add20: ['hard', 'nesmysl', 'easy', 'hard'] } } }
    expect(parseSave(raw)!.settings.topics.add20).toEqual(['easy', 'hard'])
  })

  test('chybějící kategorie je vypnutá', () => {
    const base = createDefaultSave()
    const { wordProblems: _, ...rest } = base.settings.topics
    expect(parseSave({ ...base, settings: { ...base.settings, topics: rest } })!.settings.topics.wordProblems).toEqual([])
  })

  test('žádná zaškrtnutá obtížnost nikde → vše zaškrtnuté', () => {
    const base = createDefaultSave()
    const empty = Object.fromEntries(Object.keys(base.settings.topics).map((k) => [k, []]))
    expect(parseSave({ ...base, settings: { ...base.settings, topics: empty } })!.settings.topics).toEqual(allTiersOn())
  })

  test('aktuální obtížnost srovná do zaškrtnutých', () => {
    const base = createDefaultSave()
    const raw = {
      ...base,
      currentTier: { ...base.currentTier, add20: 'hard', add100: 'nesmysl' },
      settings: { ...base.settings, topics: { ...base.settings.topics, add20: ['easy', 'medium'] } },
    }
    const save = parseSave(raw)!
    expect(save.currentTier.add20).toBe('medium')
    expect(save.currentTier.add100).toBe('easy')
  })

  test('neplatné záznamy úspěšnosti zahodí, platné nechá', () => {
    const ok = { recent: [true, false], total: 5, snoozedAtTotal: 3 }
    const raw = {
      ...createDefaultSave(),
      practice: {
        'add20:easy': ok,
        'add20:nesmysl': ok,
        'neznamy:easy': ok,
        'add20:medium': { recent: ['ano'], total: 1, snoozedAtTotal: null },
        'add20:hard': { recent: Array(21).fill(true), total: 21, snoozedAtTotal: null },
        'add100:easy': { recent: [true], total: 0, snoozedAtTotal: null },
        'add100:medium': { recent: [true], total: 1, snoozedAtTotal: 2 },
      },
    }
    expect(parseSave(raw)!.practice).toEqual({ 'add20:easy': ok })
  })
})

describe('převod z verze 1', () => {
  /** Uložený stav, jaký má telefon před aktualizací. */
  const phoneV1 = {
    saveVersion: 1,
    gold: 131,
    owned: ['hair-ponytail-brown', 'dress-tshirt-blue', 'shoes-sneakers-white', 'acc-bow-pink', 'acc-crown', 'dress-pink'],
    equipped: { hair: 'hair-ponytail-brown', dress: 'dress-pink', shoes: 'shoes-sneakers-white', accessory: 'acc-crown' },
    badges: ['first-step', 'times-table-star'],
    stats: { totalCorrect: 37, multiplicationStreak: 12 },
    level: 3,
    settings: { soundOn: false, enabledTypes: ['addSub', 'multiplication', 'missingNumber', 'comparison'], minLevel: 2, maxLevel: 3 },
    parentPinHash: 'fnv1a:39e21db5',
  }

  test('převod reálného v1 save zachová postup a přeloží nastavení', () => {
    const save = parseSave(phoneV1)!
    expect(save.saveVersion).toBe(2)
    expect(save.gold).toBe(131)
    expect(save.owned).toEqual(expect.arrayContaining(['acc-crown', 'dress-pink']))
    expect(save.equipped).toEqual(phoneV1.equipped)
    expect(save.badges).toEqual(['first-step', 'times-table-star'])
    expect(save.stats).toEqual({ totalCorrect: 37, multiplicationStreak: 12 })
    expect(save.parentPinHash).toBe('fnv1a:39e21db5')
    expect(save.settings.soundOn).toBe(false)
    expect(save.settings.topics).toEqual({
      add20: ['hard'],
      add100: ['medium'],
      multiplication: ['medium', 'hard'],
      missingNumber: ['medium', 'hard'],
      comparison: ['medium', 'hard'],
      wordProblems: [],
    })
    expect(save.currentTier).toEqual({
      add20: 'hard',
      add100: 'medium',
      multiplication: 'medium',
      missingNumber: 'medium',
      comparison: 'medium',
      wordProblems: 'easy',
    })
    expect(save.practice).toEqual({})
  })

  test('jen násobilka na stupni 1 → jen lehká násobilka', () => {
    expect(migrateTopicsFromV1(['multiplication'], 1, 1)).toEqual({
      add20: [],
      add100: [],
      multiplication: ['easy'],
      missingNumber: [],
      comparison: [],
      wordProblems: [],
    })
  })

  test('sčítání na všech stupních pokryje obě kategorie', () => {
    const topics = migrateTopicsFromV1(['addSub'], 1, 4)
    expect(topics.add20).toEqual(['medium', 'hard'])
    expect(topics.add100).toEqual(['medium', 'hard'])
  })

  test('převedený stav se uloží a načte jako v2', () => {
    const storage = memoryStorage({ [SAVE_KEY]: JSON.stringify(phoneV1) })
    const loaded = loadSave(storage)
    writeSave(loaded, storage)
    expect(JSON.parse(storage.getItem(SAVE_KEY)!).saveVersion).toBe(2)
    expect(loadSave(storage)).toEqual(loaded)
  })

  test('poškozený v1 save dá výchozí stav', () => {
    expect(parseSave({ ...phoneV1, gold: -1 })).toBeNull()
    expect(parseSave({ ...phoneV1, settings: { ...phoneV1.settings, minLevel: 3, maxLevel: 2 } })).toBeNull()
  })
})
