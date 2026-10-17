import { useId } from 'react'
import { CANVAS, sparklePath, svgSafeId } from './shared'

const SKIN = '#f8d9c4'
const SKIN_LINE = '#d9a487'

export function Background() {
  const gradientId = `bg-${svgSafeId(useId())}`
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf2f8" />
          <stop offset="1" stopColor="#ede9fe" />
        </linearGradient>
      </defs>
      <rect width={CANVAS.width} height={CANVAS.height} fill={`url(#${gradientId})`} />
      <ellipse cx="150" cy="556" rx="108" ry="16" fill="#e9d5ff" opacity="0.8" />
      <g fill="#fbcfe8">
        <path d={sparklePath(42, 70, 10)} />
        <path d={sparklePath(262, 120, 8)} />
        <path d={sparklePath(36, 300, 7)} />
        <path d={sparklePath(268, 420, 10)} />
        <path d={sparklePath(250, 40, 6)} />
      </g>
    </g>
  )
}

export function Body() {
  const outline = { stroke: SKIN_LINE, strokeWidth: 2 }
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x="124" y="320" width="22" height="226" rx="11" fill={SKIN} {...outline} />
      <rect x="154" y="320" width="22" height="226" rx="11" fill={SKIN} {...outline} />
      <ellipse cx="131" cy="547" rx="15" ry="8" fill={SKIN} {...outline} />
      <ellipse cx="169" cy="547" rx="15" ry="8" fill={SKIN} {...outline} />

      <path d="M114 220 Q94 285 84 350" fill="none" stroke={SKIN_LINE} strokeWidth="22" />
      <path d="M114 220 Q94 285 84 350" fill="none" stroke={SKIN} strokeWidth="18" />
      <path d="M186 220 Q206 285 216 350" fill="none" stroke={SKIN_LINE} strokeWidth="22" />
      <path d="M186 220 Q206 285 216 350" fill="none" stroke={SKIN} strokeWidth="18" />
      <circle cx="83" cy="356" r="11" fill={SKIN} {...outline} />
      <circle cx="217" cy="356" r="11" fill={SKIN} {...outline} />

      <path
        d="M112 212 Q150 202 188 212 Q196 245 190 275 Q186 300 186 336 L114 336 Q114 300 110 275 Q104 245 112 212 Z"
        fill={SKIN}
        {...outline}
      />
      <rect x="140" y="176" width="20" height="36" rx="8" fill={SKIN} />

      <path d="M118 224 Q150 234 182 224 L186 302 L114 302 Z" fill="#ffffff" stroke="#f3cfe0" strokeWidth="2" />
      <path
        d="M113 300 L187 300 L189 352 L153 352 L150 338 L147 352 L111 352 Z"
        fill="#fbe4f0"
        stroke="#f3cfe0"
        strokeWidth="2"
      />

      <circle cx="93" cy="132" r="10" fill={SKIN} {...outline} />
      <circle cx="207" cy="132" r="10" fill={SKIN} {...outline} />
      <ellipse cx="150" cy="125" rx="58" ry="62" fill={SKIN} {...outline} />

      <path d="M118 117 Q128 112 138 117" fill="none" stroke="#a87458" strokeWidth="3" />
      <path d="M162 117 Q172 112 182 117" fill="none" stroke="#a87458" strokeWidth="3" />
      <ellipse cx="128" cy="134" rx="7" ry="9" fill="#3a2a3f" />
      <ellipse cx="172" cy="134" rx="7" ry="9" fill="#3a2a3f" />
      <circle cx="130.5" cy="130" r="2.5" fill="#ffffff" />
      <circle cx="174.5" cy="130" r="2.5" fill="#ffffff" />
      <ellipse cx="114" cy="154" rx="10" ry="6" fill="#f7a1b5" opacity="0.55" />
      <ellipse cx="186" cy="154" rx="10" ry="6" fill="#f7a1b5" opacity="0.55" />
      <path d="M150 142 Q147 149 151 151" fill="none" stroke={SKIN_LINE} strokeWidth="2" />
      <path d="M139 162 Q150 172 161 162" fill="none" stroke="#d6546f" strokeWidth="3" />
    </g>
  )
}
