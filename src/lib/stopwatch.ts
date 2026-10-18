/** Stopky, které měří jen čas, kdy běží (hra viditelná a otevřená Akademie). */
export class ActiveStopwatch {
  private accumulated = 0
  private startedAt: number | null = null
  private readonly now: () => number

  constructor(now: () => number = () => performance.now()) {
    this.now = now
  }

  setRunning(running: boolean): void {
    if (running && this.startedAt === null) this.startedAt = this.now()
    if (!running && this.startedAt !== null) {
      this.accumulated += this.now() - this.startedAt
      this.startedAt = null
    }
  }

  reset(): void {
    this.accumulated = 0
    if (this.startedAt !== null) this.startedAt = this.now()
  }

  elapsedMs(): number {
    return this.accumulated + (this.startedAt === null ? 0 : this.now() - this.startedAt)
  }
}
