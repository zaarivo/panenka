import type { ComponentType } from 'react'
import { Mirrored } from './shared'

const CAP = 'M86 142 Q80 60 150 54 Q220 60 214 142 Q206 112 196 100 Q178 112 150 104 Q122 112 104 100 Q94 112 86 142 Z'

export interface HairColor {
  fill: string
  line: string
}

export const HAIR = {
  brown: { fill: '#8a5a3b', line: '#6b4129' },
  blonde: { fill: '#f3cf6e', line: '#c99a2e' },
  red: { fill: '#d2652d', line: '#a3461a' },
  black: { fill: '#3b3340', line: '#1f1a24' },
  pink: { fill: '#f9a8d4', line: '#db2777' },
} satisfies Record<string, HairColor>

function Cap({ fill, line }: HairColor) {
  return (
    <>
      <path d={CAP} fill={fill} stroke={line} strokeWidth="2" />
      <path d="M150 58 Q140 80 128 100 M168 62 Q170 82 180 98" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
    </>
  )
}

export function Ponytail({ fill, line }: HairColor) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M196 74 Q248 72 246 140 Q244 200 222 240 Q226 190 214 150 Q208 112 194 94 Z" fill={fill} stroke={line} strokeWidth="2" />
      <path d="M232 110 Q236 160 224 210" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
      <Cap fill={fill} line={line} />
      <circle cx="201" cy="80" r="8" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
    </g>
  )
}

export function LongHair({ fill, line }: HairColor) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <path d="M86 128 Q72 220 80 312 Q94 302 106 314 Q100 240 104 172 Q98 150 92 138 Z" fill={fill} stroke={line} strokeWidth="2" />
        <path d="M88 170 Q84 240 90 300" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
      </Mirrored>
      <Cap fill={fill} line={line} />
    </g>
  )
}

export function Braids({ fill, line, ribbon = '#86efac', ribbonLine = '#22c55e' }: HairColor & { ribbon?: string; ribbonLine?: string }) {
  const links = [158, 180, 202, 224, 246]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        {links.map((cy, i) => (
          <ellipse key={cy} cx={94 - i} cy={cy} rx="12" ry="13" fill={fill} stroke={line} strokeWidth="2" />
        ))}
        <path d="M84 262 L80 282 M90 264 L90 286 M96 262 L100 282" stroke={fill} strokeWidth="5" />
        <path d="M78 258 L90 264 L78 270 Z M102 258 L90 264 L102 270 Z" fill={ribbon} stroke={ribbonLine} strokeWidth="2" />
      </Mirrored>
      <Cap fill={fill} line={line} />
    </g>
  )
}

export function Bob({ fill, line }: HairColor) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <path d="M86 128 Q76 182 96 196 Q110 199 118 193 Q102 178 100 134 Z" fill={fill} stroke={line} strokeWidth="2" />
      </Mirrored>
      <Cap fill={fill} line={line} />
      <path d="M118 66 Q130 60 142 62" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.35" />
    </g>
  )
}

export function Bun({ fill, line }: HairColor) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <circle cx="150" cy="44" r="25" fill={fill} stroke={line} strokeWidth="2" />
      <path d="M134 36 Q150 26 166 36 M136 50 Q150 58 164 50" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
      <Cap fill={fill} line={line} />
      <rect x="132" y="62" width="36" height="7" rx="3.5" fill="#c084fc" stroke="#9333ea" strokeWidth="1.5" />
    </g>
  )
}

export function Pigtails({ fill, line }: HairColor) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <path d="M100 92 Q60 98 58 158 Q58 198 74 228 Q76 190 84 152 Q90 118 106 102 Z" fill={fill} stroke={line} strokeWidth="2" />
        <path d="M70 130 Q66 170 72 210" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
      </Mirrored>
      <Cap fill={fill} line={line} />
      <Mirrored>
        <circle cx="99" cy="98" r="7" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
      </Mirrored>
    </g>
  )
}

export function Curly({ fill, line }: HairColor) {
  const curls: [number, number, number][] = [
    [100, 70, 18],
    [84, 98, 17],
    [76, 128, 16],
    [78, 158, 15],
    [86, 186, 14],
  ]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        {curls.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} stroke={line} strokeWidth="2" />
        ))}
      </Mirrored>
      <Cap fill={fill} line={line} />
      {[118, 150, 182].map((cx) => (
        <circle key={cx} cx={cx} cy="64" r="16" fill={fill} stroke={line} strokeWidth="2" />
      ))}
    </g>
  )
}

export const HAIR_ASSETS: Readonly<Record<string, ComponentType>> = {
  'hair-ponytail-brown': () => <Ponytail {...HAIR.brown} />,
  'hair-ponytail-blonde': () => <Ponytail {...HAIR.blonde} />,
  'hair-long-blonde': () => <LongHair {...HAIR.blonde} />,
  'hair-long-black': () => <LongHair {...HAIR.black} />,
  'hair-braids-red': () => <Braids {...HAIR.red} />,
  'hair-braids-brown': () => <Braids {...HAIR.brown} ribbon="#fda4af" ribbonLine="#e11d48" />,
  'hair-bob-black': () => <Bob {...HAIR.black} />,
  'hair-bob-pink': () => <Bob {...HAIR.pink} />,
  'hair-bun-brown': () => <Bun {...HAIR.brown} />,
  'hair-pigtails-blonde': () => <Pigtails {...HAIR.blonde} />,
  'hair-curly-red': () => <Curly {...HAIR.red} />,
}
