import type { ComponentType } from 'react'
import { Mirrored } from './shared'

interface Tone {
  fill: string
  line: string
}

function Sneakers({ fill, line, sole, laces }: Tone & { sole: Tone; laces: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <path d="M114 552 Q112 532 131 532 Q149 533 150 552 Z" fill={fill} stroke={line} strokeWidth="2" />
        <rect x="112" y="550" width="40" height="7" rx="3.5" fill={sole.fill} stroke={sole.line} strokeWidth="1.5" />
        <path d="M124 538 L136 538 M123 543 L138 543" stroke={laces} strokeWidth="2" />
      </Mirrored>
    </g>
  )
}

function Flats({ fill, line, bow }: Tone & { bow: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <path d="M114 554 Q113 541 128 539 Q147 539 149 554 Z" fill={fill} stroke={line} strokeWidth="2" />
        <path d="M122 540 Q131 534 140 540" fill="none" stroke={line} strokeWidth="2.5" />
        <circle cx="120" cy="547" r="3.5" fill={bow} stroke={line} strokeWidth="1.5" />
      </Mirrored>
    </g>
  )
}

function Boots({ fill, line, cuff, sole, top = 470 }: Tone & { cuff: string; sole: string; top?: number }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <rect x="122" y={top} width="26" height={550 - top} rx="9" fill={fill} stroke={line} strokeWidth="2" />
        <path d="M113 555 Q111 534 131 536 Q149 538 149 555 Z" fill={fill} stroke={line} strokeWidth="2" />
        <rect x="119" y={top - 6} width="31" height="14" rx="7" fill={cuff} stroke={line} strokeWidth="2" />
        <rect x="112" y="553" width="38" height="5" rx="2.5" fill={sole} />
      </Mirrored>
    </g>
  )
}

function Sandals({ fill, line, strap }: Tone & { strap: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <rect x="113" y="551" width="38" height="6" rx="3" fill={fill} stroke={line} strokeWidth="1.5" />
        <path d="M118 549 L146 540 M120 540 L145 549" stroke={strap} strokeWidth="4" />
        <path d="M126 532 Q136 528 146 532" fill="none" stroke={strap} strokeWidth="4" />
        <circle cx="132" cy="544" r="3" fill="#fef9c3" stroke={line} strokeWidth="1" />
      </Mirrored>
    </g>
  )
}

function RainBoots() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Boots fill="#facc15" line="#ca8a04" cuff="#fde047" sole="#a16207" top={448} />
      <Mirrored>
        <path d="M128 462 L128 530" stroke="#ffffff" strokeWidth="3" opacity="0.6" />
        <circle cx="135" cy="500" r="4" fill="#60a5fa" />
      </Mirrored>
    </g>
  )
}

function Skates() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Boots fill="#ffffff" line="#94a3b8" cuff="#f9a8d4" sole="#e2e8f0" top={496} />
      <Mirrored>
        <path d="M124 512 L146 512 M124 522 L146 522 M124 532 L146 532" stroke="#f472b6" strokeWidth="2" />
        <path d="M114 560 L120 568 L144 568 L152 560" fill="none" stroke="#64748b" strokeWidth="3" />
        <path d="M120 558 L120 566 M144 558 L144 566" stroke="#64748b" strokeWidth="2" />
      </Mirrored>
    </g>
  )
}

function Slippers() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <ellipse cx="131" cy="548" rx="19" ry="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="2" />
        <ellipse cx="118" cy="530" rx="3" ry="8" fill="#ffffff" stroke="#f9a8d4" strokeWidth="1.5" />
        <ellipse cx="126" cy="529" rx="3" ry="8" fill="#ffffff" stroke="#f9a8d4" strokeWidth="1.5" />
        <circle cx="122" cy="541" r="7" fill="#ffffff" stroke="#f9a8d4" strokeWidth="1.5" />
        <circle cx="118" cy="539" r="1.5" fill="#3a2a3f" />
        <circle cx="125" cy="539" r="1.5" fill="#3a2a3f" />
      </Mirrored>
    </g>
  )
}

export const SHOES_ASSETS: Readonly<Record<string, ComponentType>> = {
  'shoes-sneakers-white': () => (
    <Sneakers fill="#ffffff" line="#cbd5e1" sole={{ fill: '#f9a8d4', line: '#f472b6' }} laces="#94a3b8" />
  ),
  'shoes-sneakers-pink': () => (
    <Sneakers fill="#f9a8d4" line="#db2777" sole={{ fill: '#ffffff', line: '#f472b6' }} laces="#ffffff" />
  ),
  'shoes-sneakers-blue': () => (
    <Sneakers fill="#93c5fd" line="#2563eb" sole={{ fill: '#ffffff', line: '#60a5fa' }} laces="#ffffff" />
  ),
  'shoes-flats-red': () => <Flats fill="#f87171" line="#b91c1c" bow="#fecaca" />,
  'shoes-flats-gold': () => <Flats fill="#fde047" line="#ca8a04" bow="#ffffff" />,
  'shoes-boots-brown': () => <Boots fill="#a16a3f" line="#7c4a26" cuff="#d6a77a" sole="#5b3418" />,
  'shoes-boots-white': () => <Boots fill="#ffffff" line="#a1a1aa" cuff="#e9d5ff" sole="#a1a1aa" />,
  'shoes-sandals-mint': () => <Sandals fill="#6ee7b7" line="#059669" strap="#34d399" />,
  'shoes-rainboots-yellow': RainBoots,
  'shoes-skates': Skates,
  'shoes-slippers-pink': Slippers,
}
