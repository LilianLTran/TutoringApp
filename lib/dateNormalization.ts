export function dayKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function minsToDate(day: Date, min: number) {
  const d = new Date(day)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(min)
  return d
}