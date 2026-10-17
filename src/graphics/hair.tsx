import { Mirrored } from './shared'

const CAP = 'M86 142 Q80 60 150 54 Q220 60 214 142 Q206 112 196 100 Q178 112 150 104 Q122 112 104 100 Q94 112 86 142 Z'

function Cap({ fill, line }: { fill: string; line: string }) {
  return (
    <>
      <path d={CAP} fill={fill} stroke={line} strokeWidth="2" />
      <path d="M150 58 Q140 80 128 100 M168 62 Q170 82 180 98" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
    </>
  )
}

export function HairPonytailBrown() {
  const fill = '#8a5a3b'
  const line = '#6b4129'
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M196 74 Q248 72 246 140 Q244 200 222 240 Q226 190 214 150 Q208 112 194 94 Z"
        fill={fill}
        stroke={line}
        strokeWidth="2"
      />
      <path d="M232 110 Q236 160 224 210" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
      <Cap fill={fill} line={line} />
      <circle cx="201" cy="80" r="8" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
    </g>
  )
}

export function HairLongBlonde() {
  const fill = '#f3cf6e'
  const line = '#c99a2e'
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        <path
          d="M86 128 Q72 220 80 312 Q94 302 106 314 Q100 240 104 172 Q98 150 92 138 Z"
          fill={fill}
          stroke={line}
          strokeWidth="2"
        />
        <path d="M88 170 Q84 240 90 300" fill="none" stroke={line} strokeWidth="2" opacity="0.5" />
      </Mirrored>
      <Cap fill={fill} line={line} />
    </g>
  )
}

export function HairBraidsRed() {
  const fill = '#d2652d'
  const line = '#a3461a'
  const links = [158, 180, 202, 224, 246]
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <Mirrored>
        {links.map((cy, i) => (
          <ellipse key={cy} cx={94 - i} cy={cy} rx="12" ry="13" fill={fill} stroke={line} strokeWidth="2" />
        ))}
        <path d="M84 262 L80 282 M90 264 L90 286 M96 262 L100 282" stroke={fill} strokeWidth="5" />
        <path d="M78 258 L90 264 L78 270 Z M102 258 L90 264 L102 270 Z" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
      </Mirrored>
      <Cap fill={fill} line={line} />
    </g>
  )
}

export function HairBobBlack() {
  const fill = '#3b3340'
  const line = '#1f1a24'
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
