import { Mirrored, sparklePath } from './shared'

const BODICE = 'M114 222 Q150 234 186 222 L190 306 L110 306 Z'

export function DressTshirtBlue() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 302 L190 302 L206 404 Q150 414 94 404 Z" fill="#c4b5fd" stroke="#8b5cf6" strokeWidth="2" />
      <path d="M130 304 L126 408 M170 304 L174 408" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" />
      <path
        d="M108 212 Q150 202 192 212 L208 244 L194 254 L188 246 L189 308 L111 308 L112 246 L106 254 L92 244 Z"
        fill="#93c5fd"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <path d="M136 207 Q150 220 164 207" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d={sparklePath(150, 274, 13)} fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
    </g>
  )
}

export function DressPink() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 300 Q150 292 190 300 L214 420 Q150 434 86 420 Z" fill="#f9a8d4" stroke="#ec4899" strokeWidth="2" />
      <path d="M132 304 Q128 360 120 426 M168 304 Q172 360 180 426" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.35" />
      <Mirrored>
        <path d="M121 224 L124 208" stroke="#ec4899" strokeWidth="5" />
      </Mirrored>
      <path d={BODICE} fill="#f9a8d4" stroke="#ec4899" strokeWidth="2" />
      <rect x="108" y="296" width="84" height="12" rx="6" fill="#ec4899" />
      <circle cx="150" cy="302" r="7" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
    </g>
  )
}

export function DressYellowDots() {
  const dots: [number, number][] = [
    [130, 330], [166, 322], [112, 372], [148, 360], [184, 366], [126, 398], [164, 396], [196, 400], [102, 404],
    [134, 252], [166, 262], [150, 284],
  ]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 300 Q150 292 190 300 L210 410 Q150 422 90 410 Z" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
      <path d={BODICE} fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
      <Mirrored>
        <ellipse cx="110" cy="222" rx="14" ry="11" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
      </Mirrored>
      <g fill="#ffffff">
        {dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
        ))}
      </g>
      <path d="M120 226 Q150 246 180 226" fill="none" stroke="#ffffff" strokeWidth="5" />
    </g>
  )
}

export function DressBallPurple() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M110 300 Q150 290 190 300 L236 520 Q150 540 64 520 Z" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2" />
      <path
        d="M64 520 Q74 506 86 522 Q98 508 110 524 Q122 510 134 526 Q146 512 158 526 Q170 512 182 524 Q194 508 206 522 Q218 506 236 520"
        fill="none"
        stroke="#ddd6fe"
        strokeWidth="5"
      />
      <path d="M132 306 Q120 410 104 524 M168 306 Q180 410 196 524" fill="none" stroke="#7c3aed" strokeWidth="2" opacity="0.35" />
      <path d={BODICE} fill="#c4b5fd" stroke="#8b5cf6" strokeWidth="2" />
      <path
        d="M110 224 Q118 214 126 224 Q134 214 142 226 Q150 216 158 226 Q166 214 174 224 Q182 214 190 224"
        fill="none"
        stroke="#ede9fe"
        strokeWidth="5"
      />
      <g fill="#fef3c7">
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
