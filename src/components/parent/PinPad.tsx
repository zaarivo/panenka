import { useState } from 'react'
import { PIN_LENGTH } from '../../lib/parent'
import { NumericKeyboard } from '../math/NumericKeyboard'

interface PinPadProps {
  title: string
  description?: string
  error?: string | null
  onComplete: (pin: string) => void
}

/** PIN se odešle sám po zadání poslední číslice. */
export function PinPad({ title, description, error, onComplete }: PinPadProps) {
  const [pin, setPin] = useState('')

  function change(value: string) {
    if (value.length === PIN_LENGTH) {
      setPin('')
      onComplete(value)
    } else {
      setPin(value)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-violet-700">{title}</h2>
        {description && <p className="mt-1 text-base text-violet-500">{description}</p>}
      </div>
      <div className="flex justify-center gap-3" aria-label={`Zadáno ${pin.length} z ${PIN_LENGTH} číslic`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-violet-400 ${i < pin.length ? 'bg-violet-400' : 'bg-white'}`}
          />
        ))}
      </div>
      <p className="min-h-6 text-center text-base font-semibold text-rose-500" role="alert">
        {error}
      </p>
      <NumericKeyboard
        value={pin}
        onChange={change}
        onSubmit={() => change(pin)}
        maxDigits={PIN_LENGTH}
        submitLabel="OK"
        allowLeadingZero
      />
    </div>
  )
}
