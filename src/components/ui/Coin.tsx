export function Coin({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#fde68a" strokeWidth="1.5" />
      <path d="M9.5 9h5l-5 6h5" fill="none" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GoldCounter({ gold }: { gold: number }) {
  return (
    <div
      className="flex min-h-12 items-center gap-2 rounded-full bg-white px-4 text-xl font-bold text-amber-600 shadow-sm"
      aria-label={`Máš ${gold} zlaťáků`}
    >
      <Coin className="h-7 w-7" />
      <span aria-hidden="true">{gold}</span>
    </div>
  )
}
