/** České skloňování podle počtu: 1 zlaťák, 2–4 zlaťáky, 0 a 5+ zlaťáků. */
export function plural(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count)
  if (abs === 1) return one
  if (abs >= 2 && abs <= 4) return few
  return many
}

export function formatGold(count: number): string {
  return `${count} ${plural(count, 'zlaťák', 'zlaťáky', 'zlaťáků')}`
}
