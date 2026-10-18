import { useState } from 'react'
import type { TimeChoice } from '../../hooks/usePlayTime'
import { DEFAULT_MINUTES, MAX_MINUTES, MIN_MINUTES, PRESET_MINUTES, adjustMinutes } from '../../lib/playTime'

export function TimePicker({ onStart }: { onStart: (choice: TimeChoice) => void }) {
  const [choice, setChoice] = useState<TimeChoice>(DEFAULT_MINUTES)
  const minutes = choice === 'unlimited' ? DEFAULT_MINUTES : choice

  const option = (selected: boolean) =>
    `min-h-14 rounded-2xl border-2 text-lg font-bold active:scale-95 ${
      selected ? 'border-pink-400 bg-pink-100 text-pink-600' : 'border-violet-100 bg-white text-violet-600'
    }`

  return (
    <div className="mx-auto flex h-full max-w-md flex-col gap-3 overflow-y-auto p-4">
      <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-pink-500">Jak dlouho dnes?</h1>
        <p className="mt-1 text-base text-violet-500">Po uplynutí času se hra zamkne.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRESET_MINUTES.map((preset) => (
          <button key={preset} type="button" className={option(choice === preset)} onClick={() => setChoice(preset)}>
            {preset} min
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-white p-2">
        <button
          type="button"
          aria-label="O 5 minut méně"
          disabled={choice !== 'unlimited' && minutes <= MIN_MINUTES}
          onClick={() => setChoice(choice === 'unlimited' ? minutes : adjustMinutes(minutes, -1))}
          className="h-14 w-14 rounded-xl bg-violet-100 text-3xl font-bold text-violet-600 disabled:opacity-40"
        >
          −
        </button>
        <span className="flex-1 text-center text-lg font-semibold text-violet-700">
          {choice === 'unlimited' ? 'Jiný čas' : `${minutes} min`}
        </span>
        <button
          type="button"
          aria-label="O 5 minut více"
          disabled={choice !== 'unlimited' && minutes >= MAX_MINUTES}
          onClick={() => setChoice(choice === 'unlimited' ? minutes : adjustMinutes(minutes, 1))}
          className="h-14 w-14 rounded-xl bg-violet-100 text-3xl font-bold text-violet-600 disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button type="button" className={option(choice === 'unlimited')} onClick={() => setChoice('unlimited')}>
        Bez omezení
        <span className="block text-sm font-normal">platí do zavření hry</span>
      </button>

      <div className="flex-1" />
      <button
        type="button"
        onClick={() => onStart(choice)}
        className="min-h-14 rounded-2xl bg-pink-400 text-xl font-bold text-white shadow-sm active:scale-95"
      >
        Pokračovat do hry
      </button>
    </div>
  )
}
