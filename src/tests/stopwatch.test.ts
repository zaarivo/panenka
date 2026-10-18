import { expect, test } from 'vitest'
import { ActiveStopwatch } from '../lib/stopwatch'

function fakeClock() {
  let time = 1_000
  return { now: () => time, advance: (ms: number) => void (time += ms) }
}

test('počítá jen čas, kdy běží', () => {
  const clock = fakeClock()
  const watch = new ActiveStopwatch(clock.now)
  clock.advance(5_000)
  expect(watch.elapsedMs()).toBe(0)
  watch.setRunning(true)
  clock.advance(3_000)
  watch.setRunning(false)
  clock.advance(60_000)
  watch.setRunning(true)
  clock.advance(2_000)
  expect(watch.elapsedMs()).toBe(5_000)
})

test('opakované zapnutí čas nezdvojí', () => {
  const clock = fakeClock()
  const watch = new ActiveStopwatch(clock.now)
  watch.setRunning(true)
  clock.advance(1_000)
  watch.setRunning(true)
  clock.advance(1_000)
  expect(watch.elapsedMs()).toBe(2_000)
})

test('reset vynuluje a běží dál podle posledního stavu', () => {
  const clock = fakeClock()
  const watch = new ActiveStopwatch(clock.now)
  watch.setRunning(true)
  clock.advance(4_000)
  watch.reset()
  clock.advance(1_500)
  expect(watch.elapsedMs()).toBe(1_500)
  watch.setRunning(false)
  watch.reset()
  clock.advance(1_000)
  expect(watch.elapsedMs()).toBe(0)
})
