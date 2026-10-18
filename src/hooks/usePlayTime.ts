import { useCallback, useEffect, useState } from 'react'
import {
  addEarned as addEarnedTo,
  isExpired,
  isWarning,
  loadUnlock,
  remainingMs,
  saveUnlock,
  startTimed,
  startUnlimited,
  type Unlock,
} from '../lib/playTime'

function storages(): { local?: Storage; session?: Storage } {
  try {
    return { local: window.localStorage, session: window.sessionStorage }
  } catch {
    return {}
  }
}

export type TimeChoice = number | 'unlimited'

export function usePlayTime() {
  const [unlock, setUnlock] = useState<Unlock | null>(() => {
    const { local, session } = storages()
    return loadUnlock(local, session, Date.now())
  })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!unlock) return
    const { local, session } = storages()
    saveUnlock(unlock, local, session)
  }, [unlock])

  const timed = unlock?.kind === 'timed'
  useEffect(() => {
    if (!timed) return
    const tick = () => setNow(Date.now())
    const interval = setInterval(tick, 1000)
    // Na telefonu se časovač ve spánku zpomalí; po návratu se čas hned dorovná.
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [timed])

  const start = useCallback((choice: TimeChoice) => {
    const startedAt = Date.now()
    setNow(startedAt)
    setUnlock(choice === 'unlimited' ? startUnlimited() : startTimed(choice, startedAt))
  }, [])

  const addEarned = useCallback((amount: number) => setUnlock((current) => current && addEarnedTo(current, amount)), [])

  return {
    unlock,
    expired: unlock !== null && isExpired(unlock, now),
    warning: unlock !== null && isWarning(unlock, now),
    remaining: unlock ? remainingMs(unlock, now) : null,
    start,
    addEarned,
  }
}
