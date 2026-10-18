const NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1)

/** Ručičkové hodiny: krátká růžová ručička hodin (posouvá se plynule s minutami), dlouhá fialová minut. */
export function ClockFace({ hours, minutes, className }: { hours: number; minutes: number; className?: string }) {
  const hourAngle = (hours % 12) * 30 + minutes * 0.5
  const minuteAngle = minutes * 6
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Ručičkové hodiny">
      <circle cx="60" cy="60" r="54" fill="#ffffff" stroke="#a78bfa" strokeWidth="5" />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="60"
          y1={i % 5 === 0 ? 9 : 10}
          x2="60"
          y2={i % 5 === 0 ? 14 : 12}
          stroke="#c4b5fd"
          strokeWidth={i % 5 === 0 ? 2 : 1}
          transform={`rotate(${i * 6} 60 60)`}
        />
      ))}
      <g fill="#6d28d9" fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, sans-serif">
        {NUMBERS.map((n) => {
          const angle = (n * 30 * Math.PI) / 180
          return (
            <text key={n} x={60 + 40 * Math.sin(angle)} y={60 - 40 * Math.cos(angle)}>
              {n}
            </text>
          )
        })}
      </g>
      <line x1="60" y1="60" x2="60" y2="32" stroke="#db2777" strokeWidth="6" strokeLinecap="round" transform={`rotate(${hourAngle} 60 60)`} />
      <line x1="60" y1="60" x2="60" y2="16" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minuteAngle} 60 60)`} />
      <circle cx="60" cy="60" r="4" fill="#4c1d95" />
    </svg>
  )
}
