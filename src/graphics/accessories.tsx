import { heartPath } from './shared'

export function AccBowPink() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform="rotate(-18 112 74)">
      <path d="M112 74 L86 58 L88 92 Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
      <path d="M112 74 L138 58 L136 92 Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
      <circle cx="112" cy="74" r="7" fill="#f9a8d4" stroke="#db2777" strokeWidth="2" />
    </g>
  )
}

export function AccGlasses() {
  return (
    <g fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round">
      <circle cx="128" cy="134" r="15" fill="#ffffff" fillOpacity="0.2" />
      <circle cx="172" cy="134" r="15" fill="#ffffff" fillOpacity="0.2" />
      <path d="M143 132 Q150 126 157 132" />
      <path d="M113 131 L96 127 M187 131 L204 127" />
    </g>
  )
}

function quadraticPoint(t: number, p0: number, p1: number, p2: number): number {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2
}

export function AccNecklace() {
  const pearls = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10
    return { x: quadraticPoint(t, 124, 150, 176), y: quadraticPoint(t, 212, 246, 212) }
  })
  return (
    <g>
      {pearls.map(({ x, y }) => (
        <circle key={x} cx={x} cy={y} r="4.5" fill="#fffaf0" stroke="#d6c3a1" strokeWidth="1.5" />
      ))}
      <path d={heartPath(150, 240, 7)} fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
    </g>
  )
}

export function AccBag() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M205 372 Q217 336 230 372" fill="none" stroke="#db2777" strokeWidth="4" />
      <rect x="199" y="368" width="37" height="31" rx="8" fill="#f9a8d4" stroke="#db2777" strokeWidth="2" />
      <path d={heartPath(217.5, 383, 7)} fill="#ffffff" stroke="#db2777" strokeWidth="1.5" />
    </g>
  )
}

export function AccCrown() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M114 78 L118 44 L134 62 L150 34 L166 62 L182 44 L186 78 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
      <rect x="112" y="70" width="76" height="12" rx="4" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
      <circle cx="150" cy="58" r="5" fill="#f472b6" stroke="#be185d" strokeWidth="1.5" />
      <circle cx="128" cy="76" r="3.5" fill="#60a5fa" />
      <circle cx="150" cy="76" r="3.5" fill="#34d399" />
      <circle cx="172" cy="76" r="3.5" fill="#60a5fa" />
      <circle cx="118" cy="44" r="3" fill="#fef9c3" />
      <circle cx="182" cy="44" r="3" fill="#fef9c3" />
      <circle cx="150" cy="34" r="3" fill="#fef9c3" />
    </g>
  )
}
