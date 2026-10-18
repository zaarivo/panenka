import type { ComponentType } from 'react'
import { Mirrored, sparklePath } from './shared'

const BODICE = 'M114 222 Q150 234 186 222 L190 306 L110 306 Z'
const ARM = 'M114 220 Q94 285 86 338'

interface Tone {
  fill: string
  line: string
}

function TshirtSkirt({ shirt, skirt, star }: { shirt: Tone; skirt: Tone; star: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 302 L190 302 L206 404 Q150 414 94 404 Z" fill={skirt.fill} stroke={skirt.line} strokeWidth="2" />
      <path d="M130 304 L126 408 M170 304 L174 408" stroke={skirt.line} strokeWidth="2" opacity="0.4" />
      <path
        d="M108 212 Q150 202 192 212 L208 244 L194 254 L188 246 L189 308 L111 308 L112 246 L106 254 L92 244 Z"
        fill={shirt.fill}
        stroke={shirt.line}
        strokeWidth="2"
      />
      <path d="M136 207 Q150 220 164 207" fill="none" stroke={shirt.line} strokeWidth="2" />
      <path d={sparklePath(150, 274, 13)} fill={star} stroke="#eab308" strokeWidth="1.5" />
    </g>
  )
}

function StrapDress({ fill, line, band, button }: Tone & { band: string; button: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 300 Q150 292 190 300 L214 420 Q150 434 86 420 Z" fill={fill} stroke={line} strokeWidth="2" />
      <path d="M132 304 Q128 360 120 426 M168 304 Q172 360 180 426" fill="none" stroke={line} strokeWidth="2" opacity="0.35" />
      <Mirrored>
        <path d="M121 224 L124 208" stroke={line} strokeWidth="5" />
      </Mirrored>
      <path d={BODICE} fill={fill} stroke={line} strokeWidth="2" />
      <rect x="108" y="296" width="84" height="12" rx="6" fill={band} />
      <circle cx="150" cy="302" r="7" fill={button} stroke={line} strokeWidth="2" />
    </g>
  )
}

function DotsDress({ fill, line, dot }: Tone & { dot: string }) {
  const dots: [number, number][] = [
    [130, 330], [166, 322], [112, 372], [148, 360], [184, 366], [126, 398], [164, 396], [196, 400], [102, 404],
    [134, 252], [166, 262], [150, 284],
  ]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 300 Q150 292 190 300 L210 410 Q150 422 90 410 Z" fill={fill} stroke={line} strokeWidth="2" />
      <path d={BODICE} fill={fill} stroke={line} strokeWidth="2" />
      <Mirrored>
        <ellipse cx="110" cy="222" rx="14" ry="11" fill={fill} stroke={line} strokeWidth="2" />
      </Mirrored>
      <g fill={dot}>
        {dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
        ))}
      </g>
      <path d="M120 226 Q150 246 180 226" fill="none" stroke="#ffffff" strokeWidth="5" />
    </g>
  )
}

function BallGown({ bodice, skirt, ruffle, sparkle }: { bodice: Tone; skirt: Tone; ruffle: string; sparkle: string }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 300 Q150 290 190 300 L236 520 Q150 540 64 520 Z" fill={skirt.fill} stroke={skirt.line} strokeWidth="2" />
      <path
        d="M64 520 Q74 506 86 522 Q98 508 110 524 Q122 510 134 526 Q146 512 158 526 Q170 512 182 524 Q194 508 206 522 Q218 506 236 520"
        fill="none"
        stroke={ruffle}
        strokeWidth="5"
      />
      <path d="M132 306 Q120 410 104 524 M168 306 Q180 410 196 524" fill="none" stroke={skirt.line} strokeWidth="2" opacity="0.35" />
      <path d={BODICE} fill={bodice.fill} stroke={bodice.line} strokeWidth="2" />
      <path
        d="M110 224 Q118 214 126 224 Q134 214 142 226 Q150 216 158 226 Q166 214 174 224 Q182 214 190 224"
        fill="none"
        stroke={ruffle}
        strokeWidth="5"
      />
      <g fill={sparkle}>
        <path d={sparklePath(116, 400, 7)} />
        <path d={sparklePath(176, 360, 6)} />
        <path d={sparklePath(150, 460, 8)} />
        <path d={sparklePath(206, 480, 6)} />
        <path d={sparklePath(92, 490, 6)} />
        <path d={sparklePath(150, 266, 6)} />
      </g>
    </g>
  )
}

