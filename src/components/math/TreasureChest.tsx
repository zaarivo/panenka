export function TreasureChest({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <rect x="14" y="44" width="92" height="48" rx="8" fill="#b7793f" stroke="#7c4a1e" strokeWidth="3" />
      <rect x="14" y="58" width="92" height="8" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
      {open ? (
        <>
          <circle cx="44" cy="44" r="9" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="62" cy="38" r="9" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="78" cy="45" r="9" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <path d="M18 40 L24 6 Q60 -4 96 6 L102 40 Z" fill="#c98a4b" stroke="#7c4a1e" strokeWidth="3" transform="rotate(-8 18 40)" />
          <path d="M60 12 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#fef9c3" />
        </>
      ) : (
        <>
          <path d="M14 46 Q14 16 60 14 Q106 16 106 46 Z" fill="#c98a4b" stroke="#7c4a1e" strokeWidth="3" />
          <rect x="50" y="52" width="20" height="20" rx="4" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="60" cy="62" r="3" fill="#7c4a1e" />
        </>
      )}
    </svg>
  )
}
