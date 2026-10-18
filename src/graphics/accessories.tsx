import type { ComponentType } from 'react'
import { Mirrored, heartPath } from './shared'

interface Tone {
  fill: string
  line: string
}

/* ---------- hlava ---------- */

function Bow({ fill, line, knot }: Tone & { knot: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform="rotate(-18 112 74)">
      <path d="M112 74 L86 58 L88 92 Z" fill={fill} stroke={line} strokeWidth="2" />
      <path d="M112 74 L138 58 L136 92 Z" fill={fill} stroke={line} strokeWidth="2" />
      <circle cx="112" cy="74" r="7" fill={knot} stroke={line} strokeWidth="2" />
    </g>
  )
}

function Crown() {
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

function Headband({ fill, line }: Tone) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M92 116 Q150 36 208 116" stroke={line} strokeWidth="12" />
      <path d="M92 116 Q150 36 208 116" stroke={fill} strokeWidth="8" />
    </g>
  )
}

function StrawHat() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="150" cy="70" rx="80" ry="17" fill="#fde68a" stroke="#ca8a04" strokeWidth="2" />
      <path d="M108 68 Q110 22 150 20 Q190 22 192 68 Z" fill="#fde68a" stroke="#ca8a04" strokeWidth="2" />
      <path d="M109 56 Q150 64 191 56 L192 66 Q150 74 108 66 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
      <circle cx="176" cy="60" r="6" fill="#fef9c3" stroke="#db2777" strokeWidth="1.5" />
    </g>
  )
}

function Beret() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform="rotate(-12 160 60)">
      <ellipse cx="160" cy="62" rx="58" ry="22" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
      <path d="M110 68 Q160 82 210 68" fill="none" stroke="#b91c1c" strokeWidth="2" opacity="0.5" />
      <circle cx="160" cy="40" r="5" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
    </g>
  )
}

function FlowerClip() {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return [190 + Math.cos(rad) * 9, 84 + Math.sin(rad) * 9] as const
  })
  return (
    <g>
      {petals.map(([cx, cy]) => (
        <circle key={`${cx}`} cx={cx} cy={cy} r="7" fill="#f9a8d4" stroke="#db2777" strokeWidth="1.5" />
      ))}
      <circle cx="190" cy="84" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
    </g>
  )
}

/* ---------- obličej ---------- */

function RoundGlasses() {
  return (
    <g fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round">
      <circle cx="128" cy="134" r="15" fill="#ffffff" fillOpacity="0.2" />
      <circle cx="172" cy="134" r="15" fill="#ffffff" fillOpacity="0.2" />
      <path d="M143 132 Q150 126 157 132" />
      <path d="M113 131 L96 127 M187 131 L204 127" />
    </g>
  )
}

function Sunglasses() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x="110" y="122" width="34" height="24" rx="10" fill="#3b3340" stroke="#1f1a24" strokeWidth="2" />
      <rect x="156" y="122" width="34" height="24" rx="10" fill="#3b3340" stroke="#1f1a24" strokeWidth="2" />
      <path d="M144 130 Q150 125 156 130 M110 128 L96 125 M190 128 L204 125" fill="none" stroke="#1f1a24" strokeWidth="3" />
      <path d="M116 128 L124 128 M162 128 L170 128" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
    </g>
  )
}

function HeartGlasses() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d={heartPath(128, 134, 15)} fill="#fbcfe8" fillOpacity="0.6" stroke="#db2777" strokeWidth="3" />
      <path d={heartPath(172, 134, 15)} fill="#fbcfe8" fillOpacity="0.6" stroke="#db2777" strokeWidth="3" />
      <path d="M143 130 Q150 125 157 130 M112 128 L96 125 M188 128 L204 125" fill="none" stroke="#db2777" strokeWidth="3" />
    </g>
  )
}

/* ---------- krk ---------- */

function quadraticPoint(t: number, p0: number, p1: number, p2: number): number {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2
}

