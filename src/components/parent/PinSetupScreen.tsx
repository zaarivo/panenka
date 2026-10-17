import { useState } from 'react'
import { PinPad } from './PinPad'

/** Úvodní obrazovka při prvním spuštění — rodič nastaví PIN, výchozí PIN neexistuje. */
export function PinSetupScreen({ onSetPin }: { onSetPin: (pin: string) => void }) {
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-4 overflow-y-auto p-4">
      <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-pink-500">Vítejte v Panence!</h1>
        <p className="mt-2 text-base text-violet-600">
          Tuhle obrazovku vyplní <strong>rodič</strong>. Zvolte 4místný PIN — chrání nastavení hry. Nastavení pak najdete
          v Síni slávy pod ozubeným kolečkem.
        </p>
      </div>
      {firstPin === null ? (
        <PinPad
          key="first"
          title="Zvolte PIN"
          error={error}
          onComplete={(pin) => {
            setError(null)
            setFirstPin(pin)
          }}
        />
      ) : (
        <PinPad
          key="confirm"
          title="Zadejte PIN ještě jednou"
          onComplete={(pin) => {
            if (pin === firstPin) {
              onSetPin(pin)
            } else {
              setError('PINy se neshodují, zkuste to znovu.')
              setFirstPin(null)
            }
          }}
        />
      )}
    </div>
  )
}
