import type { Rng, Tier } from '../types'
import { plural } from './czech'
import { pick, randInt } from './equations'

export interface ClockTask {
  hours: number
  minutes: number
  /** `words` = čas slovy („půl 6“), `face` = ručičkové hodiny. */
  mode: 'words' | 'face'
  words: string | null
  hint: string
}

type SpokenMinutes = 0 | 15 | 30 | 45

const nextHour = (hours: number) => (hours % 12) + 1

/** Čas slovy, jak se říká: „5 hodin“, „čtvrt na 3“, „půl 6“, „třičtvrtě na 5“. Hodiny 1–12. */
export function timeInWords(hours: number, minutes: SpokenMinutes): string {
  if (minutes === 0) return `${hours} ${plural(hours, 'hodina', 'hodiny', 'hodin')}`
  const next = nextHour(hours)
  if (minutes === 15) return `čtvrt na ${next}`
  if (minutes === 30) return `půl ${next}`
  return `třičtvrtě na ${next}`
}

/** Odpověď jako číslo, které dítě napíše bez dvojtečky: 4:45 → 445. */
export function timeAnswer(hours: number, minutes: number): number {
  return hours * 100 + minutes
}

/** Napsané číslice s dvojtečkou před posledními dvěma: „445“ → „4:45“; 1–2 číslice beze změny. */
export function formatTimeDigits(digits: string): string {
  return digits.length >= 3 ? `${digits.slice(0, -2)}:${digits.slice(-2)}` : digits
}

const FACE_HINT = 'Krátká ručička ukazuje hodiny, dlouhá minuty. Každé číslo na ciferníku je 5 minut.'

function wordsHint(hours: number, minutes: SpokenMinutes): string {
  const words = timeInWords(hours, minutes)
  const spoken = words.charAt(0).toUpperCase() + words.slice(1)
  const next = nextHour(hours)
  if (minutes === 0) return 'U celé hodiny stojí dlouhá ručička přesně na 12.'
  if (minutes === 15) return `${spoken} je čtvrt hodiny po ${hours}. hodině.`
  if (minutes === 30) return `${spoken} je půl hodiny před ${next}. hodinou.`
  return `${spoken} je čtvrt hodiny před ${next}. hodinou.`
}

const SPOKEN: Record<Exclude<Tier, 'hard'>, readonly SpokenMinutes[]> = {
  easy: [0, 30],
  medium: [0, 15, 30, 45],
}

export function buildClockTask(tier: Tier, rng: Rng): ClockTask {
  const hours = randInt(rng, { min: 1, max: 12 })
  if (tier === 'hard') {
    const minutes = randInt(rng, { min: 0, max: 55 }, 5)
    return { hours, minutes, mode: 'face', words: null, hint: FACE_HINT }
  }
  const minutes = pick(rng, SPOKEN[tier])
  if (rng() < 0.5) return { hours, minutes, mode: 'face', words: null, hint: FACE_HINT }
  return { hours, minutes, mode: 'words', words: timeInWords(hours, minutes), hint: wordsHint(hours, minutes) }
}
