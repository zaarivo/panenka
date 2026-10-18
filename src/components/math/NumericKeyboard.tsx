import { BackspaceIcon } from '../ui/icons'

interface NumericKeyboardProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  maxDigits?: number
  /** Nejméně číslic, aby šlo zmáčknout Hotovo (u času 3 — hodiny a minuty). */
  minDigits?: number
  submitLabel?: string
  /** Pro PIN: povolí úvodní nulu (např. 0123). */
  allowLeadingZero?: boolean
}

export function NumericKeyboard({
  value,
  onChange,
  onSubmit,
  disabled,
  maxDigits = 3,
  minDigits = 1,
  submitLabel = 'Hotovo',
  allowLeadingZero = false,
}: NumericKeyboardProps) {
  function press(digit: string) {
    if (value === '0' && !allowLeadingZero) onChange(digit)
    else if (value.length < maxDigits) onChange(value + digit)
  }

  const key = 'flex h-14 items-center justify-center rounded-2xl text-3xl font-bold shadow-sm active:scale-95 disabled:opacity-40'

  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Klávesnice">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
        <button key={digit} type="button" disabled={disabled} onClick={() => press(digit)} className={`${key} bg-white text-violet-700`}>
          {digit}
        </button>
      ))}
      <button
        type="button"
        disabled={disabled || value === ''}
        onClick={() => onChange(value.slice(0, -1))}
        aria-label="Smazat"
        className={`${key} bg-violet-100 text-violet-500`}
      >
        <BackspaceIcon className="h-8 w-8" />
      </button>
      <button type="button" disabled={disabled} onClick={() => press('0')} className={`${key} bg-white text-violet-700`}>
        0
      </button>
      <button
        type="button"
        disabled={disabled || value.length < minDigits}
        onClick={onSubmit}
        className={`${key} bg-pink-400 text-xl text-white`}
      >
        {submitLabel}
      </button>
    </div>
  )
}
