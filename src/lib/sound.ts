let context: AudioContext | null = null

/** AudioContext se smí spustit až po dotyku uživatele, proto se vytváří líně při prvním zvuku. */
function audio(): AudioContext | null {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, volume = 0.12) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

function play(notes: [frequency: number, delay: number, duration: number][]) {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  for (const [frequency, delay, duration] of notes) tone(ctx, frequency, now + delay, duration)
}

export function playCoin() {
  play([
    [1318.5, 0, 0.12],
    [1760, 0.08, 0.28],
  ])
}

/** Slavnostní fanfára k nové medaili. */
export function playFanfare() {
  play([
    [523.25, 0, 0.18],
    [659.25, 0.15, 0.18],
    [783.99, 0.3, 0.18],
    [1046.5, 0.45, 0.35],
    [783.99, 0.75, 0.15],
    [1046.5, 0.9, 0.7],
  ])
}

export function playChest() {
  play([
    [1046.5, 0, 0.15],
    [1318.5, 0.1, 0.15],
    [1568, 0.2, 0.15],
    [2093, 0.3, 0.4],
  ])
}
