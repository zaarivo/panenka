import type { CompareSign } from '../../lib/mathGenerator'

const OPTIONS: { sign: CompareSign; label: string }[] = [
  { sign: '<', label: 'je menší' },
  { sign: '=', label: 'rovná se' },
  { sign: '>', label: 'je větší' },
]

export function CompareButtons({ onChoose, disabled }: { onChoose: (sign: CompareSign) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ sign, label }) => (
        <button
          key={sign}
          type="button"
          disabled={disabled}
          onClick={() => onChoose(sign)}
          aria-label={label}
          className="flex h-28 flex-col items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm active:scale-95 disabled:opacity-40"
        >
          <span className="text-5xl font-bold">{sign}</span>
          <span className="text-sm text-violet-400">{label}</span>
        </button>
      ))}
    </div>
  )
}
