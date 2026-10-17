import { sparklePath } from '../../graphics/shared'
import type { BadgeId } from '../../types'

const COLORS: Record<BadgeId, { ribbon: string; face: string; line: string }> = {
  'first-step': { ribbon: '#f9a8d4', face: '#fbcfe8', line: '#db2777' },
  'times-table-star': { ribbon: '#fde047', face: '#facc15', line: '#ca8a04' },
  'diligent-pupil': { ribbon: '#c4b5fd', face: '#ddd6fe', line: '#7c3aed' },
}

const LOCKED = { ribbon: '#e5e7eb', face: '#f3f4f6', line: '#9ca3af' }

function Emblem({ id, color }: { id: BadgeId; color: string }) {
  if (id === 'first-step') return <path d={sparklePath(32, 42, 13)} fill={color} />
  if (id === 'times-table-star') {
    return <path d="M32 27l4.4 9 9.9 1.4-7.2 7 1.7 9.8L32 49.5l-8.8 4.7 1.7-9.8-7.2-7 9.9-1.4z" fill="#fff7cc" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  }
  return (
    <text x="32" y="48" textAnchor="middle" fontSize="15" fontWeight="bold" fontFamily="system-ui, sans-serif" fill={color}>
      100
    </text>
  )
}

export function BadgeMedal({ id, earned, className }: { id: BadgeId; earned: boolean; className?: string }) {
  const c = earned ? COLORS[id] : LOCKED
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true">
      <path d="M18 2h12l6 22H24zM46 2H34l-6 22h12z" fill={c.ribbon} stroke={c.line} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="32" cy="42" r="22" fill={c.face} stroke={c.line} strokeWidth="3" />
      <circle cx="32" cy="42" r="16" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      <Emblem id={id} color={c.line} />
    </svg>
  )
}
