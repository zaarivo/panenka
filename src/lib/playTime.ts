export const PRESET_MINUTES = [10, 15, 20, 30] as const
export const DEFAULT_MINUTES = 15
export const MIN_MINUTES = 5
export const MAX_MINUTES = 120
export const MINUTES_STEP = 5
export const WARNING_MS = 60_000

/** Na čas: v localStorage, přežije zavření hry. */
export const UNLOCK_KEY = 'panenka_unlock'
/** Bez omezení: v sessionStorage, platí jen do zavření hry. */
export const SESSION_UNLOCK_KEY = 'panenka_unlock_session'

const MINUTE_MS = 60_000

export type Unlock = { kind: 'timed'; until: number; earned: number } | { kind: 'unlimited'; earned: number }

const clampMinutes = (minutes: number) => Math.min(Math.max(Math.round(minutes), MIN_MINUTES), MAX_MINUTES)

export function startTimed(minutes: number, now: number): Unlock {
  return { kind: 'timed', until: now + clampMinutes(minutes) * MINUTE_MS, earned: 0 }
}

export function startUnlimited(): Unlock {
  return { kind: 'unlimited', earned: 0 }
}

/** null = bez omezení. */
export function remainingMs(unlock: Unlock, now: number): number | null {
  return unlock.kind === 'timed' ? Math.max(0, unlock.until - now) : null
}

export function isExpired(unlock: Unlock, now: number): boolean {
  return unlock.kind === 'timed' && now >= unlock.until
}

export function isWarning(unlock: Unlock, now: number): boolean {
  const remaining = remainingMs(unlock, now)
  return remaining !== null && remaining > 0 && remaining <= WARNING_MS
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function addEarned(unlock: Unlock, amount: number): Unlock {
  return { ...unlock, earned: unlock.earned + Math.max(0, Math.floor(amount)) }
}

export function adjustMinutes(minutes: number, direction: 1 | -1): number {
  return clampMinutes(minutes + direction * MINUTES_STEP)
}

/** Konec dál než nejdelší povolený čas znamená přetočené hodiny nebo podvržená data. */
export function parseUnlock(raw: unknown, now: number): Unlock | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { kind, until, earned } = raw as Record<string, unknown>
  if (!Number.isInteger(earned) || (earned as number) < 0) return null
  if (kind === 'unlimited') return { kind, earned: earned as number }
  if (kind !== 'timed' || typeof until !== 'number' || !Number.isFinite(until)) return null
  if (until - now > MAX_MINUTES * MINUTE_MS) return null
  return { kind, until, earned: earned as number }
}

function read(storage: Storage | undefined, key: string): unknown {
  try {
    const text = storage?.getItem(key)
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

export function loadUnlock(local: Storage | undefined, session: Storage | undefined, now: number): Unlock | null {
  const unlimited = parseUnlock(read(session, SESSION_UNLOCK_KEY), now)
  if (unlimited?.kind === 'unlimited') return unlimited
  const timed = parseUnlock(read(local, UNLOCK_KEY), now)
  return timed?.kind === 'timed' ? timed : null
}

export function saveUnlock(unlock: Unlock, local: Storage | undefined, session: Storage | undefined): void {
  try {
    if (unlock.kind === 'unlimited') {
      local?.removeItem(UNLOCK_KEY)
      session?.setItem(SESSION_UNLOCK_KEY, JSON.stringify(unlock))
    } else {
      session?.removeItem(SESSION_UNLOCK_KEY)
      local?.setItem(UNLOCK_KEY, JSON.stringify(unlock))
    }
  } catch {
    // úložiště může být zakázané; zámek pak platí jen do obnovení stránky
  }
}
