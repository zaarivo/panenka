import { useEffect, useMemo, useRef } from 'react'
import { MEDAL_NAMES, type Medal } from '../../lib/medals'
import { playFanfare } from '../../lib/sound'
import { TOPIC_LABELS } from '../../lib/topics'
import { MedalIcon } from './MedalIcon'

const CONFETTI_COLORS = ['#f472b6', '#facc15', '#60a5fa', '#a78bfa', '#34d399']

interface MedalCelebrationProps {
  medal: Medal
  soundOn: boolean
  onClose: () => void
}

/** Celoobrazovková oslava nové medaile: medaile spadne, za ní paprsky, padají konfety. */
export function MedalCelebration({ medal, soundOn, onClose }: MedalCelebrationProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const title = `${MEDAL_NAMES[medal.tier]}!`
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${0.8 + Math.random() * 2}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  )

  useEffect(() => {
    if (soundOn) playFanfare()
  }, [medal.id, soundOn])

  useEffect(() => {
    buttonRef.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#fef9c3,#fbcfe8_60%,#f5d0fe)]"
    >
      <div className="animate-medal-rays absolute top-[38%] left-1/2 h-[560px] w-[560px] rounded-full bg-[repeating-conic-gradient(rgba(255,255,255,0.55)_0_10deg,transparent_10deg_30deg)] motion-reduce:hidden" />
      {confetti.map((piece, i) => (
        <span
          key={i}
          className="animate-confetti absolute -top-5 h-3.5 w-2.5 rounded-sm motion-reduce:hidden"
          style={{ left: piece.left, background: piece.color, animationDelay: piece.delay }}
        />
      ))}
      <div className="relative flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="animate-medal-drop motion-reduce:animate-none">
          <MedalIcon tier={medal.tier} earned className="animate-medal-shine h-56 w-44 drop-shadow-lg motion-reduce:animate-none" />
        </div>
        <div className="animate-appear [animation-delay:1s] motion-reduce:animate-none">
          <p className="text-3xl font-extrabold text-pink-700">{title}</p>
          <p className="mt-1 text-lg text-violet-700">
            {TOPIC_LABELS[medal.topic]} · {medal.target} příkladů správně
          </p>
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="animate-appear min-h-14 rounded-full bg-pink-500 px-10 text-xl font-bold text-white shadow-md [animation-delay:1.4s] active:scale-95 motion-reduce:animate-none"
        >
          Hurá!
        </button>
      </div>
    </div>
  )
}
