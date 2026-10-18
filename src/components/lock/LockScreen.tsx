import { formatGold } from '../../lib/czech'

function SleepingDoll() {
  return (
    <svg viewBox="60 30 190 200" className="mx-auto h-32 w-32" aria-hidden="true">
      <ellipse cx="150" cy="125" rx="58" ry="62" fill="#f8d9c4" stroke="#d9a487" strokeWidth="2" />
      <path
        d="M86 142 Q80 60 150 54 Q220 60 214 142 Q206 112 196 100 Q178 112 150 104 Q122 112 104 100 Q94 112 86 142 Z"
        fill="#8a5a3b"
      />
      <path d="M118 134 Q128 141 138 134 M162 134 Q172 141 182 134" fill="none" stroke="#3a2a3f" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="114" cy="154" rx="10" ry="6" fill="#f7a1b5" opacity="0.55" />
      <ellipse cx="186" cy="154" rx="10" ry="6" fill="#f7a1b5" opacity="0.55" />
      <path d="M142 164 Q150 168 158 164" fill="none" stroke="#d6546f" strokeWidth="3" strokeLinecap="round" />
      <text x="214" y="82" fontSize="24" fontWeight="bold" fill="#a78bfa">z</text>
      <text x="232" y="58" fontSize="17" fontWeight="bold" fill="#c4b5fd">z</text>
    </svg>
  )
}

interface LockScreenProps {
  timeIsUp: boolean
  earned: number
  onParent: () => void
}

export function LockScreen({ timeIsUp, earned, onParent }: LockScreenProps) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-4 overflow-y-auto p-4">
      <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
        <SleepingDoll />
        <h1 className="mt-2 text-3xl font-bold text-pink-500">{timeIsUp ? 'Čas na pauzu!' : 'Ahoj!'}</h1>
        <p className="mt-2 text-lg text-violet-600">
          {timeIsUp && earned > 0 && (
            <>
              Dnes jsi vydělala <strong>{formatGold(earned)}</strong>.{' '}
            </>
          )}
          {timeIsUp ? 'Panenka si teď odpočine.' : 'Hru odemkne rodič.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onParent}
        className="min-h-14 rounded-2xl bg-violet-100 text-lg font-bold text-violet-600 active:scale-95"
      >
        Pro rodiče: odemknout PINem
      </button>
    </div>
  )
}