function Swimsuit() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M116 222 Q150 236 184 222 L188 300 L191 354 L153 354 L150 340 L147 354 L109 354 L112 300 Z"
        fill="#38bdf8"
        stroke="#0284c7"
        strokeWidth="2"
      />
      <Mirrored>
        <path d="M122 224 L126 208" stroke="#0284c7" strokeWidth="5" />
      </Mirrored>
      <path d="M108 298 Q130 312 150 310 Q170 312 192 298 Q196 320 186 330 Q170 322 150 326 Q130 322 114 330 Q104 320 108 298 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
      <g fill="#ffffff" opacity="0.8">
        <circle cx="136" cy="252" r="4" />
        <circle cx="164" cy="266" r="4" />
        <circle cx="146" cy="286" r="4" />
      </g>
    </g>
  )
}

function Pants({ fill, line }: Tone) {
  return (
    <>
      <Mirrored>
        <path d="M108 300 L150 300 L150 316 L148 512 L122 512 Q110 400 108 300 Z" fill={fill} stroke={line} strokeWidth="2" />
      </Mirrored>
      <rect x="106" y="296" width="88" height="12" rx="4" fill={fill} stroke={line} strokeWidth="2" />
    </>
  )
}

function Tracksuit() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Pants fill="#f472b6" line="#be185d" />
      <Mirrored>
        <path d="M128 330 L126 508" stroke="#ffffff" strokeWidth="4" />
        <path d={ARM} fill="none" stroke="#be185d" strokeWidth="24" />
        <path d={ARM} fill="none" stroke="#f9a8d4" strokeWidth="20" />
      </Mirrored>
      <path d="M108 212 Q150 202 192 212 L190 310 L110 310 Z" fill="#f9a8d4" stroke="#be185d" strokeWidth="2" />
      <path d="M150 212 L150 308" stroke="#be185d" strokeWidth="2" />
      <path d="M130 206 Q150 226 170 206" fill="none" stroke="#be185d" strokeWidth="3" />
    </g>
  )
}

function JeansTop() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Pants fill="#60a5fa" line="#1d4ed8" />
      <Mirrored>
        <path d="M136 320 L136 340" stroke="#1d4ed8" strokeWidth="2" opacity="0.6" />
      </Mirrored>
      <path
        d="M108 212 Q150 202 192 212 L208 244 L194 254 L188 246 L189 304 L111 304 L112 246 L106 254 L92 244 Z"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <path d="M136 207 Q150 220 164 207" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <path d="M150 262 C142 254, 134 262, 150 274 C166 262, 158 254, 150 262 Z" fill="#f472b6" />
    </g>
  )
}

export const DRESS_ASSETS: Readonly<Record<string, ComponentType>> = {
  'dress-tshirt-blue': () => (
    <TshirtSkirt shirt={{ fill: '#93c5fd', line: '#3b82f6' }} skirt={{ fill: '#c4b5fd', line: '#8b5cf6' }} star="#fef08a" />
  ),
  'dress-tshirt-green': () => (
    <TshirtSkirt shirt={{ fill: '#86efac', line: '#16a34a' }} skirt={{ fill: '#f9a8d4', line: '#db2777' }} star="#ffffff" />
  ),
  'dress-pink': () => <StrapDress fill="#f9a8d4" line="#ec4899" band="#ec4899" button="#fbcfe8" />,
  'dress-blue': () => <StrapDress fill="#93c5fd" line="#2563eb" band="#2563eb" button="#dbeafe" />,
  'dress-yellow-dots': () => <DotsDress fill="#fde68a" line="#f59e0b" dot="#ffffff" />,
  'dress-flowers': () => <DotsDress fill="#ffffff" line="#f472b6" dot="#f472b6" />,
  'dress-ball-purple': () => (
    <BallGown bodice={{ fill: '#c4b5fd', line: '#8b5cf6' }} skirt={{ fill: '#a78bfa', line: '#7c3aed' }} ruffle="#ede9fe" sparkle="#fef3c7" />
  ),
  'dress-princess-pink': () => (
    <BallGown bodice={{ fill: '#fbcfe8', line: '#db2777' }} skirt={{ fill: '#f9a8d4', line: '#db2777' }} ruffle="#ffffff" sparkle="#fde047" />
  ),
  'dress-swimsuit': Swimsuit,
  'dress-tracksuit': Tracksuit,
  'dress-jeans-top': JeansTop,
}
