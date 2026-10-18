import { formatRemaining } from '../../lib/playTime'

interface TimerBarProps {
  remaining: number
  warning: boolean
  expired: boolean
}

export function TimerBar({ remaining, warning, expired }: TimerBarProps) {
  const urgent = warning || expired
  const label = expired ? 'Čas vypršel – dopočítej příklad' : warning ? `Ještě minutka! ${formatRemaining(remaining)}` : formatRemaining(remaining)

  return (
    <div className="flex justify-center px-3 pt-2" role="timer" aria-live={urgent ? 'polite' : 'off'}>
      <div
        className={`flex min-h-9 items-center gap-2 rounded-full px-4 text-base font-bold shadow-sm ${
          urgent ? 'bg-amber-100 text-amber-800' : 'bg-white text-violet-600'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2M9 2h6" strokeLinecap="round" />
        </svg>
        {label}
      </div>
    </div>
  )
}
