import { describe, expect, test } from 'vitest'
import {
  MAX_MINUTES,
  MIN_MINUTES,
  SESSION_UNLOCK_KEY,
  UNLOCK_KEY,
  addEarned,
  adjustMinutes,
  formatRemaining,
  isExpired,
  isWarning,
  loadUnlock,
  parseUnlock,
  remainingMs,
  saveUnlock,
  startTimed,
  startUnlimited,
} from '../lib/playTime'

const NOW = 1_800_000_000_000
const MIN = 60_000

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

describe('odemknutí na čas', () => {
  test('skončí po zvolených minutách', () => {
    const unlock = startTimed(15, NOW)
    expect(remainingMs(unlock, NOW)).toBe(15 * MIN)
    expect(isExpired(unlock, NOW + 15 * MIN - 1)).toBe(false)
    expect(isExpired(unlock, NOW + 15 * MIN)).toBe(true)
    expect(remainingMs(unlock, NOW + 20 * MIN)).toBe(0)
  })

  test('čas se drží v povoleném rozsahu', () => {
    expect(remainingMs(startTimed(1, NOW), NOW)).toBe(MIN_MINUTES * MIN)
    expect(remainingMs(startTimed(999, NOW), NOW)).toBe(MAX_MINUTES * MIN)
  })

  test('upozornění poslední minutu před koncem', () => {
    const unlock = startTimed(10, NOW)
    expect(isWarning(unlock, NOW + 9 * MIN - 1)).toBe(false)
    expect(isWarning(unlock, NOW + 9 * MIN)).toBe(true)
    expect(isWarning(unlock, NOW + 10 * MIN)).toBe(false)
  })
})

describe('bez omezení', () => {
  test('nikdy nevyprší, nemá odpočet ani upozornění', () => {
    const unlock = startUnlimited()
    expect(remainingMs(unlock, NOW)).toBeNull()
    expect(isExpired(unlock, NOW + 1000 * MIN)).toBe(false)
    expect(isWarning(unlock, NOW)).toBe(false)
  })
})

describe('odpočet a vydělané zlaťáky', () => {
  test.each([
    [12 * MIN + 34_000, '12:34'],
    [65_000, '1:05'],
    [59_001, '1:00'],
    [999, '0:01'],
    [0, '0:00'],
  ])('%i ms se zobrazí jako %s', (ms, text) => {
    expect(formatRemaining(ms)).toBe(text)
  })

  test('započítá vydělané zlaťáky', () => {
    expect(addEarned(addEarned(startTimed(10, NOW), 10), 25).earned).toBe(35)
  })

  test('vlastní čas se mění po 5 minutách v povoleném rozsahu', () => {
    expect(adjustMinutes(15, 1)).toBe(20)
    expect(adjustMinutes(15, -1)).toBe(10)
    expect(adjustMinutes(MIN_MINUTES, -1)).toBe(MIN_MINUTES)
    expect(adjustMinutes(MAX_MINUTES, 1)).toBe(MAX_MINUTES)
  })
})

describe('ukládání', () => {
  test('odemknutí na čas přežije zavření hry', () => {
    const local = memoryStorage()
    const session = memoryStorage()
    const unlock = startTimed(20, NOW)
    saveUnlock(unlock, local, session)
    expect(loadUnlock(local, memoryStorage(), NOW + 5 * MIN)).toEqual(unlock)
  })

  test('„bez omezení“ platí jen do zavření hry', () => {
    const local = memoryStorage()
    const session = memoryStorage()
    saveUnlock(startUnlimited(), local, session)
    expect(loadUnlock(local, session, NOW)).toEqual(startUnlimited())
    expect(loadUnlock(local, memoryStorage(), NOW)).toBeNull()
  })

  test('nové odemknutí přepíše to předchozí', () => {
    const local = memoryStorage()
    const session = memoryStorage()
    saveUnlock(startUnlimited(), local, session)
    const timed = startTimed(10, NOW)
    saveUnlock(timed, local, session)
    expect(loadUnlock(local, session, NOW)).toEqual(timed)
  })

  test('vypršené odemknutí se načte, aby šlo ukázat „Čas na pauzu“', () => {
    const local = memoryStorage({ [UNLOCK_KEY]: JSON.stringify({ kind: 'timed', until: NOW - MIN, earned: 40 }) })
    const unlock = loadUnlock(local, memoryStorage(), NOW)
    expect(unlock && isExpired(unlock, NOW)).toBe(true)
    expect(unlock?.earned).toBe(40)
  })

  test('bez úložiště nic nespadne', () => {
    expect(loadUnlock(undefined, undefined, NOW)).toBeNull()
    expect(() => saveUnlock(startUnlimited(), undefined, undefined)).not.toThrow()
  })
})

describe('kontrola uložených dat', () => {
  test.each([
    ['nesmysl', 'ahoj'],
    ['jiný druh', { kind: 'forever', earned: 0 }],
    ['chybí konec', { kind: 'timed', earned: 0 }],
    ['konec příliš daleko (přetočené hodiny)', { kind: 'timed', until: NOW + (MAX_MINUTES + 10) * MIN, earned: 0 }],
    ['záporné zlaťáky', { kind: 'timed', until: NOW + MIN, earned: -5 }],
  ])('odmítne %s', (_, raw) => {
    expect(parseUnlock(raw, NOW)).toBeNull()
  })

  test('poškozený záznam v úložišti = zamčeno', () => {
    const local = memoryStorage({ [UNLOCK_KEY]: '{rozbité' })
    const session = memoryStorage({ [SESSION_UNLOCK_KEY]: '{rozbité' })
    expect(loadUnlock(local, session, NOW)).toBeNull()
  })
})