function PearlNecklace() {
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

function Scarf({ fill, line, stripe }: Tone & { stripe?: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M158 212 L168 270 L152 274 L146 216 Z" fill={fill} stroke={line} strokeWidth="2" />
      <path d="M124 198 Q150 214 176 198 L178 214 Q150 232 122 214 Z" fill={fill} stroke={line} strokeWidth="2" />
      {stripe && <path d="M150 236 L165 234 M152 252 L167 250 M126 206 L126 216 M174 206 L174 216" stroke={stripe} strokeWidth="4" />}
      <path d="M152 274 L150 282 M158 273 L158 281 M164 271 L166 279" stroke={line} strokeWidth="2" />
    </g>
  )
}

function HeartPendant() {
  return (
    <g>
      <path d="M126 210 Q150 236 174 210" fill="none" stroke="#ca8a04" strokeWidth="2" />
      <path d={heartPath(150, 236, 9)} fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
      <circle cx="146" cy="232" r="1.5" fill="#ffffff" />
    </g>
  )
}

/* ---------- ruka (pravá ruka je v bodě 217, 356) ---------- */

function Bag() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M205 372 Q217 336 230 372" fill="none" stroke="#db2777" strokeWidth="4" />
      <rect x="199" y="368" width="37" height="31" rx="8" fill="#f9a8d4" stroke="#db2777" strokeWidth="2" />
      <path d={heartPath(217.5, 383, 7)} fill="#ffffff" stroke="#db2777" strokeWidth="1.5" />
    </g>
  )
}

function Umbrella() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M217 352 L217 238" stroke="#7c3aed" strokeWidth="3" />
      <path
        d="M157 244 Q217 176 277 244 Q262 234 247 244 Q232 234 217 244 Q202 234 187 244 Q172 234 157 244 Z"
        fill="#a78bfa"
        stroke="#7c3aed"
        strokeWidth="2"
      />
      <path d="M187 244 Q200 196 217 188 M247 244 Q234 196 217 188" fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5" />
      <path d="M217 360 Q217 372 207 372" fill="none" stroke="#7c3aed" strokeWidth="3" />
    </g>
  )
}

function Balloon() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M217 350 Q232 280 242 202" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="244" cy="170" rx="26" ry="32" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
      <path d="M240 202 L244 210 L248 202 Z" fill="#be123c" />
      <ellipse cx="234" cy="158" rx="6" ry="10" fill="#ffffff" opacity="0.5" />
    </g>
  )
}

function Bouquet() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M210 360 L217 330 M217 360 L222 326 M224 360 L230 332" stroke="#16a34a" strokeWidth="3" />
      <circle cx="216" cy="322" r="8" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
      <circle cx="230" cy="326" r="7" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="222" cy="312" r="7" fill="#c084fc" stroke="#9333ea" strokeWidth="1.5" />
      <path d="M206 344 L232 344 L222 372 L214 372 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
    </g>
  )
}

/* ---------- uši (uši jsou v bodech 93, 132 a 207, 132) ---------- */

function PearlEarrings() {
  return (
    <Mirrored>
      <path d="M93 140 L93 146" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="93" cy="151" r="5" fill="#fffaf0" stroke="#d6c3a1" strokeWidth="1.5" />
    </Mirrored>
  )
}

function HeartEarrings() {
  return (
    <Mirrored>
      <path d="M93 140 L93 145" stroke="#ca8a04" strokeWidth="1.5" />
      <path d={heartPath(93, 151, 6)} fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
    </Mirrored>
  )
}

export const ACCESSORY_ASSETS: Readonly<Record<string, ComponentType>> = {
  'acc-bow-pink': () => <Bow fill="#f472b6" line="#db2777" knot="#f9a8d4" />,
  'acc-bow-blue': () => <Bow fill="#60a5fa" line="#2563eb" knot="#bfdbfe" />,
  'acc-crown': Crown,
  'acc-headband-pink': () => <Headband fill="#f9a8d4" line="#db2777" />,
  'acc-headband-blue': () => <Headband fill="#93c5fd" line="#2563eb" />,
  'acc-hat-straw': StrawHat,
  'acc-beret-red': Beret,
  'acc-flower-clip': FlowerClip,
  'acc-glasses': RoundGlasses,
  'acc-sunglasses': Sunglasses,
  'acc-glasses-hearts': HeartGlasses,
  'acc-necklace': PearlNecklace,
  'acc-scarf-red': () => <Scarf fill="#f87171" line="#b91c1c" />,
  'acc-scarf-stripes': () => <Scarf fill="#c4b5fd" line="#7c3aed" stripe="#ffffff" />,
  'acc-pendant-heart': HeartPendant,
  'acc-bag': Bag,
  'acc-umbrella': Umbrella,
  'acc-balloon': Balloon,
  'acc-bouquet': Bouquet,
  'acc-earrings-pearl': PearlEarrings,
  'acc-earrings-heart': HeartEarrings,
}
