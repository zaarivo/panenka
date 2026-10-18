import { MEDAL_COLORS } from '../../lib/medals'
import type { MedalTier } from '../../types'

/** Medaile na modro-růžové stuze s hvězdou; nezískaná je šedá a průhledná. */
export function MedalIcon({ tier, earned, className = '' }: { tier: MedalTier; earned: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 60 76" className={`${className} ${earned ? '' : 'opacity-35 grayscale'}`} aria-hidden="true">
      <path d="M14 0 L28 30 L20 34 L4 4 Z" fill="#60a5fa" />
      <path d="M46 0 L32 30 L40 34 L56 4 Z" fill="#f472b6" />
      <circle cx="30" cy="50" r="24" fill={MEDAL_COLORS[tier]} stroke="rgba(0,0,0,.18)" strokeWidth="3" />
      <circle cx="30" cy="50" r="16" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
      <path
        d="M30 39 L33.5 46.5 L41 47.5 L35.5 52.5 L37 60 L30 56 L23 60 L24.5 52.5 L19 47.5 L26.5 46.5 Z"
        fill="rgba(255,255,255,.85)"
      />
    </svg>
  )
}
