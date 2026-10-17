import { useState } from 'react'
import { PinPad } from './PinPad'

interface ParentGateProps {
  checkPin: (pin: string) => boolean
  onUnlock: () => void
  onCancel: () => void
}

export function ParentGate({ checkPin, onUnlock, onCancel }: ParentGateProps) {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-pink-50">
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-4 p-4">
        <PinPad
          title="Pro rodiče"
          description="Zadejte PIN."
          error={error}
          onComplete={(pin) => (checkPin(pin) ? onUnlock() : setError('Špatný PIN.'))}
        />
        <button type="button" onClick={onCancel} className="min-h-14 rounded-2xl bg-violet-100 text-lg font-bold text-violet-600">
          Zpět do hry
        </button>
        <p className="text-center text-sm text-violet-400">
          Zapomenutý PIN: smažte data této stránky v nastavení prohlížeče (smaže se i postup).
        </p>
      </div>
    </div>
  )
}
