import type { ReactNode } from 'react'

export const CANVAS = { width: 300, height: 600 } as const
export const CANVAS_VIEWBOX = `0 0 ${CANVAS.width} ${CANVAS.height}`

/** Vykreslí obsah a jeho zrcadlový obraz podle svislé osy panenky (x = 150). */
export function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform={`matrix(-1 0 0 1 ${CANVAS.width} 0)`}>{children}</g>
    </>
  )
}

export function heartPath(cx: number, cy: number, size: number): string {
  const s = size
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.5} ${cy}, ${cx - s * 0.7} ${cy - s * 1.1}, ${cx} ${cy - s * 0.35} C${cx + s * 0.7} ${cy - s * 1.1}, ${cx + s * 1.5} ${cy}, ${cx} ${cy + s * 0.9} Z`
}

export function sparklePath(cx: number, cy: number, size: number): string {
  const s = size
  const k = s * 0.25
  return `M${cx} ${cy - s} L${cx + k} ${cy - k} L${cx + s} ${cy} L${cx + k} ${cy + k} L${cx} ${cy + s} L${cx - k} ${cy + k} L${cx - s} ${cy} L${cx - k} ${cy - k} Z`
}

export function svgSafeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '')
}
